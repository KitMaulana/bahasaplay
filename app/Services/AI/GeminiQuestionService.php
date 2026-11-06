<?php

namespace App\Services\AI;

use App\Models\ActivityLog;
use App\Models\AiGeneration;
use App\Models\AiGenerationItem;
use App\Models\Chapter;
use App\Models\Material;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class GeminiQuestionService
{
    public function generateQuestions(
        User $teacher,
        Chapter $chapter,
        ?Material $material,
        int $count,
        string $difficulty
    ): AiGeneration {
        $count = min(20, max(1, $count));
        $model = (string) config('services.gemini.model', 'gemini-2.5-flash');
        $apiKey = (string) config('services.gemini.key', '');

        $prompt = $this->buildPrompt($chapter, $material, $count, $difficulty);

        $generation = AiGeneration::create([
            'teacher_id' => $teacher->id,
            'chapter_id' => $chapter->id,
            'material_id' => $material?->id,
            'requested_count' => $count,
            'difficulty' => $difficulty,
            'model' => $model,
            'status' => 'pending',
            'prompt_hash' => hash('sha256', $prompt),
        ]);

        try {
            if (empty($apiKey)) {
                // Jika GEMINI_API_KEY belum diisi di .env, gunakan generator kontekstual lokal bertanda draf
                $parsedItems = $this->buildContextualDrafts($chapter, $material, $count, $difficulty);
            } else {
                // Pembuatan 10–20 soal bisa butuh >30 detik; longgarkan batas waktu PHP untuk permintaan ini.
                @set_time_limit(180);

                $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";
                // Kunci dikirim lewat header (bukan query string) agar tidak ikut tercatat di log/URL error.
                $response = Http::timeout(150)
                    ->withHeaders(['x-goog-api-key' => $apiKey])
                    ->retry(2, 1500, fn ($e) => $e instanceof \Illuminate\Http\Client\ConnectionException
                        || ($e instanceof \Illuminate\Http\Client\RequestException && in_array($e->response->status(), [429, 500, 503], true)), throw: false)
                    ->post($endpoint, [
                        'contents' => [
                            [
                                'role' => 'user',
                                'parts' => [
                                    ['text' => $prompt],
                                ],
                            ],
                        ],
                        'generationConfig' => [
                            'temperature' => 0.7,
                            'responseMimeType' => 'application/json',
                            'responseSchema' => $this->responseSchema(),
                            'maxOutputTokens' => 16384,
                            'thinkingConfig' => ['thinkingBudget' => 1024],
                        ],
                    ]);

                if (! $response->successful()) {
                    throw new \RuntimeException($this->friendlyHttpError($response->status(), (string) ($response->json('error.message') ?? '')));
                }

                $body = $response->json();
                $parts = $body['candidates'][0]['content']['parts'] ?? [];
                // Abaikan bagian "thought" (bila ada) dan gabungkan teks jawaban
                $rawText = collect($parts)->reject(fn ($p) => ! empty($p['thought']))->pluck('text')->implode('');
                if ($rawText === '') {
                    $reason = $body['candidates'][0]['finishReason'] ?? ($body['promptFeedback']['blockReason'] ?? 'tidak diketahui');
                    throw new \RuntimeException("Gemini tidak mengembalikan soal (alasan: {$reason}). Coba kurangi jumlah soal atau ulangi.");
                }
                $tokensUsed = $body['usageMetadata']['totalTokenCount'] ?? null;

                $parsedItems = $this->parseAndValidateJson($rawText, $difficulty, $material?->title ?? $chapter->title);
                $generation->tokens_used = $tokensUsed;
            }

            foreach ($parsedItems as $itemPayload) {
                AiGenerationItem::create([
                    'ai_generation_id' => $generation->id,
                    'payload' => $itemPayload,
                    'status' => 'draft',
                ]);
            }

            $generation->status = 'done';
            $generation->save();

            ActivityLog::record($teacher->id, 'ai.questions.generated', 'AiGeneration', $generation->id, [
                'chapter_id' => $chapter->id,
                'count' => count($parsedItems),
            ]);

            return $generation->load(['items', 'chapter', 'material']);
        } catch (\Throwable $e) {
            $generation->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
            ]);

            throw ValidationException::withMessages([
                'gemini' => ['Proses pembuatan soal AI gagal: '.$e->getMessage()],
            ]);
        }
    }

    public function approveItem(AiGenerationItem $item, array $overrides, User $teacher): Question
    {
        return DB::transaction(function () use ($item, $overrides, $teacher) {
            $generation = $item->generation;
            $payload = array_merge($item->payload ?? [], $overrides);

            $options = $payload['options'] ?? [];
            $correctLabel = strtoupper(trim((string) ($payload['correct_label'] ?? 'A')));

            if (count($options) !== 5 || ! in_array($correctLabel, ['A', 'B', 'C', 'D', 'E'], true)) {
                throw ValidationException::withMessages([
                    'options' => ['Soal wajib memiliki tepat 5 pilihan (A–E) dan 1 kunci jawaban.'],
                ]);
            }

            $question = Question::create([
                'chapter_id' => $generation->chapter_id,
                'material_id' => $generation->material_id,
                'stem' => $payload['stem'],
                'stimulus' => $payload['stimulus'] ?? null,
                'difficulty' => $payload['difficulty'] ?? $generation->difficulty,
                'category' => $payload['category'] ?? ($generation->material?->title ?? 'AI Generated'),
                'explanation' => $payload['explanation'] ?? 'Pembahasan telah diverifikasi oleh guru.',
                'source' => 'ai',
                'status' => 'published',
                'created_by' => $teacher->id,
            ]);

            foreach (['A', 'B', 'C', 'D', 'E'] as $label) {
                QuestionOption::create([
                    'question_id' => $question->id,
                    'label' => $label,
                    'text' => (string) ($options[$label] ?? ''),
                    'is_correct' => $label === $correctLabel,
                ]);
            }

            $item->update([
                'payload' => $payload,
                'status' => 'approved',
                'question_id' => $question->id,
            ]);

            ActivityLog::record($teacher->id, 'ai.question.approved', 'Question', $question->id, [
                'chapter_id' => $question->chapter_id,
            ]);

            return $question->load('options');
        });
    }

    /** Status integrasi Gemini untuk ditampilkan di panel guru (tanpa membocorkan kunci). */
    public function status(): array
    {
        return [
            'enabled' => (string) config('services.gemini.key', '') !== '',
            'model' => (string) config('services.gemini.model', 'gemini-2.5-flash'),
        ];
    }

    protected function friendlyHttpError(int $status, string $detail): string
    {
        $msg = match (true) {
            $status === 400 => 'Permintaan ke Gemini ditolak (HTTP 400). Periksa GEMINI_API_KEY dan GEMINI_MODEL di .env.',
            in_array($status, [401, 403], true) => 'Kunci Gemini tidak valid atau tidak punya izin (HTTP '.$status.'). Periksa GEMINI_API_KEY di .env.',
            $status === 404 => 'Model Gemini tidak ditemukan (HTTP 404). Periksa GEMINI_MODEL di .env.',
            $status === 429 => 'Kuota Gemini sedang habis atau terlalu banyak permintaan (HTTP 429). Tunggu sebentar lalu coba lagi.',
            $status >= 500 => 'Server Gemini sedang sibuk (HTTP '.$status.'). Coba lagi beberapa saat lagi.',
            default => 'Gagal menghubungi Google Gemini API (HTTP '.$status.').',
        };

        return $detail !== '' ? $msg.' Detail: '.mb_substr($detail, 0, 160) : $msg;
    }

    /** Skema keluaran terstruktur agar Gemini selalu mengembalikan JSON yang sesuai. */
    protected function responseSchema(): array
    {
        $str = ['type' => 'STRING'];

        return [
            'type' => 'ARRAY',
            'items' => [
                'type' => 'OBJECT',
                'properties' => [
                    'stem' => $str,
                    'stimulus' => $str,
                    'options' => [
                        'type' => 'OBJECT',
                        'properties' => ['A' => $str, 'B' => $str, 'C' => $str, 'D' => $str, 'E' => $str],
                        'required' => ['A', 'B', 'C', 'D', 'E'],
                    ],
                    'correct_label' => ['type' => 'STRING', 'enum' => ['A', 'B', 'C', 'D', 'E']],
                    'explanation' => $str,
                    'difficulty' => ['type' => 'STRING', 'enum' => ['easy', 'medium', 'hard']],
                    'category' => $str,
                ],
                'required' => ['stem', 'stimulus', 'options', 'correct_label', 'explanation', 'difficulty', 'category'],
                'propertyOrdering' => ['stimulus', 'stem', 'options', 'correct_label', 'explanation', 'difficulty', 'category'],
            ],
        ];
    }

    protected function buildPrompt(Chapter $chapter, ?Material $material, int $count, string $difficulty): string
    {
        $clean = fn ($html) => trim(preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags((string) $html))));

        if ($material) {
            $materialContext = "Materi spesifik: {$material->title}\nIsi materi:\n".mb_substr($clean($material->content ?: $material->summary), 0, 6000);
        } else {
            $materials = $chapter->materials()->get(['title', 'summary', 'content']);
            $materialContext = "Cakupan: seluruh materi BAB {$chapter->number}.\n"
                .($chapter->description ? 'Deskripsi BAB: '.$clean($chapter->description)."\n" : '')
                .$materials->map(fn ($m) => '- '.$m->title.': '.mb_substr($clean($m->summary ?: $m->content), 0, 900))->implode("\n");
        }

        $existing = $chapter->questions()->latest()->limit(25)->pluck('stem')
            ->map(fn ($q) => '- '.mb_substr($clean($q), 0, 140))->implode("\n");
        $existingBlock = $existing !== '' ? "\nSoal yang SUDAH ADA di bank soal (jangan membuat soal yang sama/mirip):\n{$existing}\n" : '';

        $level = [
            'easy' => 'Mudah — mengingat & memahami (C1–C2): definisi, ciri, struktur dasar.',
            'medium' => 'Sedang — menerapkan & menganalisis (C3–C4): identifikasi unsur dalam kutipan teks, kaidah kebahasaan.',
            'hard' => 'Sulit/HOTS — menganalisis, mengevaluasi, mencipta (C4–C6): wajib memakai stimulus teks, menilai/memperbaiki kalimat, menarik simpulan.',
        ][$difficulty] ?? $difficulty;

        return <<<PROMPT
Anda adalah guru senior Bahasa Indonesia SMA Kelas XII (Kurikulum Merdeka) yang ahli menyusun soal asesmen.
Buat tepat {$count} soal pilihan ganda (5 opsi: A, B, C, D, E).
Tingkat kesulitan: "{$difficulty}" → {$level}
BAB {$chapter->number}: {$chapter->title}
{$materialContext}
{$existingBlock}
Aturan penulisan soal:
1. Gunakan Bahasa Indonesia baku sesuai EYD V dan KBBI; konteks dekat dengan kehidupan siswa SMA di Banten bila relevan.
2. Hanya SATU jawaban yang benar; pengecoh (distraktor) masuk akal, homogen, dan panjangnya setara dengan kunci.
3. Jangan gunakan opsi "semua benar", "semua salah", atau "A dan B benar".
4. Sebar kunci jawaban secara acak dan merata di A–E (jangan didominasi satu huruf).
5. Untuk soal yang membutuhkan teks, tulis kutipan/teks pendek orisinal di "stimulus" (boleh string kosong jika tidak perlu). Jangan mengulang stimulus di "stem".
6. "explanation" menjelaskan alasan kunci benar DAN mengapa pengecoh utama salah (2–4 kalimat).
7. "category" diisi judul materi/subtopik yang diukur.
8. Jangan membuat materi di luar cakupan di atas.
PROMPT;
    }

    public function parseAndValidateJson(string $rawText, string $defaultDifficulty, string $defaultCategory): array
    {
        $clean = trim($rawText);
        if (str_starts_with($clean, '```')) {
            $clean = preg_replace('/^```(?:json)?\s*|\s*```$/m', '', $clean);
        }

        $decoded = json_decode(trim((string) $clean), true);
        if (! is_array($decoded)) {
            throw new \RuntimeException('Respons AI bukan format JSON yang valid.');
        }

        $items = isset($decoded['questions']) && is_array($decoded['questions'])
            ? $decoded['questions']
            : $decoded;

        $validated = [];
        foreach ($items as $row) {
            if (! is_array($row) || empty($row['stem']) || empty($row['options']) || ! is_array($row['options'])) {
                continue;
            }

            $opts = [];
            foreach (['A', 'B', 'C', 'D', 'E'] as $label) {
                if (empty($row['options'][$label])) {
                    throw new \RuntimeException("Opsi {$label} kosong pada salah satu soal AI.");
                }
                $opts[$label] = (string) $row['options'][$label];
            }

            $correctLabel = strtoupper(trim((string) ($row['correct_label'] ?? 'A')));
            if (! in_array($correctLabel, ['A', 'B', 'C', 'D', 'E'], true)) {
                throw new \RuntimeException('Kunci jawaban AI harus salah satu dari A, B, C, D, atau E.');
            }

            $validated[] = [
                'stem' => (string) $row['stem'],
                'stimulus' => (string) ($row['stimulus'] ?? ''),
                'options' => $opts,
                'correct_label' => $correctLabel,
                'explanation' => (string) ($row['explanation'] ?? 'Pembahasan sesuai kaidah Bahasa Indonesia Kelas XII.'),
                'difficulty' => (string) ($row['difficulty'] ?? $defaultDifficulty),
                'category' => (string) ($row['category'] ?? $defaultCategory),
            ];
        }

        if (empty($validated)) {
            throw new \RuntimeException('Tidak ada butir soal valid yang dihasilkan.');
        }

        return $validated;
    }

    protected function buildContextualDrafts(
        Chapter $chapter,
        ?Material $material,
        int $count,
        string $difficulty
    ): array {
        $topic = $material ? $material->title : $chapter->title;
        $summary = $material ? strip_tags((string) ($material->summary ?: $material->content)) : ($chapter->description ?: $topic);
        $items = [];

        $templates = [
            [
                'stem' => "Manakah pernyataan yang paling tepat menjelaskan konsep utama dari materi \"{$topic}\" pada pembelajaran Bahasa Indonesia Kelas XII?",
                'options' => [
                    'A' => "Menyajikan informasi secara sistematis, objektif, dan sesuai kaidah kebahasaan pada konteks {$topic}.",
                    'B' => 'Menggunakan bahasa percakapan sehari-hari tanpa memperhatikan struktur baku.',
                    'C' => 'Menghilangkan unsur struktur utama agar teks menjadi lebih singkat.',
                    'D' => 'Mengutamakan opini pribadi tanpa didukung data atau fakta yang relevan.',
                    'E' => 'Mengabaikan ketepatan ejaan (EYD V) dalam penyusunan kalimat.',
                ],
                'correct_label' => 'A',
                'explanation' => "Dalam materi {$topic}, ketepatan struktur dan penggunaan kaidah Bahasa Indonesia baku merupakan ciri utama yang wajib dipahami siswa kelas XII.",
            ],
            [
                'stem' => "Perhatikan aspek kebahasaan pada materi \"{$topic}\". Unsur manakah yang wajib diperhatikan agar teks yang disusun efektif dan komunikatif?",
                'options' => [
                    'A' => 'Penggunaan kalimat ambigu dan bertele-tele.',
                    'B' => "Ketepatan diksi, kejelasan struktur kalimat, dan kesesuaian dengan tujuan penulisan {$topic}.",
                    'C' => 'Pemakaian singkatan tidak resmi di dalam paragraf utama.',
                    'D' => 'Penyusunan urutan gagasan secara acak tanpa kohesi.',
                    'E' => 'Penggunaan kata tidak baku agar terkesan santai.',
                ],
                'correct_label' => 'B',
                'explanation' => "Diksi yang tepat, kalimat efektif, dan kesesuaian tujuan merupakan syarat utama dalam menyusun teks terkait {$topic}.",
            ],
            [
                'stem' => "Dalam menganalisis teks yang berkaitan dengan \"{$topic}\", langkah kritis pertama yang perlu dilakukan oleh siswa adalah...",
                'options' => [
                    'A' => 'Menghafal seluruh paragraf tanpa memahami maknanya.',
                    'B' => 'Mengabaikan konteks situasi dan tujuan penulisan teks.',
                    'C' => "Mengidentifikasi tujuan, struktur utama, serta pokok informasi dalam konteks {$topic}.",
                    'D' => 'Mengubah seluruh isi teks menjadi kalimat pasif.',
                    'E' => 'Menilai teks hanya dari panjang pendeknya jumlah halaman.',
                ],
                'correct_label' => 'C',
                'explanation' => "Analisis teks pada materi {$topic} selalu diawali dengan mengidentifikasi tujuan, struktur, dan pokok informasi.",
            ],
        ];

        for ($i = 0; $i < $count; $i++) {
            $tpl = $templates[$i % count($templates)];
            $items[] = [
                'stem' => $tpl['stem'].($i >= count($templates) ? ' (Variasi #'.($i + 1).')' : ''),
                'stimulus' => mb_substr($summary, 0, 260),
                'options' => $tpl['options'],
                'correct_label' => $tpl['correct_label'],
                'explanation' => $tpl['explanation'],
                'difficulty' => $difficulty,
                'category' => $topic,
            ];
        }

        return $items;
    }
}
