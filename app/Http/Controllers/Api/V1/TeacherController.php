<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\AiGeneration;
use App\Models\AiGenerationItem;
use App\Models\Attempt;
use App\Models\Chapter;
use App\Models\Dialogue;
use App\Models\Exam;
use App\Models\ExamAttemptPermission;
use App\Models\Interactable;
use App\Models\Material;
use App\Models\Mission;
use App\Models\MissionStep;
use App\Models\Npc;
use App\Models\PracticeConfig;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\SchoolClass;
use App\Models\Setting;
use App\Models\User;
use App\Models\Zone;
use App\Services\AI\GeminiQuestionService;
use App\Services\Assessment\AttemptService;
use App\Services\Report\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TeacherController extends Controller
{
    public function __construct(
        protected GeminiQuestionService $geminiService,
        protected ReportService $reportService,
        protected AttemptService $attemptService
    ) {}

    public function overview(): JsonResponse
    {
        $report = $this->reportService->getComprehensiveReport();

        return response()->json([
            'data' => [
                'role' => 'teacher',
                'total_students' => User::role('student')->count(),
                'total_classes' => SchoolClass::count(),
                'total_chapters' => Chapter::count(),
                'published_chapters' => Chapter::where('status', 'published')->count(),
                'total_materials' => Material::count(),
                'total_questions' => Question::where('status', 'published')->count(),
                'total_exams' => Exam::count(),
                'below_kkm_count' => count($report['below_kkm_students']),
                'class_summary' => $report['class_summary'],
                'chapter_summary' => $report['chapter_summary'],
            ],
        ]);
    }

    // =========================================================
    // MANAJEMEN BAB, ZONA, NPC, OBJEK 3D, MISI & MATERI
    // =========================================================
    public function chapters(): JsonResponse
    {
        $chapters = Chapter::with([
            'materials' => fn ($q) => $q->orderBy('order'),
            'zones.npcs.dialogues',
            'zones.interactables',
            'missions.steps',
            'practiceConfig',
            'exams',
        ])->orderBy('number')->get();

        return response()->json([
            'data' => $chapters,
        ]);
    }

    public function storeChapter(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'number' => ['required', 'integer', 'min:1'],
            'title' => ['required', 'string', 'max:191'],
            'description' => ['nullable', 'string'],
            'setting_location' => ['nullable', 'string', 'max:191'],
            'kkm' => ['nullable', 'integer', 'min:1', 'max:100'],
            'status' => ['required', 'in:draft,published'],
            'map_key' => ['nullable', 'string'],
        ]);

        $mapKey = $validated['map_key'] ?? 'cilegon';

        $chapter = DB::transaction(function () use ($validated, $mapKey, $request) {
            $ch = Chapter::create([
                'number' => $validated['number'],
                'title' => $validated['title'],
                'slug' => Str::slug('bab-'.$validated['number'].'-'.$validated['title']).'-'.Str::random(4),
                'description' => $validated['description'] ?? '',
                'setting_location' => $validated['setting_location'] ?? 'Kota Cilegon',
                'kkm' => $validated['kkm'] ?? 75,
                'order' => $validated['number'],
                'status' => $validated['status'],
                'created_by' => $request->user()->id,
            ]);

            foreach (['learning' => 'Zona Belajar & Latihan', 'practice' => 'Area Latihan', 'exam' => 'Zona Ujian'] as $type => $label) {
                Zone::create([
                    'chapter_id' => $ch->id,
                    'type' => $type,
                    'name' => $label.' '.$ch->title,
                    'description' => $label.' untuk '.$ch->title,
                    'map_key' => $mapKey,
                    'area_key' => $type === 'exam' ? 'gedung_serbaguna' : 'alun_alun',
                    'config' => [
                        'theme' => ['sky' => '#bae6fd', 'ground' => '#86efac', 'accent' => '#0284c7'],
                        'spawn' => ['position' => [0, 0, 8], 'rotationY' => 3.14],
                    ],
                    'is_active' => true,
                ]);
            }

            PracticeConfig::create([
                'chapter_id' => $ch->id,
                'question_count' => 10,
                'shuffle_options' => true,
                'is_active' => true,
            ]);

            return $ch->load(['zones', 'materials', 'practiceConfig']);
        });

        return response()->json([
            'data' => $chapter,
            'message' => 'BAB baru berhasil ditambahkan.',
        ], 201);
    }

    public function updateChapter(Request $request, Chapter $chapter): JsonResponse
    {
        $validated = $request->validate([
            'number' => ['sometimes', 'integer', 'min:1'],
            'title' => ['required', 'string', 'max:191'],
            'description' => ['nullable', 'string'],
            'setting_location' => ['nullable', 'string', 'max:191'],
            'kkm' => ['nullable', 'integer', 'min:1', 'max:100'],
            'status' => ['required', 'in:draft,published'],
        ]);

        $chapter->update($validated);

        return response()->json([
            'data' => $chapter->fresh(['materials', 'zones.npcs', 'zones.interactables', 'missions.steps', 'practiceConfig']),
            'message' => 'Informasi BAB berhasil diperbarui.',
        ]);
    }

    public function destroyChapter(Chapter $chapter): JsonResponse
    {
        $chapter->delete();

        return response()->json([
            'data' => null,
            'message' => 'BAB berhasil dihapus.',
        ]);
    }

    public function updateZone(Request $request, Zone $zone): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'description' => ['nullable', 'string'],
            'map_key' => ['required', 'string'],
            'area_key' => ['required', 'string'],
            'config' => ['nullable', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $zone->update($validated);

        return response()->json([
            'data' => $zone->fresh(['npcs.dialogues', 'interactables']),
            'message' => 'Konfigurasi zona game 3D berhasil diperbarui.',
        ]);
    }

    public function storeMaterial(Request $request, Chapter $chapter): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:191'],
            'summary' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'media' => ['nullable', 'array'],
            'order' => ['nullable', 'integer'],
            'is_required' => ['sometimes', 'boolean'],
            'status' => ['nullable', 'in:draft,published'],
        ]);

        $nextOrder = $validated['order'] ?? (($chapter->materials()->max('order') ?? 0) + 1);

        $material = Material::create([
            'chapter_id' => $chapter->id,
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']).'-'.Str::random(4),
            'summary' => $validated['summary'] ?? '',
            'content' => $validated['content'],
            'media' => $validated['media'] ?? [],
            'order' => $nextOrder,
            'is_required' => $validated['is_required'] ?? true,
            'status' => $validated['status'] ?? 'published',
        ]);

        return response()->json([
            'data' => $material,
            'message' => 'Materi pembelajaran berhasil ditambahkan.',
        ], 201);
    }

    public function updateMaterial(Request $request, Material $material): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:191'],
            'summary' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'media' => ['nullable', 'array'],
            'order' => ['nullable', 'integer'],
            'is_required' => ['sometimes', 'boolean'],
            'status' => ['nullable', 'in:draft,published'],
        ]);

        $material->update($validated);

        return response()->json([
            'data' => $material,
            'message' => 'Materi pembelajaran berhasil diperbarui.',
        ]);
    }

    public function destroyMaterial(Material $material): JsonResponse
    {
        $material->delete();

        return response()->json([
            'data' => null,
            'message' => 'Materi berhasil dihapus.',
        ]);
    }

    public function storeNpc(Request $request, Zone $zone): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'role_label' => ['required', 'string', 'max:191'],
            'greeting' => ['required', 'string'],
            'shirt_color' => ['nullable', 'string'],
            'position_x' => ['nullable', 'numeric'],
            'position_z' => ['nullable', 'numeric'],
            'material_id' => ['nullable', 'integer', 'exists:materials,id'],
        ]);

        $npc = Npc::create([
            'zone_id' => $zone->id,
            'name' => $validated['name'],
            'role_label' => $validated['role_label'],
            'appearance' => [
                'shirtColor' => $validated['shirt_color'] ?? '#0284c7',
                'skinColor' => '#fde68a',
            ],
            'position' => [
                (float) ($validated['position_x'] ?? 0),
                0,
                (float) ($validated['position_z'] ?? -4),
            ],
            'rotation_y' => 0,
            'greeting' => $validated['greeting'],
        ]);

        Dialogue::create([
            'npc_id' => $npc->id,
            'key' => 'default',
            'nodes' => [
                [
                    'id' => 'start',
                    'speaker' => $npc->name,
                    'text' => $validated['greeting'],
                    'actions' => ! empty($validated['material_id'])
                        ? [['type' => 'open_material', 'material_id' => (int) $validated['material_id']]]
                        : [],
                ],
            ],
        ]);

        return response()->json([
            'data' => $npc->load('dialogues'),
            'message' => 'NPC baru berhasil ditambahkan ke zona 3D.',
        ], 201);
    }

    public function destroyNpc(Npc $npc): JsonResponse
    {
        $npc->delete();

        return response()->json([
            'data' => null,
            'message' => 'NPC berhasil dihapus.',
        ]);
    }

    public function storeInteractable(Request $request, Zone $zone): JsonResponse
    {
        $validated = $request->validate([
            'label' => ['required', 'string', 'max:191'],
            'type' => ['required', 'string', 'in:book,board,computer,document,building,tool,custom'],
            'position_x' => ['nullable', 'numeric'],
            'position_z' => ['nullable', 'numeric'],
            'material_id' => ['nullable', 'integer', 'exists:materials,id'],
        ]);

        $interactable = Interactable::create([
            'zone_id' => $zone->id,
            'type' => $validated['type'],
            'label' => $validated['label'],
            'position' => [
                (float) ($validated['position_x'] ?? 3),
                0,
                (float) ($validated['position_z'] ?? -6),
            ],
            'model_key' => $validated['type'],
            'material_id' => $validated['material_id'] ?? null,
            'action' => ! empty($validated['material_id'])
                ? ['type' => 'open_material', 'material_id' => (int) $validated['material_id']]
                : null,
        ]);

        return response()->json([
            'data' => $interactable,
            'message' => 'Objek interaktif 3D berhasil ditambahkan.',
        ], 201);
    }

    public function destroyInteractable(Interactable $interactable): JsonResponse
    {
        $interactable->delete();

        return response()->json([
            'data' => null,
            'message' => 'Objek interaktif berhasil dihapus.',
        ]);
    }

    public function storeMission(Request $request, Chapter $chapter): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:191'],
            'description' => ['nullable', 'string'],
            'reward_xp' => ['nullable', 'integer', 'min:10'],
            'steps' => ['nullable', 'array'],
        ]);

        $learningZone = $chapter->zones()->where('type', 'learning')->first();

        $mission = Mission::create([
            'chapter_id' => $chapter->id,
            'zone_id' => $learningZone?->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'order' => ($chapter->missions()->max('order') ?? 0) + 1,
            'is_required' => true,
            'reward_xp' => $validated['reward_xp'] ?? 100,
        ]);

        if (! empty($validated['steps'])) {
            foreach ($validated['steps'] as $idx => $s) {
                MissionStep::create([
                    'mission_id' => $mission->id,
                    'order' => $idx + 1,
                    'type' => $s['type'] ?? 'read_material',
                    'target_ref' => $s['target_ref'] ?? [],
                    'description' => $s['description'] ?? 'Langkah misi #'.($idx + 1),
                ]);
            }
        }

        return response()->json([
            'data' => $mission->load('steps'),
            'message' => 'Misi pembelajaran berhasil disimpan.',
        ], 201);
    }

    public function destroyMission(Mission $mission): JsonResponse
    {
        $mission->delete();

        return response()->json([
            'data' => null,
            'message' => 'Misi berhasil dihapus.',
        ]);
    }

    // =========================================================
    // MANAJEMEN BANK SOAL & PRACTICE ZONE
    // =========================================================
    public function questions(Request $request): JsonResponse
    {
        $query = Question::with(['options', 'chapter', 'material'])->latest();

        if ($request->filled('chapter_id')) {
            $query->where('chapter_id', (int) $request->input('chapter_id'));
        }
        if ($request->filled('difficulty')) {
            $query->where('difficulty', $request->input('difficulty'));
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    public function storeQuestion(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'chapter_id' => ['required', 'integer', 'exists:chapters,id'],
            'material_id' => ['nullable', 'integer', 'exists:materials,id'],
            'stem' => ['required', 'string'],
            'stimulus' => ['nullable', 'string'],
            'difficulty' => ['required', 'in:easy,medium,hard'],
            'category' => ['nullable', 'string', 'max:191'],
            'explanation' => ['nullable', 'string'],
            'options' => ['required', 'array'],
            'correct_label' => ['required', 'string', 'in:A,B,C,D,E'],
        ]);

        $question = DB::transaction(function () use ($validated, $request) {
            $q = Question::create([
                'chapter_id' => $validated['chapter_id'],
                'material_id' => $validated['material_id'] ?? null,
                'stem' => $validated['stem'],
                'stimulus' => $validated['stimulus'] ?? null,
                'difficulty' => $validated['difficulty'],
                'category' => $validated['category'] ?? 'Umum',
                'explanation' => $validated['explanation'] ?? '',
                'source' => 'manual',
                'status' => 'published',
                'created_by' => $request->user()->id,
            ]);

            foreach (['A', 'B', 'C', 'D', 'E'] as $label) {
                QuestionOption::create([
                    'question_id' => $q->id,
                    'label' => $label,
                    'text' => (string) ($validated['options'][$label] ?? ''),
                    'is_correct' => $label === $validated['correct_label'],
                ]);
            }

            return $q->load(['options', 'chapter', 'material']);
        });

        return response()->json([
            'data' => $question,
            'message' => 'Soal berhasil ditambahkan ke Bank Soal.',
        ], 201);
    }

    public function updateQuestion(Request $request, Question $question): JsonResponse
    {
        $validated = $request->validate([
            'chapter_id' => ['sometimes', 'integer', 'exists:chapters,id'],
            'material_id' => ['nullable', 'integer', 'exists:materials,id'],
            'stem' => ['required', 'string'],
            'stimulus' => ['nullable', 'string'],
            'difficulty' => ['required', 'in:easy,medium,hard'],
            'category' => ['nullable', 'string', 'max:191'],
            'explanation' => ['nullable', 'string'],
            'options' => ['required', 'array'],
            'correct_label' => ['required', 'string', 'in:A,B,C,D,E'],
        ]);

        DB::transaction(function () use ($question, $validated) {
            $question->update([
                'chapter_id' => $validated['chapter_id'] ?? $question->chapter_id,
                'material_id' => $validated['material_id'] ?? $question->material_id,
                'stem' => $validated['stem'],
                'stimulus' => $validated['stimulus'] ?? null,
                'difficulty' => $validated['difficulty'],
                'category' => $validated['category'] ?? $question->category,
                'explanation' => $validated['explanation'] ?? '',
            ]);

            foreach (['A', 'B', 'C', 'D', 'E'] as $label) {
                QuestionOption::updateOrCreate(
                    ['question_id' => $question->id, 'label' => $label],
                    [
                        'text' => (string) ($validated['options'][$label] ?? ''),
                        'is_correct' => $label === $validated['correct_label'],
                    ]
                );
            }
        });

        return response()->json([
            'data' => $question->fresh(['options', 'chapter', 'material']),
            'message' => 'Butir soal berhasil diperbarui.',
        ]);
    }

    public function destroyQuestion(Question $question): JsonResponse
    {
        $question->delete();

        return response()->json([
            'data' => null,
            'message' => 'Soal berhasil dihapus dari Bank Soal.',
        ]);
    }

    public function updatePracticeConfig(Request $request, Chapter $chapter): JsonResponse
    {
        $validated = $request->validate([
            'question_count' => ['required', 'integer', 'min:1', 'max:10'],
            'shuffle_options' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
            'category_filter' => ['nullable', 'array'],
        ]);

        $config = PracticeConfig::updateOrCreate(
            ['chapter_id' => $chapter->id],
            $validated
        );

        return response()->json([
            'data' => $config,
            'message' => 'Konfigurasi Latihan Soal (Practice Zone) berhasil disimpan.',
        ]);
    }

    // =========================================================
    // MANAJEMEN EXAMINATION ZONE (UJIAN RESMI) & REMEDIAL
    // =========================================================
    public function exams(): JsonResponse
    {
        $exams = Exam::with(['chapter', 'schoolClasses', 'questions'])
            ->withCount('attempts')
            ->latest()
            ->get();

        return response()->json([
            'data' => $exams,
        ]);
    }

    public function storeExam(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'chapter_id' => ['required', 'integer', 'exists:chapters,id'],
            'title' => ['required', 'string', 'max:191'],
            'question_count' => ['required', 'integer', 'min:1', 'max:50'],
            'selection_mode' => ['required', 'in:manual,random'],
            'duration_minutes' => ['required', 'integer', 'min:5', 'max:180'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
            'shuffle_questions' => ['sometimes', 'boolean'],
            'shuffle_options' => ['sometimes', 'boolean'],
            'max_attempts' => ['nullable', 'integer', 'min:1', 'max:10'],
            'is_active' => ['sometimes', 'boolean'],
            'class_ids' => ['nullable', 'array'],
            'question_ids' => ['nullable', 'array'],
        ]);

        $exam = DB::transaction(function () use ($validated, $request) {
            $e = Exam::create([
                'chapter_id' => $validated['chapter_id'],
                'title' => $validated['title'],
                'question_count' => $validated['question_count'],
                'selection_mode' => $validated['selection_mode'],
                'duration_minutes' => $validated['duration_minutes'],
                'starts_at' => $validated['starts_at'] ?? now()->subHour(),
                'ends_at' => $validated['ends_at'] ?? now()->addMonths(3),
                'shuffle_questions' => $validated['shuffle_questions'] ?? true,
                'shuffle_options' => $validated['shuffle_options'] ?? true,
                'max_attempts' => $validated['max_attempts'] ?? 1,
                'show_review_after' => 'after_submit',
                'is_active' => $validated['is_active'] ?? true,
                'created_by' => $request->user()->id,
            ]);

            if (! empty($validated['class_ids'])) {
                $e->schoolClasses()->sync($validated['class_ids']);
            } else {
                $e->schoolClasses()->sync(SchoolClass::pluck('id')->all());
            }

            if ($validated['selection_mode'] === 'manual' && ! empty($validated['question_ids'])) {
                $syncData = [];
                foreach (array_values($validated['question_ids']) as $idx => $qid) {
                    $syncData[$qid] = ['order' => $idx + 1];
                }
                $e->questions()->sync($syncData);
            }

            return $e->load(['chapter', 'schoolClasses']);
        });

        return response()->json([
            'data' => $exam,
            'message' => 'Ujian resmi berhasil dibuat.',
        ], 201);
    }

    public function updateExam(Request $request, Exam $exam): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:191'],
            'question_count' => ['sometimes', 'integer', 'min:1', 'max:50'],
            'duration_minutes' => ['sometimes', 'integer', 'min:5', 'max:180'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
            'max_attempts' => ['sometimes', 'integer', 'min:1', 'max:10'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $exam->update($validated);

        return response()->json([
            'data' => $exam->fresh(['chapter', 'schoolClasses']),
            'message' => 'Konfigurasi ujian berhasil diperbarui.',
        ]);
    }

    public function destroyExam(Exam $exam): JsonResponse
    {
        $exam->delete();

        return response()->json([
            'data' => null,
            'message' => 'Ujian berhasil dihapus.',
        ]);
    }

    public function grantRemedial(Request $request, Exam $exam): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'extra_attempts' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        $perm = ExamAttemptPermission::updateOrCreate(
            ['exam_id' => $exam->id, 'user_id' => $validated['user_id']],
            [
                'extra_attempts' => $validated['extra_attempts'],
                'granted_by' => $request->user()->id,
            ]
        );

        return response()->json([
            'data' => $perm,
            'message' => 'Izin ujian ulang (remedial) berhasil diberikan. Nilai resmi akan mengambil nilai tertinggi.',
        ]);
    }

    public function examAttemptDetail(Attempt $attempt): JsonResponse
    {
        return response()->json([
            'data' => $this->attemptService->formatAttemptForClient($attempt, true),
        ]);
    }

    // =========================================================
    // MANAJEMEN SISWA, KELAS & IMPORT DATA SISWA
    // =========================================================
    public function students(Request $request): JsonResponse
    {
        $students = User::role('student')
            ->with(['schoolClasses'])
            ->orderBy('name')
            ->get()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'nisn' => $u->username,
                'class_id' => $u->schoolClasses->first()?->id,
                'class_name' => $u->schoolClasses->first()?->name ?? '-',
                'is_active' => $u->is_active,
                'last_login_at' => $u->last_login_at?->toIso8601String(),
            ]);

        return response()->json([
            'data' => [
                'students' => $students,
                'classes' => SchoolClass::withCount('students')->orderBy('name')->get(),
            ],
        ]);
    }

    public function storeStudent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'nisn' => ['required', 'string', 'max:50', 'unique:users,username'],
            'school_class_id' => ['required', 'integer', 'exists:school_classes,id'],
            'password' => ['nullable', 'string', 'min:4'],
        ]);

        $nisn = trim($validated['nisn']);
        $student = User::create([
            'name' => $validated['name'],
            'username' => $nisn,
            // Password default awal siswa adalah NISN juga sesuai ketetapan pemilik proyek
            'password' => Hash::make($validated['password'] ?: $nisn),
            'avatar_config' => ['skinColor' => '#fde68a', 'shirtColor' => '#06b6d4'],
            'is_active' => true,
        ]);

        $student->assignRole('student');
        $student->schoolClasses()->sync([$validated['school_class_id']]);

        return response()->json([
            'data' => $student->load('schoolClasses'),
            'message' => 'Data siswa berhasil ditambahkan (kata sandi awal: NISN).',
        ], 201);
    }

    public function updateStudent(Request $request, User $student): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'nisn' => ['required', 'string', 'max:50', 'unique:users,username,'.$student->id],
            'school_class_id' => ['nullable', 'integer', 'exists:school_classes,id'],
            'reset_password_to_nisn' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $student->name = $validated['name'];
        $student->username = trim($validated['nisn']);
        if (isset($validated['is_active'])) {
            $student->is_active = $validated['is_active'];
        }
        if (! empty($validated['reset_password_to_nisn'])) {
            $student->password = Hash::make($student->username);
        }
        $student->save();

        if (! empty($validated['school_class_id'])) {
            $student->schoolClasses()->sync([$validated['school_class_id']]);
        }

        return response()->json([
            'data' => $student->fresh('schoolClasses'),
            'message' => 'Data siswa berhasil diperbarui.',
        ]);
    }

    public function destroyStudent(User $student): JsonResponse
    {
        $student->delete();

        return response()->json([
            'data' => null,
            'message' => 'Data siswa berhasil dihapus.',
        ]);
    }

    public function importStudents(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.name' => ['required', 'string'],
            'rows.*.nisn' => ['required', 'string'],
            'rows.*.class_name' => ['nullable', 'string'],
        ]);

        $importedCount = 0;
        DB::transaction(function () use ($validated, &$importedCount) {
            foreach ($validated['rows'] as $row) {
                $nisn = trim($row['nisn']);
                if ($nisn === '') {
                    continue;
                }

                $className = trim($row['class_name'] ?? 'XII-1') ?: 'XII-1';
                $schoolClass = SchoolClass::firstOrCreate(
                    ['name' => $className, 'academic_year' => Setting::getValue('academic_year', '2026/2027')],
                    ['grade' => 12]
                );

                $student = User::updateOrCreate(
                    ['username' => $nisn],
                    [
                        'name' => trim($row['name']),
                        'password' => Hash::make($nisn),
                        'avatar_config' => ['skinColor' => '#fde68a', 'shirtColor' => '#06b6d4'],
                        'is_active' => true,
                    ]
                );

                $student->syncRoles(['student']);
                $student->schoolClasses()->sync([$schoolClass->id]);
                $importedCount++;
            }
        });

        return response()->json([
            'data' => ['imported_count' => $importedCount],
            'message' => "Berhasil mengimpor {$importedCount} data siswa (password awal = NISN).",
        ]);
    }

    public function storeClass(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'academic_year' => ['nullable', 'string', 'max:20'],
        ]);

        $schoolClass = SchoolClass::firstOrCreate(
            [
                'name' => $validated['name'],
                'academic_year' => $validated['academic_year'] ?? Setting::getValue('academic_year', '2026/2027'),
            ],
            [
                'grade' => 12,
                'homeroom_teacher_id' => $request->user()->id,
            ]
        );

        return response()->json([
            'data' => $schoolClass,
            'message' => 'Kelas berhasil ditambahkan.',
        ], 201);
    }

    public function destroyClass(SchoolClass $schoolClass): JsonResponse
    {
        $schoolClass->delete();

        return response()->json([
            'data' => null,
            'message' => 'Kelas berhasil dihapus.',
        ]);
    }

    // =========================================================
    // AI QUESTION GENERATOR (GOOGLE GEMINI API)
    // =========================================================
    public function aiGenerations(): JsonResponse
    {
        $generations = AiGeneration::with(['items', 'chapter', 'material'])
            ->latest()
            ->limit(20)
            ->get();

        return response()->json([
            'data' => $generations,
        ]);
    }

    public function generateAiQuestions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'chapter_id' => ['required', 'integer', 'exists:chapters,id'],
            'material_id' => ['nullable', 'integer', 'exists:materials,id'],
            'count' => ['required', 'integer', 'min:1', 'max:20'],
            'difficulty' => ['required', 'in:easy,medium,hard'],
        ]);

        $chapter = Chapter::findOrFail($validated['chapter_id']);
        $material = ! empty($validated['material_id'])
            ? Material::find($validated['material_id'])
            : null;

        $generation = $this->geminiService->generateQuestions(
            $request->user(),
            $chapter,
            $material,
            (int) $validated['count'],
            $validated['difficulty']
        );

        return response()->json([
            'data' => $generation,
            'message' => 'Soal AI berhasil dibuat sebagai draf. Silakan tinjau, edit, dan setujui untuk memasukkan ke Bank Soal.',
        ], 201);
    }

    public function approveAiItem(Request $request, AiGenerationItem $item): JsonResponse
    {
        $overrides = $request->only(['stem', 'stimulus', 'options', 'correct_label', 'explanation', 'difficulty', 'category']);
        $question = $this->geminiService->approveItem($item, $overrides, $request->user());

        return response()->json([
            'data' => [
                'item' => $item->fresh(),
                'question' => $question,
            ],
            'message' => 'Soal AI berhasil disetujui dan masuk ke Bank Soal.',
        ]);
    }

    public function rejectAiItem(AiGenerationItem $item): JsonResponse
    {
        $item->update(['status' => 'rejected']);

        return response()->json([
            'data' => $item,
            'message' => 'Draf soal AI ditolak.',
        ]);
    }

    // =========================================================
    // LAPORAN & EKSPOR EXCEL / PDF
    // =========================================================
    public function reports(Request $request): JsonResponse
    {
        $classId = $request->filled('class_id') ? (int) $request->input('class_id') : null;
        $chapterId = $request->filled('chapter_id') ? (int) $request->input('chapter_id') : null;

        return response()->json([
            'data' => $this->reportService->getComprehensiveReport($classId, $chapterId),
        ]);
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        $classId = $request->filled('class_id') ? (int) $request->input('class_id') : null;
        $chapterId = $request->filled('chapter_id') ? (int) $request->input('chapter_id') : null;
        $report = $this->reportService->getComprehensiveReport($classId, $chapterId);

        $filename = 'Laporan_Nilai_BAHASA_PLAY_'.now()->format('Ymd_His').'.csv';

        return response()->streamDownload(function () use ($report) {
            $handle = fopen('php://output', 'w');
            // UTF-8 BOM for Microsoft Excel compatibility
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, ['LAPORAN PEMBELAJARAN BAHASA PLAY — SMAN 1 CIRUAS']);
            fputcsv($handle, ['Tanggal Unduh', now()->format('d/m/Y H:i').' WIB']);
            fputcsv($handle, []);
            fputcsv($handle, ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Rata-Rata Latihan', 'Nilai Ujian Resmi (Tertinggi)', 'Progres (%)', 'Status Ketuntasan (KKM 75)']);

            foreach ($report['students'] as $index => $row) {
                fputcsv($handle, [
                    $index + 1,
                    $row['nisn'],
                    $row['name'],
                    $row['class_name'],
                    $row['avg_practice_score'] ?? '-',
                    $row['avg_exam_score'] ?? '-',
                    $row['progress_percent'].'%',
                    $row['passed_kkm'] ? 'TUNTAS' : 'BELUM TUNTAS',
                ]);
            }
            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function exportPdf(Request $request): Response
    {
        $classId = $request->filled('class_id') ? (int) $request->input('class_id') : null;
        $chapterId = $request->filled('chapter_id') ? (int) $request->input('chapter_id') : null;
        $report = $this->reportService->getComprehensiveReport($classId, $chapterId);
        $schoolName = Setting::getValue('school_name', 'SMAN 1 Ciruas');

        $rowsHtml = '';
        foreach ($report['students'] as $i => $row) {
            $no = $i + 1;
            $prac = $row['avg_practice_score'] ?? '-';
            $exam = $row['avg_exam_score'] ?? '-';
            $status = $row['passed_kkm'] ? 'TUNTAS' : 'BELUM TUNTAS';
            $rowsHtml .= "<tr>
                <td style='border:1px solid #334155;padding:8px;text-align:center'>{$no}</td>
                <td style='border:1px solid #334155;padding:8px'>{$row['nisn']}</td>
                <td style='border:1px solid #334155;padding:8px'>{$row['name']}</td>
                <td style='border:1px solid #334155;padding:8px;text-align:center'>{$row['class_name']}</td>
                <td style='border:1px solid #334155;padding:8px;text-align:center'>{$prac}</td>
                <td style='border:1px solid #334155;padding:8px;text-align:center'><b>{$exam}</b></td>
                <td style='border:1px solid #334155;padding:8px;text-align:center'>{$row['progress_percent']}%</td>
                <td style='border:1px solid #334155;padding:8px;text-align:center'>{$status}</td>
            </tr>";
        }

        $html = <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Pembelajaran BAHASA PLAY - {$schoolName}</title>
    <style>
        body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
        .header { text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
        .header h2, .header h3, .header p { margin: 4px 0; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #e2e8f0; border: 1px solid #334155; padding: 8px; }
        .print-btn { margin-bottom: 16px; padding: 8px 16px; background: #0284c7; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
        @media print { .print-btn { display: none; } }
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()">Cetak / Simpan sebagai PDF</button>
    <div class="header">
        <h2>PEMERINTAH PROVINSI BANTEN — DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
        <h3>{$schoolName}</h3>
        <p><b>LAPORAN HASIL PEMBELAJARAN BAHASA INDONESIA KELAS XII — BAHASA PLAY</b></p>
    </div>
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>NISN</th>
                <th>Nama Siswa</th>
                <th>Kelas</th>
                <th>Nilai Latihan</th>
                <th>Nilai Ujian Resmi</th>
                <th>Progres</th>
                <th>Ketuntasan (KKM {$report['kkm_default']})</th>
            </tr>
        </thead>
        <tbody>{$rowsHtml}</tbody>
    </table>
</body>
</html>
HTML;

        return response($html, 200, ['Content-Type' => 'text/html; charset=UTF-8']);
    }
}
