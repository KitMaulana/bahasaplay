<?php

namespace App\Services\Report;

use App\Models\ActivityLog;
use App\Models\Attempt;
use App\Models\Chapter;
use App\Models\ChapterProgress;
use App\Models\Setting;
use App\Models\User;
use App\Models\UserStat;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

/**
 * Rekapitulasi aktivitas & pemantauan progres siswa untuk guru.
 * Rentang tanggal ditafsirkan dalam zona Asia/Jakarta; data tersimpan di database apa adanya.
 */
class ActivityRecapService
{
    public const ACTION_LABELS = [
        'auth.login' => 'Masuk aplikasi',
        'material.completed' => 'Menyelesaikan materi',
        'mission.completed' => 'Menyelesaikan misi',
        'practice.started' => 'Memulai latihan soal',
        'practice.submitted' => 'Mengumpulkan latihan soal',
        'practice.expired' => 'Latihan soal kedaluwarsa',
        'exam.started' => 'Memulai ujian resmi',
        'exam.submitted' => 'Mengumpulkan ujian resmi',
        'exam.expired' => 'Ujian resmi berakhir (waktu habis)',
    ];

    /**
     * @return array{from: CarbonImmutable, to: CarbonImmutable}
     */
    public function resolveRange(?string $from, ?string $to, int $defaultDays = 30): array
    {
        $tz = config('app.timezone', 'Asia/Jakarta');
        $end = $to ? CarbonImmutable::parse($to, $tz)->endOfDay() : CarbonImmutable::now($tz)->endOfDay();
        $start = $from ? CarbonImmutable::parse($from, $tz)->startOfDay() : $end->subDays($defaultDays - 1)->startOfDay();
        if ($start->greaterThan($end)) {
            [$start, $end] = [$end->startOfDay(), $start->endOfDay()];
        }

        return ['from' => $start, 'to' => $end];
    }

    /** Siswa (opsional per kelas), urut nama. */
    private function students(?int $classId): Collection
    {
        return User::role('student')
            ->with('schoolClasses')
            ->when($classId, fn ($q) => $q->whereHas('schoolClasses', fn ($c) => $c->where('school_classes.id', $classId)))
            ->orderBy('name')
            ->get();
    }

    public function recap(?int $classId, ?string $from, ?string $to): array
    {
        ['from' => $start, 'to' => $end] = $this->resolveRange($from, $to);
        $students = $this->students($classId);
        $ids = $students->pluck('id')->all();

        $logs = ActivityLog::whereIn('user_id', $ids)
            ->whereBetween('created_at', [$start, $end])
            ->orderByDesc('created_at')
            ->get();

        $byUser = $logs->groupBy('user_id');
        $tz = config('app.timezone', 'Asia/Jakarta');
        $stats = UserStat::whereIn('user_id', $ids)->get()->keyBy('user_id');

        $rows = $students->map(function (User $s) use ($byUser, $tz, $stats) {
            $ul = $byUser->get($s->id, collect());
            $count = fn (string $action) => $ul->where('action', $action)->count();
            $submittedScores = $ul->whereIn('action', ['practice.submitted', 'exam.submitted'])
                ->map(fn ($l) => $l->properties['score'] ?? null)
                ->filter(fn ($v) => $v !== null);
            $practicePassed = $ul->where('action', 'practice.submitted')
                ->filter(fn ($l) => ! empty($l->properties['passed']))->count();
            $activeDays = $ul->map(fn ($l) => $l->created_at->copy()->setTimezone($tz)->toDateString())->unique()->count();
            $last = $ul->first();

            $total = $ul->count();

            return [
                'student_id' => $s->id,
                'name' => $s->name,
                'nisn' => $s->username,
                'class_id' => $s->schoolClasses->first()?->id,
                'class_name' => $s->schoolClasses->first()?->name ?? '-',
                'is_active' => (bool) $s->is_active,
                'logins' => $count('auth.login'),
                'materials_completed' => $count('material.completed'),
                'missions_completed' => $count('mission.completed'),
                'practice_started' => $count('practice.started'),
                'practice_submitted' => $count('practice.submitted'),
                'practice_passed' => $practicePassed,
                'exam_started' => $count('exam.started'),
                'exam_submitted' => $count('exam.submitted') + $count('exam.expired'),
                'avg_score' => $submittedScores->isNotEmpty() ? round((float) $submittedScores->avg(), 1) : null,
                'total_activities' => $total,
                'active_days' => $activeDays,
                'last_activity_at' => $last?->created_at?->toIso8601String(),
                'last_login_at' => $s->last_login_at?->toIso8601String(),
                'xp' => (int) ($stats->get($s->id)?->xp ?? 0),
                'level' => (int) ($stats->get($s->id)?->level ?? 1),
                // aktif: ≥3 hari aktif atau ≥10 aktivitas; jarang: ada aktivitas; belum: tanpa aktivitas
                'engagement' => $total === 0 ? 'belum' : (($activeDays >= 3 || $total >= 10) ? 'aktif' : 'jarang'),
            ];
        })->values();

        // Aktivitas harian (maks. 62 hari terakhir dari rentang agar grafik tetap ringkas)
        $chartStart = $start->greaterThan($end->subDays(61)) ? $start : $end->subDays(61)->startOfDay();
        $daily = [];
        for ($d = $chartStart; $d->lessThanOrEqualTo($end); $d = $d->addDay()) {
            $daily[$d->toDateString()] = 0;
        }
        foreach ($logs as $log) {
            $key = $log->created_at->copy()->setTimezone($tz)->toDateString();
            if (array_key_exists($key, $daily)) {
                $daily[$key]++;
            }
        }

        $studentNames = $students->keyBy('id');
        $chapterTitles = Chapter::pluck('number', 'id');
        $feed = $logs->take(120)->map(function (ActivityLog $l) use ($studentNames, $chapterTitles) {
            $p = $l->properties ?? [];
            $detail = [];
            if (! empty($p['chapter_id']) && isset($chapterTitles[$p['chapter_id']])) {
                $detail[] = 'BAB '.$chapterTitles[$p['chapter_id']];
            }
            if (array_key_exists('score', $p)) {
                $detail[] = 'nilai '.$p['score'].(! empty($p['passed']) ? ' (lulus)' : ' (belum lulus)');
            }
            $st = $studentNames->get($l->user_id);

            return [
                'id' => $l->id,
                'student_id' => $l->user_id,
                'student_name' => $st?->name ?? '-',
                'class_name' => $st?->schoolClasses->first()?->name ?? '-',
                'action' => $l->action,
                'label' => self::ACTION_LABELS[$l->action] ?? $l->action,
                'detail' => implode(' · ', $detail),
                'created_at' => $l->created_at?->toIso8601String(),
            ];
        })->values();

        $scores = $logs->whereIn('action', ['practice.submitted', 'exam.submitted'])
            ->map(fn ($l) => $l->properties['score'] ?? null)->filter(fn ($v) => $v !== null);

        return [
            'range' => [
                'from' => $start->toDateString(),
                'to' => $end->toDateString(),
            ],
            'summary' => [
                'total_students' => $students->count(),
                'active_students' => $rows->where('total_activities', '>', 0)->count(),
                'inactive_students' => $rows->where('total_activities', 0)->count(),
                'total_activities' => $logs->count(),
                'logins' => $logs->where('action', 'auth.login')->count(),
                'materials_completed' => $logs->where('action', 'material.completed')->count(),
                'practice_submitted' => $logs->where('action', 'practice.submitted')->count(),
                'exam_submitted' => $logs->whereIn('action', ['exam.submitted', 'exam.expired'])->count(),
                'avg_score' => $scores->isNotEmpty() ? round((float) $scores->avg(), 1) : null,
            ],
            'daily' => collect($daily)->map(fn ($count, $date) => ['date' => $date, 'count' => $count])->values(),
            'students' => $rows,
            'feed' => $feed,
            'action_labels' => self::ACTION_LABELS,
        ];
    }

    /** Detail progres satu siswa: per BAB, riwayat percobaan, dan aktivitas terbaru. */
    public function studentDetail(User $student): array
    {
        $kkmDefault = (int) Setting::getValue('kkm_default', 75);
        $chapters = Chapter::withCount('materials')->orderBy('number')->get();
        $progress = ChapterProgress::where('user_id', $student->id)->get()->keyBy('chapter_id');
        $stat = UserStat::where('user_id', $student->id)->first();

        $attempts = Attempt::with(['chapter', 'exam'])
            ->where('user_id', $student->id)
            ->latest('created_at')
            ->limit(30)
            ->get()
            ->map(fn (Attempt $a) => [
                'id' => $a->id,
                'type' => $a->type,
                'chapter' => $a->chapter ? "BAB {$a->chapter->number}: {$a->chapter->title}" : '-',
                'exam_title' => $a->exam?->title,
                'status' => $a->status,
                'score' => $a->score,
                'passed' => $a->passed,
                'started_at' => $a->started_at?->toIso8601String(),
                'submitted_at' => $a->submitted_at?->toIso8601String(),
            ]);

        $logs = ActivityLog::where('user_id', $student->id)
            ->latest()
            ->limit(40)
            ->get()
            ->map(fn (ActivityLog $l) => [
                'id' => $l->id,
                'action' => $l->action,
                'label' => self::ACTION_LABELS[$l->action] ?? $l->action,
                'properties' => $l->properties,
                'created_at' => $l->created_at?->toIso8601String(),
            ]);

        return [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->username,
                'class_name' => $student->schoolClasses()->first()?->name ?? '-',
                'is_active' => (bool) $student->is_active,
                'last_login_at' => $student->last_login_at?->toIso8601String(),
                'xp' => (int) ($stat?->xp ?? 0),
                'level' => (int) ($stat?->level ?? 1),
            ],
            'kkm_default' => $kkmDefault,
            'chapters' => $chapters->map(fn (Chapter $c) => [
                'chapter_id' => $c->id,
                'number' => $c->number,
                'title' => $c->title,
                'status' => $c->status,
                'kkm' => $c->kkm ?? $kkmDefault,
                'learning_status' => $progress->get($c->id)?->learning_status ?? 'not_started',
                'practice_status' => $progress->get($c->id)?->practice_status ?? 'locked',
                'exam_status' => $progress->get($c->id)?->exam_status ?? 'locked',
                'best_practice_score' => $progress->get($c->id)?->best_practice_score,
                'exam_score' => $progress->get($c->id)?->exam_score,
                'progress_percent' => (int) ($progress->get($c->id)?->progress_percent ?? 0),
            ])->values(),
            'attempts' => $attempts,
            'activities' => $logs,
        ];
    }
}
