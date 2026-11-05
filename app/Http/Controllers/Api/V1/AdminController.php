<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Attempt;
use App\Models\Chapter;
use App\Models\Question;
use App\Models\SchoolClass;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $users = User::with(['roles', 'schoolClasses', 'teachingClasses'])
            ->latest()
            ->get()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'username' => $u->username,
                'email' => $u->email,
                'role' => $u->primaryRole(),
                'class_name' => $u->schoolClasses->first()?->name,
                'is_active' => $u->is_active,
                'last_login_at' => $u->last_login_at?->toIso8601String(),
            ]);

        $roles = Role::with('permissions')->get()->map(fn (Role $r) => [
            'id' => $r->id,
            'name' => $r->name,
            'permissions' => $r->permissions->pluck('name')->values(),
        ]);

        $settings = [
            'school_name' => Setting::getValue('school_name', 'SMAN 1 Ciruas'),
            'academic_year' => Setting::getValue('academic_year', '2026/2027'),
            'kkm_default' => (int) Setting::getValue('kkm_default', 75),
            'app_tagline' => Setting::getValue('app_tagline', 'Mainkan gamenya, pelajari bahasanya.'),
        ];

        $logs = ActivityLog::with('user')
            ->latest()
            ->limit(40)
            ->get()
            ->map(fn (ActivityLog $l) => [
                'id' => $l->id,
                'user_name' => $l->user?->name ?? 'Sistem',
                'username' => $l->user?->username ?? '-',
                'action' => $l->action,
                'properties' => $l->properties,
                'ip_address' => $l->ip_address,
                'created_at' => $l->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'data' => [
                'stats' => [
                    'total_users' => User::count(),
                    'total_admins' => User::role('admin')->count(),
                    'total_teachers' => User::role('teacher')->count(),
                    'total_students' => User::role('student')->count(),
                    'total_classes' => SchoolClass::count(),
                    'total_chapters' => Chapter::count(),
                    'total_questions' => Question::count(),
                    'total_attempts' => Attempt::count(),
                    'php_version' => PHP_VERSION,
                    'laravel_version' => app()->version(),
                ],
                'users' => $users,
                'classes' => SchoolClass::withCount('students')->orderBy('name')->get(),
                'roles' => $roles,
                'all_permissions' => Permission::pluck('name')->values(),
                'settings' => $settings,
                'activity_logs' => $logs,
            ],
        ]);
    }

    public function storeUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'username' => ['required', 'string', 'max:100', 'unique:users,username'],
            'email' => ['nullable', 'email', 'max:191', 'unique:users,email'],
            'role' => ['required', 'in:admin,teacher,student'],
            'password' => ['nullable', 'string', 'min:4'],
            'school_class_id' => ['nullable', 'integer', 'exists:school_classes,id'],
        ]);

        $defaultPassword = match ($validated['role']) {
            'admin' => 'admin123',
            'teacher' => 'smancir123',
            default => $validated['username'],
        };

        $user = User::create([
            'name' => $validated['name'],
            'username' => trim($validated['username']),
            'email' => $validated['email'] ?? null,
            'password' => Hash::make($validated['password'] ?: $defaultPassword),
            'avatar_config' => ['skinColor' => '#fde68a', 'shirtColor' => '#06b6d4'],
            'is_active' => true,
        ]);

        $user->syncRoles([$validated['role']]);

        if ($validated['role'] === 'student' && ! empty($validated['school_class_id'])) {
            $user->schoolClasses()->sync([$validated['school_class_id']]);
        }

        ActivityLog::record($request->user()->id, 'admin.user.created', 'User', $user->id, [
            'role' => $validated['role'],
            'username' => $user->username,
        ]);

        return response()->json([
            'data' => $user,
            'message' => 'Akun pengguna berhasil dibuat.',
        ], 201);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:191'],
            'username' => ['sometimes', 'string', 'max:100', 'unique:users,username,'.$user->id],
            'email' => ['nullable', 'email', 'max:191', 'unique:users,email,'.$user->id],
            'role' => ['sometimes', 'in:admin,teacher,student'],
            'password' => ['nullable', 'string', 'min:4'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }
        if (isset($validated['username'])) {
            $user->username = $validated['username'];
        }
        if (array_key_exists('email', $validated)) {
            $user->email = $validated['email'];
        }
        if (isset($validated['is_active'])) {
            $user->is_active = $validated['is_active'];
        }
        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        $user->save();

        if (! empty($validated['role'])) {
            $user->syncRoles([$validated['role']]);
        }

        return response()->json([
            'data' => $user,
            'message' => 'Data akun berhasil diperbarui.',
        ]);
    }

    public function destroyUser(Request $request, User $user): JsonResponse
    {
        if ((int) $user->id === (int) $request->user()->id) {
            return response()->json([
                'message' => 'Tidak dapat menghapus akun yang sedang digunakan.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'data' => null,
            'message' => 'Akun pengguna berhasil dihapus.',
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'school_name' => ['required', 'string', 'max:191'],
            'academic_year' => ['required', 'string', 'max:30'],
            'kkm_default' => ['required', 'integer', 'min:1', 'max:100'],
            'app_tagline' => ['nullable', 'string', 'max:191'],
        ]);

        foreach ($validated as $key => $val) {
            Setting::setValue($key, $val);
        }

        // Terapkan KKM default baru ke BAB yang belum punya KKM khusus (atau masih memakai default)
        Chapter::query()->update(['kkm' => (int) $validated['kkm_default']]);

        ActivityLog::record($request->user()->id, 'admin.settings.updated', 'Setting', null, $validated);

        return response()->json([
            'data' => $validated,
            'message' => 'Pengaturan global aplikasi berhasil disimpan.',
        ]);
    }
}
