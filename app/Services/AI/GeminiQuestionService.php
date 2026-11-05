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
                $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";
                $response = Http::timeout(45)->post($endpoint, [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.6,
                        'responseMimeType' => 'application/json',
                    ],
                ]);

                if (! $response->successful()) {
                    throw new \RuntimeException('Gagal menghubungi Google Gemini API (HTTP '.$response->status().').');
                }

                $body = $response->json();
                $rawText = $body['candidates'][0]['content']['parts'][0]['text'] ?? '';
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

    protected function buildPrompt(Chapter $chapter, ?Material $material, int $count, string $difficulty): string
    {
        $materialContext = $material
            ? "Materi spesifik: {$material->title}\nRingkasan isi: ".strip_tags((string) ($material->summary ?: $material->content))
            : "Seluruh materi pada BAB {$chapter->number}: {$chapter->title}";

        return <<<PROMPT
Anda adalah guru senior Bahasa Indonesia SMA Kelas XII (Kurikulum Merdeka).
Buat tepat {$count} soal pilihan ganda (5 opsi: A, B, C, D, E) dengan tingkat kesulitan "{$difficulty}".
BAB {$chapter->number}: {$chapter->title}
{$materialContext}

Kembalikan HANYA JSON array dengan skema berikut:
[
  {
    "stem": "Pertanyaan soal dalam Bahasa Indonesia baku",
    "stimulus": "Kutipan teks bacaan/ilustrasi pendukung soal (opsional, boleh string kosong)",
    "options": {
      "A": "Pilihan A",
      "B": "Pilihan B",
      "C": "Pilihan C",
      "D": "Pilihan D",
      "E": "Pilihan E"
    },
    "correct_label": "A",
    "explanation": "Pembahasan lengkap mengapa jawaban tersebut benar",
    "difficulty": "{$difficulty}",
    "category": "Judul materi terkait"
  }
]
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
