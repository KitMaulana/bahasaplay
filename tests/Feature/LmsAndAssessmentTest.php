<?php

namespace Tests\Feature;

use App\Models\Attempt;
use App\Models\Chapter;
use App\Models\Exam;
use App\Models\QuestionOption;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Sleep;
use Tests\TestCase;

class LmsAndAssessmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_teacher_can_edit_bab_5_analisis_novel_and_add_material(): void
    {
        $teacher = User::where('username', 'bangkit')->firstOrFail();
        $bab5 = Chapter::where('number', 5)->firstOrFail();

        // BAB 5 kini berisi Analisis Novel (Kabupaten Pandeglang) dan sudah terbit
        $this->assertEquals('published', $bab5->status);
        $this->assertEquals('Analisis Novel', $bab5->title);
        $this->assertGreaterThanOrEqual(10, $bab5->questions()->count());

        // Guru tetap dapat mengelola BAB 5 secara dinamis (BAB tidak di-hardcode)
        $this->actingAs($teacher)
            ->putJson("/api/v1/teacher/chapters/{$bab5->id}", [
                'title' => 'Analisis Novel Remaja',
                'description' => 'Menganalisis sudut pandang, perwatakan, dan alur novel remaja.',
                'setting_location' => 'Kabupaten Pandeglang',
                'kkm' => 75,
                'status' => 'published',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.title', 'Analisis Novel Remaja')
            ->assertJsonPath('data.status', 'published');

        $this->actingAs($teacher)
            ->postJson("/api/v1/teacher/chapters/{$bab5->id}/materials", [
                'title' => 'Membandingkan Dua Penggalan Novel',
                'summary' => 'Ringkasan perbandingan novel.',
                'content' => '<p>Isi materi perbandingan novel.</p>',
                'is_required' => true,
                'status' => 'published',
            ])
            ->assertStatus(201);
    }

    public function test_bab_6_surat_kuasa_is_published_with_questions(): void
    {
        $bab6 = Chapter::where('number', 6)->with('materials')->firstOrFail();

        $this->assertEquals('published', $bab6->status);
        $this->assertEquals('Surat Resmi dan Surat Kuasa', $bab6->title);
        $this->assertCount(3, $bab6->materials);
        $this->assertGreaterThanOrEqual(10, $bab6->questions()->count());
        $this->assertTrue(Exam::where('chapter_id', $bab6->id)->exists());
    }

    public function test_full_learning_practice_and_exam_flow_with_anti_cheat_and_remedial_best_score(): void
    {
        $studentA = User::where('username', '0081234501')->firstOrFail();
        $studentB = User::where('username', '0081234502')->firstOrFail();
        $teacher = User::where('username', 'bangkit')->firstOrFail();
        $bab1 = Chapter::where('number', 1)->with('materials')->firstOrFail();
        $exam1 = Exam::where('chapter_id', $bab1->id)->firstOrFail();

        // 1. Sebelum semua materi wajib dibaca, latihan soal masih terkunci
        $this->actingAs($studentA)
            ->postJson("/api/v1/student/chapters/{$bab1->id}/practice/start")
            ->assertStatus(422);

        // 2. Siswa membaca seluruh materi wajib pada BAB 1
        foreach ($bab1->materials as $material) {
            $this->actingAs($studentA)
                ->postJson("/api/v1/student/materials/{$material->id}/complete")
                ->assertStatus(200);
        }

        // 3. Mulai latihan soal — pastikan kunci jawaban TIDAK bocor di payload
        $startRes = $this->actingAs($studentA)
            ->postJson("/api/v1/student/chapters/{$bab1->id}/practice/start")
            ->assertStatus(201);

        $attemptData = $startRes->json('data');
        $attemptId = $attemptData['id'];
        $firstQ = $attemptData['questions'][0];

        $this->assertArrayNotHasKey('correct_label', $firstQ);
        $this->assertArrayNotHasKey('explanation', $firstQ);
        $this->assertArrayNotHasKey('is_correct', $firstQ);

        // 4. Siswa B tidak boleh mengakses atau menjawab attempt milik Siswa A
        $this->actingAs($studentB)
            ->getJson("/api/v1/student/attempts/{$attemptId}")
            ->assertStatus(403);

        // 5. Siswa A menjawab semua soal dengan benar (>= 75) untuk membuka Zona Ujian
        $attemptModel = Attempt::with('attemptQuestions.question.options')->findOrFail($attemptId);
        foreach ($attemptModel->attemptQuestions as $aq) {
            $correctOption = $aq->question->options->firstWhere('is_correct', true);
            $correctLabel = array_search($correctOption->id, $aq->option_map, true);

            $this->actingAs($studentA)
                ->putJson("/api/v1/student/attempts/{$attemptId}/answers", [
                    'attempt_question_id' => $aq->id,
                    'selected_label' => $correctLabel,
                ])
                ->assertStatus(200);
        }

        $submitRes = $this->actingAs($studentA)
            ->postJson("/api/v1/student/attempts/{$attemptId}/submit")
            ->assertStatus(200);

        $this->assertEquals(100, $submitRes->json('data.score'));
        $this->assertTrue($submitRes->json('data.passed'));
        // Setelah submit, kunci & pembahasan boleh tampil
        $this->assertArrayHasKey('correct_label', $submitRes->json('data.questions.0'));

        // 6. Mulai Ujian Resmi #1 (hanya jawab 6 dari 10 benar = nilai 60)
        $examStart1 = $this->actingAs($studentA)
            ->postJson("/api/v1/student/exams/{$exam1->id}/start")
            ->assertStatus(201);

        $examAttempt1 = Attempt::with('attemptQuestions.question.options')
            ->findOrFail($examStart1->json('data.id'));

        foreach ($examAttempt1->attemptQuestions as $idx => $aq) {
                $targetOpt = $idx < 6
                    ? $aq->question->options->firstWhere('is_correct', true)
                    : $aq->question->options->firstWhere('is_correct', false);
                $label = array_search($targetOpt->id, $aq->option_map, true);

                $this->actingAs($studentA)
                    ->putJson("/api/v1/student/attempts/{$examAttempt1->id}/answers", [
                        'attempt_question_id' => $aq->id,
                        'selected_label' => $label,
                    ])
                    ->assertStatus(200);
        }

        $this->actingAs($studentA)
            ->postJson("/api/v1/student/attempts/{$examAttempt1->id}/submit")
            ->assertStatus(200)
            ->assertJsonPath('data.score', 60);

        // 7. Percobaan ke-2 ditolak sebelum ada izin remedial dari Guru
        $this->actingAs($studentA)
            ->postJson("/api/v1/student/exams/{$exam1->id}/start")
            ->assertStatus(422);

        // 8. Guru memberikan izin remedial (+1 kesempatan) dan Siswa A mendapat nilai 90
        $this->actingAs($teacher)
            ->postJson("/api/v1/teacher/exams/{$exam1->id}/remedial", [
                'user_id' => $studentA->id,
                'extra_attempts' => 1,
            ])
            ->assertStatus(200);

        $examStart2 = $this->actingAs($studentA)
            ->postJson("/api/v1/student/exams/{$exam1->id}/start")
            ->assertStatus(201);

        $examAttempt2 = Attempt::with('attemptQuestions.question.options')
            ->findOrFail($examStart2->json('data.id'));

        foreach ($examAttempt2->attemptQuestions as $idx => $aq) {
            $targetOpt = $idx < 9
                ? $aq->question->options->firstWhere('is_correct', true)
                : $aq->question->options->firstWhere('is_correct', false);
            $label = array_search($targetOpt->id, $aq->option_map, true);

            $this->actingAs($studentA)
                ->putJson("/api/v1/student/attempts/{$examAttempt2->id}/answers", [
                    'attempt_question_id' => $aq->id,
                    'selected_label' => $label,
                ])
                ->assertStatus(200);
        }

        $this->actingAs($studentA)
            ->postJson("/api/v1/student/attempts/{$examAttempt2->id}/submit")
            ->assertStatus(200)
            ->assertJsonPath('data.score', 90);

        // Pastikan nilai ujian resmi di dashboard mengambil NILAI TERTINGGI (90)
        $dash = $this->actingAs($studentA)
            ->getJson('/api/v1/student/dashboard')
            ->assertStatus(200);

        $bab1Card = collect($dash->json('data.chapters'))->firstWhere('number', 1);
        $this->assertEquals(90, $bab1Card['exam_score']);
    }

    public function test_expired_exam_attempt_rejects_late_answers_and_auto_finalizes(): void
    {
        $student = User::where('username', '0081234503')->firstOrFail();
        $bab1 = Chapter::where('number', 1)->with('materials')->firstOrFail();
        $exam1 = Exam::where('chapter_id', $bab1->id)->firstOrFail();

        foreach ($bab1->materials as $m) {
            $this->actingAs($student)->postJson("/api/v1/student/materials/{$m->id}/complete");
        }

        // Lulus latihan
        $pRes = $this->actingAs($student)->postJson("/api/v1/student/chapters/{$bab1->id}/practice/start");
        $pAttempt = Attempt::with('attemptQuestions.question.options')->findOrFail($pRes->json('data.id'));
        foreach ($pAttempt->attemptQuestions as $aq) {
            $correctOption = $aq->question->options->firstWhere('is_correct', true);
            $label = array_search($correctOption->id, $aq->option_map, true);
            $this->actingAs($student)->putJson("/api/v1/student/attempts/{$pAttempt->id}/answers", [
                'attempt_question_id' => $aq->id,
                'selected_label' => $label,
            ]);
        }
        $this->actingAs($student)->postJson("/api/v1/student/attempts/{$pAttempt->id}/submit");

        // Mulai ujian lalu buat waktu kedaluwarsa lewat
        $eRes = $this->actingAs($student)->postJson("/api/v1/student/exams/{$exam1->id}/start");
        $eAttempt = Attempt::with('attemptQuestions')->findOrFail($eRes->json('data.id'));
        $eAttempt->update(['expires_at' => now()->subMinute()]);

        // Kirim jawaban setelah waktu habis -> harus ditolak 422 & status menjadi expired
        $this->actingAs($student)
            ->putJson("/api/v1/student/attempts/{$eAttempt->id}/answers", [
                'attempt_question_id' => $eAttempt->attemptQuestions->first()->id,
                'selected_label' => 'A',
            ])
            ->assertStatus(422);

        $this->assertEquals('expired', $eAttempt->fresh()->status);
    }

    public function test_ai_question_generator_saves_draft_and_publishes_only_after_approval(): void
    {
        config(['services.gemini.key' => 'test-secret-gemini-key']);

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                [
                                    'text' => json_encode([
                                        [
                                            'stem' => 'Apa fungsi utama surat lamaran pekerjaan?',
                                            'stimulus' => 'Kutipan: Saya bermaksud melamar posisi staf administrasi di perusahaan Bapak.',
                                            'options' => [
                                                'A' => 'Mengajukan permohonan resmi untuk mengisi posisi pekerjaan.',
                                                'B' => 'Menceritakan kisah liburan.',
                                                'C' => 'Menjual barang dagangan.',
                                                'D' => 'Menulis puisi bebas.',
                                                'E' => 'Mengkritik film.',
                                            ],
                                            'correct_label' => 'A',
                                            'explanation' => 'Surat lamaran pekerjaan berfungsi melamar pekerjaan secara resmi.',
                                            'difficulty' => 'medium',
                                            'category' => 'Surat Lamaran',
                                        ],
                                    ]),
                                ],
                            ],
                        ],
                    ],
                ],
                'usageMetadata' => ['totalTokenCount' => 240],
            ], 200),
        ]);

        $teacher = User::where('username', 'bangkit')->firstOrFail();
        $bab1 = Chapter::where('number', 1)->firstOrFail();

        $genRes = $this->actingAs($teacher)
            ->postJson('/api/v1/teacher/ai/questions/generate', [
                'chapter_id' => $bab1->id,
                'count' => 1,
                'difficulty' => 'medium',
            ])
            ->assertStatus(201);

        $itemId = $genRes->json('data.items.0.id');
        $this->assertEquals('draft', $genRes->json('data.items.0.status'));

        // Setujui draf soal AI
        $approveRes = $this->actingAs($teacher)
            ->postJson("/api/v1/teacher/ai/items/{$itemId}/approve", [
                'stem' => 'Apa fungsi utama surat lamaran pekerjaan resmi?',
            ])
            ->assertStatus(200);

        $this->assertEquals('approved', $approveRes->json('data.item.status'));
        $this->assertEquals('ai', $approveRes->json('data.question.source'));
        $this->assertEquals('published', $approveRes->json('data.question.status'));

        // Kutipan/stimulus harus ikut tersimpan ke Bank Soal dan muncul di daftar guru
        $this->assertStringContainsString('melamar posisi staf administrasi', $approveRes->json('data.question.stimulus'));
        $list = $this->actingAs($teacher)->getJson('/api/v1/teacher/questions')->assertOk()->json('data');
        $saved = collect($list)->firstWhere('id', $approveRes->json('data.question.id'));
        $this->assertStringContainsString('melamar posisi staf administrasi', $saved['stimulus']);
    }

    public function test_ai_generator_reports_status_sends_key_in_header_and_explains_quota_errors(): void
    {
        Sleep::fake();
        config(['services.gemini.key' => 'test-secret-gemini-key', 'services.gemini.model' => 'gemini-2.5-flash']);
        Http::fake(['generativelanguage.googleapis.com/*' => Http::response(['error' => ['message' => 'Quota exceeded']], 429)]);

        $teacher = User::where('username', 'bangkit')->firstOrFail();

        $this->actingAs($teacher)->getJson('/api/v1/teacher/ai/status')
            ->assertOk()
            ->assertJsonPath('data.enabled', true)
            ->assertJsonPath('data.model', 'gemini-2.5-flash')
            ->assertDontSee('test-secret-gemini-key');

        $res = $this->actingAs($teacher)->postJson('/api/v1/teacher/ai/questions/generate', [
            'chapter_id' => Chapter::where('number', 1)->value('id'),
            'count' => 2,
            'difficulty' => 'easy',
        ])->assertStatus(422);

        $this->assertStringContainsString('HTTP 429', $res->json('errors.gemini.0'));
        Http::assertSent(fn ($req) => $req->hasHeader('x-goog-api-key', 'test-secret-gemini-key') && ! str_contains($req->url(), 'key='));
        $this->assertDatabaseHas('ai_generations', ['status' => 'failed']);
    }
}
