<?php

namespace Tests\Feature;

use App\Models\Attempt;
use App\Models\Chapter;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
 * Regresi laporan "progres tereset saat login di perangkat lain" dan "timer 45.01.3333":
 * - respons API tidak boleh di-cache (browser/CDN/cache hosting),
 * - identitas API ditentukan token Bearer, bukan cookie sesi akun lain di browser yang sama,
 * - sisa waktu ujian berupa bilangan bulat.
 */
class ApiIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_api_responses_are_marked_as_never_cacheable(): void
    {
        $res = $this->getJson('/api/v1/health')->assertOk();

        $cache = (string) $res->headers->get('Cache-Control');
        $this->assertStringContainsString('no-store', $cache);
        $this->assertStringContainsString('private', $cache);
        $this->assertStringContainsString('Authorization', (string) $res->headers->get('Vary'));
    }

    public function test_bearer_token_identity_is_not_overridden_by_another_accounts_session(): void
    {
        $siswaA = User::where('username', '0081234501')->firstOrFail();
        $siswaB = User::where('username', '0081234502')->firstOrFail();
        $token = $siswaB->createToken('perangkat-lain')->plainTextToken;

        // Cookie sesi browser milik akun A ...
        $this->be($siswaA, 'web');

        // ... tidak boleh mengalahkan token Bearer akun B
        $this->withToken($token)
            ->getJson('/api/v1/me')
            ->assertOk()
            ->assertJsonPath('data.username', '0081234502');
    }

    public function test_exam_remaining_seconds_is_a_whole_number(): void
    {
        $student = User::where('username', '0081234501')->firstOrFail();
        $attempt = Attempt::create([
            'user_id' => $student->id,
            'chapter_id' => Chapter::where('number', 1)->value('id'),
            'type' => 'exam',
            'status' => 'in_progress',
            'started_at' => now()->subSeconds(30),
            'expires_at' => now()->addMinutes(44)->addSeconds(13)->addMilliseconds(333),
        ]);

        $res = $this->actingAs($student)->getJson("/api/v1/student/attempts/{$attempt->id}")->assertOk();

        $remaining = $res->json('data.remaining_seconds');
        $this->assertIsInt($remaining);
        $this->assertGreaterThan(2600, $remaining);
        $this->assertLessThanOrEqual(2654, $remaining);
    }
}
