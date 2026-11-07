<?php

namespace Tests\Feature;

use App\Models\Attempt;
use App\Models\AttemptQuestion;
use App\Models\Chapter;
use App\Models\Exam;
use App\Models\User;
use App\Services\Assessment\AttemptService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
 * Aturan: siswa yang meninggalkan ujian (tutup jendela/tab, muat ulang, pindah perangkat) tidak bisa
 * melanjutkan. Percobaan lama dibatalkan (jawaban & waktu dibuang), tidak mengurangi kesempatan,
 * dan ujian dimulai dari awal.
 */
class ExamLeaveRulesTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    private Exam $exam;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->student = User::where('username', '0081234501')->firstOrFail();
        $chapter = Chapter::where('number', 1)->firstOrFail();
        $this->exam = Exam::where('chapter_id', $chapter->id)->firstOrFail();

        // Latihan sudah lulus KKM supaya Zona Ujian terbuka
        Attempt::create([
            'user_id' => $this->student->id,
            'chapter_id' => $chapter->id,
            'type' => 'practice',
            'status' => 'submitted',
            'score' => 100,
            'passed' => true,
            'total_questions' => 10,
            'correct_count' => 10,
            'started_at' => now()->subHour(),
            'submitted_at' => now()->subMinutes(55),
        ]);
    }

    private function start(): array
    {
        return $this->actingAs($this->student)
            ->postJson("/api/v1/student/exams/{$this->exam->id}/start")
            ->assertStatus(201)
            ->json('data');
    }

    public function test_starting_again_cancels_previous_attempt_and_resets_answers_and_time(): void
    {
        $first = $this->start();
        $this->assertFalse($first['restarted_previous']);

        // Siswa sempat menjawab satu soal, lalu waktu berjalan 10 menit
        $aq = AttemptQuestion::where('attempt_id', $first['id'])->firstOrFail();
        $this->actingAs($this->student)->putJson("/api/v1/student/attempts/{$first['id']}/answers", [
            'attempt_question_id' => $aq->id,
            'selected_label' => 'A',
        ])->assertOk();
        Attempt::whereKey($first['id'])->update(['expires_at' => now()->addMinutes(35)]);

        // Ia keluar lalu masuk ujian lagi → mulai dari awal
        $second = $this->start();

        $this->assertNotEquals($first['id'], $second['id']);
        $this->assertTrue($second['restarted_previous']);
        $this->assertGreaterThan(40 * 60, $second['remaining_seconds']);
        $this->assertSame(0, collect($second['questions'])->where('is_answered', true)->count());

        $old = Attempt::findOrFail($first['id']);
        $this->assertSame('abandoned', $old->status);
        $this->assertNull($old->score);
        $this->assertDatabaseHas('activity_logs', ['user_id' => $this->student->id, 'action' => 'exam.abandoned']);

        // Percobaan yang dibatalkan tidak menghabiskan kesempatan (max_attempts) ujian
        $this->assertSame(0, Attempt::where('user_id', $this->student->id)->where('type', 'exam')->whereIn('status', ['submitted', 'expired'])->count());
        $this->assertSame(1, Attempt::where('user_id', $this->student->id)->where('type', 'exam')->where('status', 'in_progress')->count());

        // Jawaban untuk sesi yang sudah dibatalkan ditolak
        $this->actingAs($this->student)->putJson("/api/v1/student/attempts/{$first['id']}/answers", [
            'attempt_question_id' => $aq->id,
            'selected_label' => 'B',
        ])->assertStatus(422);
    }

    public function test_leaving_the_page_abandons_the_attempt_and_heartbeat_reports_it(): void
    {
        $attempt = $this->start();

        $this->actingAs($this->student)
            ->postJson("/api/v1/student/attempts/{$attempt['id']}/heartbeat")
            ->assertOk()
            ->assertJsonPath('data.status', 'in_progress');

        $this->actingAs($this->student)
            ->postJson("/api/v1/student/attempts/{$attempt['id']}/abandon", ['reason' => 'closed'])
            ->assertOk()
            ->assertJsonPath('data.status', 'abandoned');

        $this->actingAs($this->student)
            ->postJson("/api/v1/student/attempts/{$attempt['id']}/heartbeat")
            ->assertOk()
            ->assertJsonPath('data.status', 'abandoned');

        // Siswa lain tidak boleh membatalkan ujian orang lain
        $other = User::where('username', '0081234502')->firstOrFail();
        $second = $this->start();
        $this->actingAs($other)->postJson("/api/v1/student/attempts/{$second['id']}/abandon")->assertForbidden();
    }

    public function test_attempt_left_open_is_voided_by_the_scheduler_instead_of_being_graded(): void
    {
        $attempt = $this->start();

        // Jendela ditutup: tidak ada detak > 45 dtk, lalu waktu ujian habis
        Attempt::whereKey($attempt['id'])->update([
            'last_seen_at' => now()->subMinutes(10),
            'expires_at' => now()->subMinutes(1),
        ]);

        app(AttemptService::class)->finalizeExpiredAttempts();

        $row = Attempt::findOrFail($attempt['id']);
        $this->assertSame('abandoned', $row->status);
        $this->assertNull($row->score);
    }

    public function test_attempt_that_expires_while_student_is_still_connected_is_still_graded(): void
    {
        $attempt = $this->start();

        // Siswa masih terhubung (detak baru), tetapi waktu habis
        Attempt::whereKey($attempt['id'])->update([
            'last_seen_at' => now(),
            'expires_at' => now()->subSeconds(5),
        ]);

        app(AttemptService::class)->finalizeExpiredAttempts();

        $this->assertSame('expired', Attempt::findOrFail($attempt['id'])->status);
    }
}
