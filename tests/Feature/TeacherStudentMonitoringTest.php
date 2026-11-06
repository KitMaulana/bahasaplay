<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\SchoolClass;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TeacherStudentMonitoringTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    private function teacher(): User
    {
        return User::where('username', 'bangkit')->firstOrFail();
    }

    public function test_bulk_import_creates_updates_and_skips_safely(): void
    {
        $existing = User::where('username', '0081234501')->firstOrFail();
        $existing->update(['password' => Hash::make('sandi-baru-siswa')]);
        $class = SchoolClass::where('name', 'XII-2')->firstOrFail();

        $res = $this->actingAs($this->teacher())
            ->postJson('/api/v1/teacher/students/import', [
                'rows' => [
                    ['nisn' => '0099000001', 'name' => 'Siswa Baru Satu', 'class_id' => $class->id],
                    ['nisn' => '0099000002', 'name' => 'Siswa Baru Dua', 'class_name' => 'XII-9'],
                    ['nisn' => '0081234501', 'name' => 'Aditya Pratama Putra', 'class_id' => $class->id],
                    ['nisn' => '0099000001', 'name' => 'Duplikat', 'class_id' => $class->id],
                    ['nisn' => 'bangkit', 'name' => 'Bukan Siswa', 'class_id' => $class->id],
                ],
            ])
            ->assertOk()
            ->assertJsonPath('data.created', 2)
            ->assertJsonPath('data.updated', 1);

        $this->assertCount(2, $res->json('data.skipped'));

        $new = User::where('username', '0099000001')->firstOrFail();
        $this->assertTrue($new->hasRole('student'));
        $this->assertTrue(Hash::check('0099000001', $new->password));
        $this->assertEquals('XII-2', $new->schoolClasses()->first()->name);
        $this->assertDatabaseHas('school_classes', ['name' => 'XII-9']);

        // Impor ulang tidak boleh mereset kata sandi siswa lama
        $existing->refresh();
        $this->assertEquals('Aditya Pratama Putra', $existing->name);
        $this->assertTrue(Hash::check('sandi-baru-siswa', $existing->password));

        // Akun guru tidak berubah menjadi siswa
        $this->assertFalse($this->teacher()->fresh()->hasRole('student'));
    }

    public function test_login_is_recorded_and_activity_recap_filters_by_class(): void
    {
        $this->postJson('/api/v1/auth/login', ['identifier' => '0081234501', 'password' => '0081234501', 'role' => 'student'])->assertOk();
        $student = User::where('username', '0081234501')->firstOrFail();
        $this->assertDatabaseHas('activity_logs', ['user_id' => $student->id, 'action' => 'auth.login']);

        ActivityLog::record($student->id, 'practice.submitted', 'Attempt', null, ['chapter_id' => 1, 'score' => 80, 'passed' => true]);

        $classId = $student->schoolClasses()->first()->id;
        $res = $this->actingAs($this->teacher())
            ->getJson('/api/v1/teacher/activity-recap?class_id='.$classId)
            ->assertOk()
            ->assertJsonStructure(['data' => ['range', 'summary', 'daily', 'students', 'feed']]);

        $row = collect($res->json('data.students'))->firstWhere('student_id', $student->id);
        $this->assertNotNull($row);
        $this->assertEquals(1, $row['logins']);
        $this->assertEquals(1, $row['practice_passed']);
        $this->assertEquals(80, $row['avg_score']);
        $this->assertTrue(collect($res->json('data.students'))->every(fn ($r) => $r['class_id'] === $classId));

        $this->actingAs($this->teacher())
            ->get('/api/v1/teacher/activity-recap/export?class_id='.$classId)
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_teacher_can_view_student_progress_detail_but_student_cannot_view_recap(): void
    {
        $student = User::where('username', '0081234502')->firstOrFail();

        $this->actingAs($this->teacher())
            ->getJson("/api/v1/teacher/students/{$student->id}/progress")
            ->assertOk()
            ->assertJsonPath('data.student.nisn', '0081234502')
            ->assertJsonStructure(['data' => ['chapters' => [['number', 'learning_status', 'practice_status', 'exam_status']], 'attempts', 'activities']]);

        $this->actingAs($this->teacher())
            ->getJson('/api/v1/teacher/students/'.$this->teacher()->id.'/progress')
            ->assertNotFound();

        $this->actingAs($student)->getJson('/api/v1/teacher/activity-recap')->assertForbidden();
    }
}
