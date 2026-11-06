<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\ActivityLog;
use App\Models\Attempt;
use App\Models\Chapter;
use App\Models\Exam;
use App\Models\Material;
use App\Models\MaterialProgress;
use App\Models\Mission;
use App\Models\MissionProgress;
use App\Models\MissionStep;
use App\Models\Setting;
use App\Models\UserAchievement;
use App\Models\UserStat;
use App\Http\Requests\Student\ElbiraChatRequest;
use App\Services\AI\ElbiraChatService;
use App\Services\Assessment\AttemptService;
use App\Services\Learning\ProgressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function __construct(
        protected ProgressService $progressService,
        protected AttemptService $attemptService
    ) {}

    /** Chat dengan Elbira, kucing asisten belajar (hanya topik Bahasa Indonesia). */
    public function elbiraChat(ElbiraChatRequest $request, ElbiraChatService $elbira): JsonResponse
    {
        $validated = $request->validated();
        $chapter = isset($validated['chapter_id']) ? Chapter::find($validated['chapter_id']) : null;
        $material = isset($validated['material_id']) ? Material::find($validated['material_id']) : null;

        return response()->json([
            'data' => $elbira->chat($request->user(), $validated['message'], $chapter, $material, $validated['history'] ?? []),
        ]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user()->load('schoolClasses');

        // Sinkronisasi seluruh ujian yang sudah lewat batas waktu
        $this->attemptService->finalizeExpiredAttempts();

        $chapters = Chapter::with(['materials' => fn ($q) => $q->where('status', 'published'), 'zones', 'practiceConfig', 'exams'])
            ->orderBy('number')
            ->get();

        $chapterCards = $chapters->map(function (Chapter $chapter) use ($user) {
            $progress = $this->progressService->syncChapterProgress($user, $chapter);
            $publishedMaterialsCount = $chapter->materials->count();
            $completedMaterialsCount = MaterialProgress::where('user_id', $user->id)
                ->whereIn('material_id', $chapter->materials->pluck('id'))
                ->whereNotNull('completed_at')
                ->count();

            $activeExam = $chapter->exams->where('is_active', true)->first();

            return [
                'id' => $chapter->id,
                'number' => $chapter->number,
                'title' => $chapter->title,
                'slug' => $chapter->slug,
                'description' => $chapter->description,
                'setting_location' => $chapter->setting_location,
                'kkm' => $chapter->kkm ?: (int) Setting::getValue('kkm_default', 75),
                'status' => $chapter->status,
                'materials_total' => $publishedMaterialsCount,
                'materials_completed' => $completedMaterialsCount,
                'learning_status' => $progress->learning_status,
                'practice_status' => $progress->practice_status,
                'exam_status' => $progress->exam_status,
                'best_practice_score' => $progress->best_practice_score,
                'exam_score' => $progress->exam_score,
                'progress_percent' => $progress->progress_percent,
                'active_exam' => $activeExam ? [
                    'id' => $activeExam->id,
                    'title' => $activeExam->title,
                    'duration_minutes' => $activeExam->duration_minutes,
                    'question_count' => $activeExam->question_count,
                ] : null,
            ];
        });

        $publishedCards = $chapterCards->where('status', 'published');
        $totalProgress = $publishedCards->count() > 0
            ? round((float) $publishedCards->avg('progress_percent'), 1)
            : 0.0;

        $stat = UserStat::firstOrCreate(['user_id' => $user->id], ['xp' => 0, 'level' => 1]);
        $earnedIds = UserAchievement::where('user_id', $user->id)->pluck('earned_at', 'achievement_id');
        $achievements = Achievement::all()->map(fn (Achievement $a) => [
            'id' => $a->id,
            'key' => $a->key,
            'name' => $a->name,
            'description' => $a->description,
            'icon' => $a->icon,
            'xp' => $a->xp,
            'unlocked' => $earnedIds->has($a->id),
            'earned_at' => $earnedIds->get($a->id)?->toIso8601String(),
        ]);

        $practiceHistory = Attempt::with('chapter')
            ->where('user_id', $user->id)
            ->where('type', 'practice')
            ->where('status', 'submitted')
            ->latest('submitted_at')
            ->limit(15)
            ->get()
            ->map(fn (Attempt $a) => [
                'id' => $a->id,
                'chapter_id' => $a->chapter_id,
                'chapter_title' => "BAB {$a->chapter?->number}: {$a->chapter?->title}",
                'score' => $a->score,
                'correct_count' => $a->correct_count,
                'total_questions' => $a->total_questions,
                'passed' => $a->passed,
                'submitted_at' => $a->submitted_at?->toIso8601String(),
            ]);

        $examHistory = Attempt::with(['chapter', 'exam'])
            ->where('user_id', $user->id)
            ->where('type', 'exam')
            ->whereIn('status', ['submitted', 'expired'])
            ->latest('submitted_at')
            ->limit(15)
            ->get()
            ->map(fn (Attempt $a) => [
                'id' => $a->id,
                'chapter_id' => $a->chapter_id,
                'chapter_title' => "BAB {$a->chapter?->number}: {$a->chapter?->title}",
                'exam_title' => $a->exam?->title,
                'score' => $a->score,
                'correct_count' => $a->correct_count,
                'total_questions' => $a->total_questions,
                'passed' => $a->passed,
                'status' => $a->status,
                'submitted_at' => $a->submitted_at?->toIso8601String(),
            ]);

        $activityLogs = ActivityLog::where('user_id', $user->id)
            ->latest()
            ->limit(15)
            ->get()
            ->map(fn (ActivityLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'properties' => $log->properties,
                'created_at' => $log->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'data' => [
                'student' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'nisn' => $user->username,
                    'class_name' => $user->schoolClasses->first()?->name ?? 'XII-1',
                    'avatar_config' => $user->avatar_config,
                    'xp' => $stat->xp,
                    'level' => $stat->level,
                ],
                'total_progress_percent' => $totalProgress,
                'kkm_default' => (int) Setting::getValue('kkm_default', 75),
                'chapters' => $chapterCards->values(),
                'achievements' => $achievements->values(),
                'practice_history' => $practiceHistory->values(),
                'exam_history' => $examHistory->values(),
                'activity_logs' => $activityLogs->values(),
            ],
        ]);
    }

    public function showChapter(Request $request, Chapter $chapter): JsonResponse
    {
        $user = $request->user();
        $chapter->load([
            'materials' => fn ($q) => $q->where('status', 'published')->orderBy('order'),
            'zones.npcs.dialogues',
            'zones.interactables',
            'missions.steps',
            'practiceConfig',
            'exams' => fn ($q) => $q->where('is_active', true),
        ]);

        $progress = $this->progressService->syncChapterProgress($user, $chapter);

        $completedMaterialIds = MaterialProgress::where('user_id', $user->id)
            ->whereIn('material_id', $chapter->materials->pluck('id'))
            ->whereNotNull('completed_at')
            ->pluck('material_id')
            ->all();

        $missionProgressMap = MissionProgress::where('user_id', $user->id)
            ->whereIn('mission_id', $chapter->missions->pluck('id'))
            ->get()
            ->keyBy('mission_id');

        return response()->json([
            'data' => [
                'id' => $chapter->id,
                'number' => $chapter->number,
                'title' => $chapter->title,
                'slug' => $chapter->slug,
                'description' => $chapter->description,
                'setting_location' => $chapter->setting_location,
                'kkm' => $chapter->kkm ?: (int) Setting::getValue('kkm_default', 75),
                'status' => $chapter->status,
                'progress' => [
                    'learning_status' => $progress->learning_status,
                    'practice_status' => $progress->practice_status,
                    'exam_status' => $progress->exam_status,
                    'best_practice_score' => $progress->best_practice_score,
                    'exam_score' => $progress->exam_score,
                    'progress_percent' => $progress->progress_percent,
                ],
                'materials' => $chapter->materials->map(fn (Material $m) => [
                    'id' => $m->id,
                    'title' => $m->title,
                    'slug' => $m->slug,
                    'summary' => $m->summary,
                    'content' => $m->content,
                    'media' => $m->media,
                    'order' => $m->order,
                    'is_required' => $m->is_required,
                    'is_completed' => in_array($m->id, $completedMaterialIds, true),
                ])->values(),
                'zones' => $chapter->zones->map(fn ($z) => [
                    'id' => $z->id,
                    'type' => $z->type,
                    'name' => $z->name,
                    'description' => $z->description,
                    'map_key' => $z->map_key,
                    'area_key' => $z->area_key,
                    'config' => $z->config,
                    'npcs' => $z->npcs->map(fn ($n) => [
                        'id' => $n->id,
                        'name' => $n->name,
                        'role_label' => $n->role_label,
                        'appearance' => $n->appearance,
                        'position' => $n->position,
                        'rotation_y' => $n->rotation_y,
                        'greeting' => $n->greeting,
                        'dialogues' => $n->dialogues,
                    ])->values(),
                    'interactables' => $z->interactables->map(fn ($i) => [
                        'id' => $i->id,
                        'type' => $i->type,
                        'label' => $i->label,
                        'position' => $i->position,
                        'model_key' => $i->model_key,
                        'material_id' => $i->material_id,
                        'action' => $i->action,
                    ])->values(),
                ])->values(),
                'missions' => $chapter->missions->map(function (Mission $mission) use ($missionProgressMap) {
                    $mp = $missionProgressMap->get($mission->id);

                    return [
                        'id' => $mission->id,
                        'title' => $mission->title,
                        'description' => $mission->description,
                        'reward_xp' => $mission->reward_xp,
                        'status' => $mp?->status ?? 'not_started',
                        'completed_steps' => $mp?->completed_steps ?? [],
                        'steps' => $mission->steps->map(fn (MissionStep $s) => [
                            'id' => $s->id,
                            'order' => $s->order,
                            'type' => $s->type,
                            'target_ref' => $s->target_ref,
                            'description' => $s->description,
                        ])->values(),
                    ];
                })->values(),
                'practice_config' => $chapter->practiceConfig,
                'exams' => $chapter->exams->map(fn (Exam $e) => [
                    'id' => $e->id,
                    'title' => $e->title,
                    'question_count' => $e->question_count,
                    'duration_minutes' => $e->duration_minutes,
                    'starts_at' => $e->starts_at?->toIso8601String(),
                    'ends_at' => $e->ends_at?->toIso8601String(),
                    'max_attempts' => $e->max_attempts,
                ])->values(),
            ],
        ]);
    }

    public function completeMaterial(Request $request, Material $material): JsonResponse
    {
        $user = $request->user();
        $this->progressService->markMaterialRead($user, $material->id);

        foreach (MissionStep::where('type', 'read_material')->get() as $step) {
            if (($step->target_ref['material_id'] ?? null) == $material->id) {
                $this->progressService->completeMissionStep($user, $step->mission_id, $step->id);
            }
        }

        $chapterProgress = $this->progressService->syncChapterProgress($user, $material->chapter);

        return response()->json([
            'data' => $chapterProgress,
            'message' => 'Materi berhasil ditandai selesai dibaca.',
        ]);
    }

    public function completeMissionStep(Request $request, Mission $mission, MissionStep $step): JsonResponse
    {
        $mp = $this->progressService->completeMissionStep($request->user(), $mission->id, $step->id);

        return response()->json([
            'data' => $mp,
            'message' => 'Langkah misi berhasil diselesaikan.',
        ]);
    }

    public function startPractice(Request $request, Chapter $chapter): JsonResponse
    {
        $attempt = $this->attemptService->startPractice($request->user(), $chapter);

        return response()->json([
            'data' => $this->attemptService->formatAttemptForClient($attempt, false),
            'message' => 'Sesi Latihan Soal dimulai.',
        ], 201);
    }

    public function startExam(Request $request, Exam $exam): JsonResponse
    {
        $attempt = $this->attemptService->startExam($request->user(), $exam);

        return response()->json([
            'data' => $this->attemptService->formatAttemptForClient($attempt, false),
            'message' => 'Sesi Ujian Resmi dimulai.',
        ], 201);
    }

    public function showAttempt(Request $request, Attempt $attempt): JsonResponse
    {
        if ((int) $attempt->user_id !== (int) $request->user()->id) {
            abort(403, 'Anda tidak diizinkan mengakses sesi milik siswa lain.');
        }

        if ($attempt->status === 'in_progress' && $attempt->expires_at && now()->gt($attempt->expires_at)) {
            $this->attemptService->submit($request->user(), $attempt);
            $attempt->refresh();
        }

        $allowReview = $attempt->type === 'practice'
            || ($attempt->exam?->show_review_after !== 'never');

        return response()->json([
            'data' => $this->attemptService->formatAttemptForClient($attempt, $allowReview),
        ]);
    }

    public function saveAnswer(Request $request, Attempt $attempt): JsonResponse
    {
        $validated = $request->validate([
            'attempt_question_id' => ['required', 'integer'],
            'selected_label' => ['required', 'string', 'in:A,B,C,D,E,a,b,c,d,e'],
        ]);

        $aq = $this->attemptService->saveAnswer(
            $request->user(),
            $attempt,
            (int) $validated['attempt_question_id'],
            (string) $validated['selected_label']
        );

        return response()->json([
            'data' => [
                'attempt_question_id' => $aq->id,
                'selected_label' => strtoupper($validated['selected_label']),
                'answered_at' => $aq->answered_at?->toIso8601String(),
            ],
            'message' => 'Jawaban tersimpan otomatis.',
        ]);
    }

    public function submitAttempt(Request $request, Attempt $attempt): JsonResponse
    {
        $graded = $this->attemptService->submit($request->user(), $attempt);

        $allowReview = $graded->type === 'practice'
            || ($graded->exam?->show_review_after !== 'never');

        return response()->json([
            'data' => $this->attemptService->formatAttemptForClient($graded, $allowReview),
            'message' => 'Jawaban berhasil dikumpulkan dan dinilai oleh server.',
        ]);
    }
}
