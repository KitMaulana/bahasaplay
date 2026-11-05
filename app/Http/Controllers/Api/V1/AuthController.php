<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $identifier = trim($request->validated('identifier'));
        $password = $request->validated('password');

        $user = User::query()
            ->where('username', $identifier)
            ->orWhere('email', $identifier)
            ->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => ['NISN/Email/Username atau kata sandi tidak sesuai.'],
            ]);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'Akun Anda sedang dinonaktifkan. Silakan hubungi guru atau administrator.',
            ], 403);
        }

        $user->update(['last_login_at' => now()]);

        Auth::guard('web')->login($user);
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        $token = $user->createToken('spa-session')->plainTextToken;
        $user->load(['schoolClasses', 'teachingClasses']);

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
                'redirect_to' => match ($user->primaryRole()) {
                    'admin' => '/admin',
                    'teacher' => '/teacher',
                    default => '/student',
                },
            ],
            'message' => 'Berhasil masuk ke BAHASA PLAY.',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user && $user->currentAccessToken() && method_exists($user->currentAccessToken(), 'delete')) {
            $user->currentAccessToken()->delete();
        }

        Auth::guard('web')->logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'data' => null,
            'message' => 'Berhasil keluar dari aplikasi.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['schoolClasses', 'teachingClasses']);

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:191'],
            'avatar_config' => ['sometimes', 'array'],
            'current_password' => ['nullable', 'required_with:new_password', 'string'],
            'new_password' => ['nullable', 'string', 'min:6', 'confirmed'],
        ]);

        if (! empty($validated['new_password'])) {
            if (! Hash::check($validated['current_password'], $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['Kata sandi lama tidak sesuai.'],
                ]);
            }
            $user->password = $validated['new_password'];
        }

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (isset($validated['avatar_config'])) {
            $user->avatar_config = $validated['avatar_config'];
        }

        $user->save();
        $user->load(['schoolClasses', 'teachingClasses']);

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'Profil berhasil diperbarui.',
        ]);
    }
}
