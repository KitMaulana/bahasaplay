<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleAndUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthAndRoleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndUserSeeder::class);
    }

    public function test_student_can_login_with_nisn_and_default_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'identifier' => '0081234501',
            'password' => '0081234501',
            'role' => 'student',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.user.role', 'student')
            ->assertJsonPath('data.redirect_to', '/student');
    }

    public function test_teacher_can_login_with_email_and_default_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'identifier' => 'guru@smancir1.sch.id',
            'password' => 'smancir123',
            'role' => 'teacher',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.user.role', 'teacher')
            ->assertJsonPath('data.redirect_to', '/teacher');
    }

    public function test_admin_can_login_with_username_and_default_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'identifier' => 'admin',
            'password' => 'admin123',
            'role' => 'admin',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.user.role', 'admin')
            ->assertJsonPath('data.redirect_to', '/admin');
    }

    public function test_login_is_rejected_when_selected_role_does_not_match_account(): void
    {
        $accounts = [
            ['guru@smancir1.sch.id', 'smancir123', 'teacher'],
            ['admin', 'admin123', 'admin'],
            ['0081234501', '0081234501', 'student'],
        ];

        foreach ($accounts as [$identifier, $password, $realRole]) {
            foreach (['student', 'teacher', 'admin'] as $wrongRole) {
                if ($wrongRole === $realRole) {
                    continue;
                }
                $this->postJson('/api/v1/auth/login', ['identifier' => $identifier, 'password' => $password, 'role' => $wrongRole])
                    ->assertStatus(403)
                    ->assertJsonMissingPath('data.token');
            }
        }

        // Penolakan tidak boleh mencatat login maupun membuat token
        $this->assertDatabaseMissing('activity_logs', ['action' => 'auth.login']);
        $this->assertDatabaseCount('personal_access_tokens', 0);

        // Peran wajib dikirim
        $this->postJson('/api/v1/auth/login', ['identifier' => 'admin', 'password' => 'admin123'])->assertStatus(422);
    }

    public function test_student_cannot_access_teacher_or_admin_routes(): void
    {
        $student = User::where('username', '0081234501')->firstOrFail();

        $this->actingAs($student)
            ->getJson('/api/v1/student/overview')
            ->assertStatus(200);

        $this->actingAs($student)
            ->getJson('/api/v1/teacher/overview')
            ->assertStatus(403);

        $this->actingAs($student)
            ->getJson('/api/v1/admin/overview')
            ->assertStatus(403);
    }
}
