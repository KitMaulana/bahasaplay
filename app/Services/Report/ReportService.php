<?php

namespace App\Services\Report;

use App\Models\ActivityLog;
use App\Models\Attempt;
use App\Models\Chapter;
use App\Models\ChapterProgress;
use App\Models\SchoolClass;
use App\Models\Setting;
use App\Models\User;

class ReportService
{
    public function getComprehensiveReport(?int $classId = null, ?int $chapterId = null): array
    {
        $kkmDefault = (int) Setting::getValue('kkm_default', 75);

        $studentsQuery = User::role('student')->with('schoolClasses');
        if ($classId) {
            $studentsQuery->whereHas('schoolClasses', fn ($q) => $q->where('school_classes.id', $classId));
        }
        $students = $studentsQuery->orderBy('name')->get();
        $studentIds = $students->pluck('id')->all();

        $chaptersQuery = Chapter::orderBy('number');
        if ($chapterId) {
            $chaptersQuery->where('id', $chapterId);
        }
        $chapters = $chaptersQuery->get();

        $progressRows = ChapterProgress::whereIn('user_id', $studentIds)
            ->when($chapterId, fn ($q) => $q->where('chapter_id', $chapterId))
            ->get();

        $practiceAttempts = Attempt::with(['user.schoolClasses', 'chapter'])
            ->whereIn('user_id', $studentIds)
            ->where('type', 'practice')
            ->where('status', 'submitted')
            ->when($chapterId, fn ($q) => $q->where('chapter_id', $chapterId))
            ->latest('submitted_at')
            ->get();

        $examAttempts = Attempt::with(['user.schoolClasses', 'chapter', 'exam'])
            ->whereIn('user_id', $studentIds)
            ->where('type', 'exam')
            ->whereIn('status', ['submitted', 'expired'])
            ->when($chapterId, fn ($q) => $q->where('chapter_id', $chapterId))
            ->latest('submitted_at')
            ->get();

        // 1 & 2. Rekap nilai latihan & nilai ujian tertinggi per siswa
        $studentRows = $students->map(function (User $student) use ($progressRows, $kkmDefault) {
            $sp = $progressRows->where('user_id', $student->id);
            $avgPractice = $sp->whereNotNull('best_practice_score')->avg('best_practice_score');
            $avgExam = $sp->whereNotNull('exam_score')->avg('exam_score');
            $avgProgress = $sp->avg('progress_percent') ?? 0;

            return [
                'student_id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->username,
                'class_name' => $student->schoolClasses->first()?->name ?? '-',
                'avg_practice_score' => $avgPractice !== null ? round((float) $avgPractice, 2) : null,
                'avg_exam_score' => $avgExam !== null ? round((float) $avgExam, 2) : null,
                'progress_percent' => round((float) $avgProgress, 0),
                'passed_kkm' => $avgExam !== null && (float) $avgExam >= $kkmDefault,
                'chapters' => $sp->map(fn ($p) => [
                    'chapter_id' => $p->chapter_id,
                    'learning_status' => $p->learning_status,
                    'practice_status' => $p->practice_status,
                    'exam_status' => $p->exam_status,
                    'best_practice_score' => $p->best_practice_score,
                    'exam_score' => $p->exam_score,
                    'progress_percent' => $p->progress_percent,
                ])->values(),
            ];
        })->values();

        // 3 & 4. Rata-rata nilai kelas & persentase ketuntasan
        $classes = SchoolClass::with('students')->get();
        $classSummary = $classes->map(function (SchoolClass $schoolClass) use ($studentRows, $kkmDefault) {
            $inClass = $studentRows->where('class_name', $schoolClass->name);
            $withExam = $inClass->whereNotNull('avg_exam_score');
            $passedCount = $withExam->filter(fn ($r) => (float) $r['avg_exam_score'] >= $kkmDefault)->count();

            return [
                'class_id' => $schoolClass->id,
                'class_name' => $schoolClass->name,
                'student_count' => $inClass->count(),
                'avg_practice' => round((float) ($inClass->whereNotNull('avg_practice_score')->avg('avg_practice_score') ?? 0), 2),
                'avg_exam' => round((float) ($withExam->avg('avg_exam_score') ?? 0), 2),
                'completion_rate' => $inClass->count() > 0
                    ? round(($passedCount / $inClass->count()) * 100, 1)
                    : 0.0,
            ];
        })->values();

        // 5. Siswa yang belum mencapai nilai 75 (KKM)
        $belowKkmStudents = $studentRows->filter(function ($r) use ($kkmDefault) {
            if ($r['avg_exam_score'] !== null && (float) $r['avg_exam_score'] < $kkmDefault) {
                return true;
            }
            if ($r['avg_practice_score'] !== null && (float) $r['avg_practice_score'] < $kkmDefault) {
                return true;
            }

            return false;
        })->values();

        // 6. Progres pembelajaran setiap BAB
        $chapterSummary = $chapters->map(function (Chapter $ch) use ($progressRows, $students) {
            $cp = $progressRows->where('chapter_id', $ch->id);
            $totalStudents = max(1, $students->count());

            return [
                'chapter_id' => $ch->id,
                'number' => $ch->number,
                'title' => $ch->title,
                'setting_location' => $ch->setting_location,
                'learning_completed_count' => $cp->where('learning_status', 'completed')->count(),
                'practice_passed_count' => $cp->where('practice_status', 'passed')->count(),
                'exam_completed_count' => $cp->where('exam_status', 'completed')->count(),
                'avg_practice_score' => round((float) ($cp->whereNotNull('best_practice_score')->avg('best_practice_score') ?? 0), 2),
                'avg_exam_score' => round((float) ($cp->whereNotNull('exam_score')->avg('exam_score') ?? 0), 2),
                'completion_percent' => round(($cp->where('exam_status', 'completed')->count() / $totalStudents) * 100, 1),
            ];
        })->values();

        // 7. Riwayat aktivitas siswa terbaru
        $recentLogs = ActivityLog::with('user')
            ->whereIn('user_id', $studentIds)
            ->latest()
            ->limit(40)
            ->get()
            ->map(fn (ActivityLog $log) => [
                'id' => $log->id,
                'user_name' => $log->user?->name ?? '-',
                'nisn' => $log->user?->username ?? '-',
                'action' => $log->action,
                'properties' => $log->properties,
                'created_at' => $log->created_at?->toIso8601String(),
            ]);

        return [
            'kkm_default' => $kkmDefault,
            'students' => $studentRows,
            'class_summary' => $classSummary,
            'below_kkm_students' => $belowKkmStudents,
            'chapter_summary' => $chapterSummary,
            'recent_practice_attempts' => $practiceAttempts->take(30)->map(fn (Attempt $a) => [
                'id' => $a->id,
                'student_name' => $a->user?->name,
                'nisn' => $a->user?->username,
                'class_name' => $a->user?->schoolClasses->first()?->name ?? '-',
                'chapter_title' => "BAB {$a->chapter?->number}: {$a->chapter?->title}",
                'score' => $a->score,
                'passed' => $a->passed,
                'submitted_at' => $a->submitted_at?->toIso8601String(),
            ]),
            'recent_exam_attempts' => $examAttempts->take(30)->map(fn (Attempt $a) => [
                'id' => $a->id,
                'student_name' => $a->user?->name,
                'nisn' => $a->user?->username,
                'class_name' => $a->user?->schoolClasses->first()?->name ?? '-',
                'chapter_title' => "BAB {$a->chapter?->number}: {$a->chapter?->title}",
                'exam_title' => $a->exam?->title,
                'score' => $a->score,
                'passed' => $a->passed,
                'status' => $a->status,
                'submitted_at' => $a->submitted_at?->toIso8601String(),
            ]),
            'activity_logs' => $recentLogs,
        ];
    }
}
