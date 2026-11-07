<?php

namespace Tests;

use Illuminate\Contracts\Auth\Authenticatable as UserContract;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * API memakai guard "sanctum" (token Bearer). Tes yang login lewat actingAs()
     * otomatis memakai guard itu, kecuali guard lain disebutkan.
     */
    public function actingAs(UserContract $user, $guard = null)
    {
        return parent::actingAs($user, $guard ?? 'sanctum');
    }
}
