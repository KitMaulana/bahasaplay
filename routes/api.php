<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\StudentController;
use App\Http\Controllers\Api\V1\TeacherController;
use App\Models\Setting;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', function () {
        return response()->json([
            'data' => [
                'app' => config('app.name', 'BAHASA PLAY'),
                'tagline' => Setting::getValue('app_tagline', 'Mainkan gamenya, pelajari bahasanya.'),
                'school_name' => Setting::getValue('school_name', 'SMAN 1 Ciruas'),
                'status' => 'ok',
                'timestamp' => now()->toIso8601String(),
            ],
            'message' => 'BAHASA PLAY API siap digunakan.',
        ]);
    });

    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/me', [AuthController::class, 'updateProfile']);

        // =====================================================
        // RUTE SISWA (Juga dapat dipratinjau oleh Guru & Admin)
        // =====================================================
        Route::middleware('role:student|teacher|admin')->prefix('student')->group(function () {
            Route::get('/overview', [StudentController::class, 'dashboard']);
            Route::get('/dashboard', [StudentController::class, 'dashboard']);
            Route::get('/chapters/{chapter}', [StudentController::class, 'showChapter']);
            Route::post('/materials/{material}/complete', [StudentController::class, 'completeMaterial']);
            Route::post('/missions/{mission}/steps/{step}/complete', [StudentController::class, 'completeMissionStep']);

            Route::post('/chapters/{chapter}/practice/start', [StudentController::class, 'startPractice']);
            Route::post('/exams/{exam}/start', [StudentController::class, 'startExam']);
            Route::get('/attempts/{attempt}', [StudentController::class, 'showAttempt']);
            Route::put('/attempts/{attempt}/answers', [StudentController::class, 'saveAnswer']);
            Route::post('/attempts/{attempt}/submit', [StudentController::class, 'submitAttempt']);

            // Elbira — kucing asisten belajar AI (dibatasi 15 pesan/menit per pengguna)
            Route::post('/elbira/chat', [StudentController::class, 'elbiraChat'])->middleware('throttle:15,1');
        });

        // =====================================================
        // RUTE GURU (DAN ADMIN)
        // =====================================================
        Route::middleware('role:teacher|admin')->prefix('teacher')->group(function () {
            Route::get('/overview', [TeacherController::class, 'overview']);

            // BAB, Zona 3D, NPC, Objek Interaktif, Misi, & Materi
            Route::get('/chapters', [TeacherController::class, 'chapters']);
            Route::post('/chapters', [TeacherController::class, 'storeChapter']);
            Route::put('/chapters/{chapter}', [TeacherController::class, 'updateChapter']);
            Route::delete('/chapters/{chapter}', [TeacherController::class, 'destroyChapter']);

            Route::put('/zones/{zone}', [TeacherController::class, 'updateZone']);
            Route::post('/zones/{zone}/npcs', [TeacherController::class, 'storeNpc']);
            Route::delete('/npcs/{npc}', [TeacherController::class, 'destroyNpc']);
            Route::post('/zones/{zone}/interactables', [TeacherController::class, 'storeInteractable']);
            Route::delete('/interactables/{interactable}', [TeacherController::class, 'destroyInteractable']);
            Route::post('/chapters/{chapter}/missions', [TeacherController::class, 'storeMission']);
            Route::delete('/missions/{mission}', [TeacherController::class, 'destroyMission']);

            Route::post('/chapters/{chapter}/materials', [TeacherController::class, 'storeMaterial']);
            Route::put('/materials/{material}', [TeacherController::class, 'updateMaterial']);
            Route::delete('/materials/{material}', [TeacherController::class, 'destroyMaterial']);

            // Bank Soal & Konfigurasi Practice Zone
            Route::get('/questions', [TeacherController::class, 'questions']);
            Route::post('/questions', [TeacherController::class, 'storeQuestion']);
            Route::put('/questions/{question}', [TeacherController::class, 'updateQuestion']);
            Route::delete('/questions/{question}', [TeacherController::class, 'destroyQuestion']);
            Route::put('/chapters/{chapter}/practice-config', [TeacherController::class, 'updatePracticeConfig']);

            // Examination Zone & Remedial
            Route::get('/exams', [TeacherController::class, 'exams']);
            Route::post('/exams', [TeacherController::class, 'storeExam']);
            Route::put('/exams/{exam}', [TeacherController::class, 'updateExam']);
            Route::delete('/exams/{exam}', [TeacherController::class, 'destroyExam']);
            Route::post('/exams/{exam}/remedial', [TeacherController::class, 'grantRemedial']);
            Route::get('/attempts/{attempt}', [TeacherController::class, 'examAttemptDetail']);

            // Siswa & Kelas
            Route::get('/students', [TeacherController::class, 'students']);
            Route::post('/students', [TeacherController::class, 'storeStudent']);
            Route::put('/students/{student}', [TeacherController::class, 'updateStudent']);
            Route::delete('/students/{student}', [TeacherController::class, 'destroyStudent']);
            Route::post('/students/import', [TeacherController::class, 'importStudents']);
            Route::get('/students/{student}/progress', [TeacherController::class, 'studentProgress']);
            Route::get('/activity-recap', [TeacherController::class, 'activityRecap']);
            Route::get('/activity-recap/export', [TeacherController::class, 'exportActivityRecap']);
            Route::post('/classes', [TeacherController::class, 'storeClass']);
            Route::delete('/classes/{schoolClass}', [TeacherController::class, 'destroyClass']);

            // AI Question Generator (Google Gemini API)
            Route::get('/ai/status', [TeacherController::class, 'aiStatus']);
            Route::get('/ai/generations', [TeacherController::class, 'aiGenerations']);
            Route::post('/ai/questions/generate', [TeacherController::class, 'generateAiQuestions']);
            Route::post('/ai/items/{item}/approve', [TeacherController::class, 'approveAiItem']);
            Route::post('/ai/items/{item}/reject', [TeacherController::class, 'rejectAiItem']);

            // Laporan & Ekspor Excel/PDF
            Route::get('/reports', [TeacherController::class, 'reports']);
            Route::get('/reports/export/excel', [TeacherController::class, 'exportExcel']);
            Route::get('/reports/export/pdf', [TeacherController::class, 'exportPdf']);
        });

        // =====================================================
        // RUTE ADMINISTRATOR
        // =====================================================
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('/overview', [AdminController::class, 'dashboard']);
            Route::get('/dashboard', [AdminController::class, 'dashboard']);
            Route::post('/users', [AdminController::class, 'storeUser']);
            Route::put('/users/{user}', [AdminController::class, 'updateUser']);
            Route::delete('/users/{user}', [AdminController::class, 'destroyUser']);
            Route::put('/settings', [AdminController::class, 'updateSettings']);
        });
    });
});
