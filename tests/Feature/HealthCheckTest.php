<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    public function test_landing_page_loads_successfully(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertSee('BAHASA PLAY');
    }

    public function test_api_v1_health_endpoint_returns_expected_structure(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['app', 'tagline', 'status', 'timestamp'],
                'message',
            ])
            ->assertJsonPath('data.status', 'ok');
    }
}
