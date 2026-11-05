<?php

namespace App\Services\Assessment;

use App\Models\ActivityLog;
use App\Models\Attempt;
use App\Models\AttemptQuestion;
use App\Models\Chapter;
use App\Models\Exam;
use App\Models\ExamAttemptPermission;
use App\Models\User;
use App\Services\Learning\ProgressService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AttemptService
{
    public function __construct(
        protected QuestionPicker $questionPicker,
        protected ScoringService $scoringService,
        protected ProgressService $progressService
    ) {}

    public function startPractice(User $user, Chapter $chapter): Attempt
    {
        $progress = $this->progressService->syncChapterProgress($user, $chapter);

        if ($progress->learning_status !== 'completed') {
            throw ValidationException::withMessages([
                'chapter' => ['Selesaikan membaca seluruh materi wajib di Zona Belajar sebelum memulai Latihan Soal.'],
            ]);
        }

        $config = $chapter->practiceConfig;
        if ($config && ! $config->is_active) {
            throw ValidationException::withMessages([
                'chapter' => ['Latihan Soal pada BAB ini sedang dinonaktifkan oleh guru.'],
            ]);
        }

        $questions = $this->questionPicker->pickForPractice($chapter);
        if ($questions->isEmpty()) {
            throw ValidationException::withMessages([
                'chapter' => ['Belum ada soal yang tersedia di bank soal untuk BAB ini.'],
            ]);
        }

        $shuffleOptions = $config ? (bool) $config->shuffle_options : true;

        return DB::transaction(function () use ($user, $chapter, $questions, $shuffleOptions) {
            $attempt = Attempt::create([
                'user_id' => $user->id,
                'chapter_id' => $chapter->id,
                'type' => 'practice',
                'exam_id' => null,
                'status' => 'in_progress',
                'started_at' => now(),
                'expires_at' => null,
                'total_questions' => $questions->count(),
                'ip_address' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
            ]);

            foreach ($questions->values() as $idx => $question) {
                AttemptQuestion::create([
                    'attempt_id' => $attempt->id,
                    'question_id' => $question->id,
                    'order' => $idx + 1,
                    'option_map' => $this->questionPicker->buildOptionMap($question, $shuffleOptions),
                ]);
            }

            ActivityLog::record($user->id, 'practice.started', 'Attempt', $attempt->id, [
                'chapter_id' => $chapter->id,
            ]);

            return $attempt->load(['attemptQuestions.question.options', 'chapter']);
        });
    }

    public function startExam(User $user, Exam $exam): Attempt
    {
        $chapter = $exam->chapter;
        $progress = $this->progressService->syncChapterProgress($user, $chapter);

        if ($progress->practice_status !== 'passed') {
            throw ValidationException::withMessages([
                'exam' => ['Nilai Latihan Soal Anda belum mencapai KKM (75). Silakan capai nilai minimal 75 terlebih dahulu untuk membuka Zona Ujian.'],
            ]);
        }

        if (! $exam->is_active) {
            throw ValidationException::withMessages([
                'exam' => ['Ujian ini sedang tidak aktif.'],
            ]);
        }

        $now = now();
        if ($exam->starts_at && $now->lt($exam->starts_at)) {
            throw ValidationException::withMessages([
                'exam' => ['Jadwal ujian belum dimulai.'],
            ]);
        }
        if ($exam->ends_at && $now->gt($exam->ends_at)) {
            throw ValidationException::withMessages([
                'exam' => ['Jadwal ujian telah berakhir.'],
            ]);
        }

        $existingActive = Attempt::where('user_id', $user->id)
            ->where('exam_id', $exam->id)
            ->where('status', 'in_progress')
            ->first();

        if ($existingActive) {
            if ($existingActive->expires_at && $now->gt($existingActive->expires_at)) {
                $this->scoringService->scoreAttempt($existingActive, 'expired');
            } else {
                return $existingActive->load(['attemptQuestions.question.options', 'chapter', 'exam']);
            }
        }

        $finishedCount = Attempt::where('user_id', $user->id)
            ->where('exam_id', $exam->id)
            ->whereIn('status', ['submitted', 'expired'])
            ->count();

        $extra = (int) ExamAttemptPermission::where('exam_id', $exam->id)
            ->where('user_id', $user->id)
            ->value('extra_attempts');

        $allowedAttempts = max(1, (int) $exam->max_attempts) + $extra;

        if ($finishedCount >= $allowedAttempts) {
            throw ValidationException::withMessages([
                'exam' => ['Anda telah menggunakan seluruh kesempatan ujian. Hubungi guru jika memerlukan ujian ulang (remedial).'],
            ]);
        }

        $questions = $this->questionPicker->pickForExam($exam);
        if ($questions->isEmpty()) {
            throw ValidationException::withMessages([
                'exam' => ['Belum ada soal ujian yang tersedia untuk ujian ini.'],
            ]);
        }

        return DB::transaction(function () use ($user, $exam, $questions) {
            $startedAt = now();
            $expiresAt = $startedAt->copy()->addMinutes(max(1, (int) $exam->duration_minutes));
            if ($exam->ends_at && $expiresAt->gt($exam->ends_at)) {
                $expiresAt = $exam->ends_at->copy();
            }

            $attempt = Attempt::create([
                'user_id' => $user->id,
                'chapter_id' => $exam->chapter_id,
                'type' => 'exam',
                'exam_id' => $exam->id,
                'status' => 'in_progress',
                'started_at' => $startedAt,
                'expires_at' => $expiresAt,
                'total_questions' => $questions->count(),
                'ip_address' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
            ]);

            foreach ($questions->values() as $idx => $question) {
                AttemptQuestion::create([
                    'attempt_id' => $attempt->id,
                    'question_id' => $question->id,
                    'order' => $idx + 1,
                    'option_map' => $this->questionPicker->buildOptionMap($question, (bool) $exam->shuffle_options),
                ]);
            }

            ActivityLog::record($user->id, 'exam.started', 'Attempt', $attempt->id, [
                'exam_id' => $exam->id,
                'chapter_id' => $exam->chapter_id,
            ]);

            return $attempt->load(['attemptQuestions.question.options', 'chapter', 'exam']);
        });
    }

    public function saveAnswer(
        User $user,
        Attempt $attempt,
        int $attemptQuestionId,
        string $selectedLabel
    ): AttemptQuestion {
        if ((int) $attempt->user_id !== (int) $user->id) {
            abort(403, 'Anda tidak berhak mengubah jawaban peserta lain.');
        }

        if ($attempt->status !== 'in_progress') {
            throw ValidationException::withMessages([
                'attempt' => ['Sesi pengerjaan sudah selesai dan tidak dapat diubah lagi.'],
            ]);
        }

        if ($attempt->expires_at && now()->gt($attempt->expires_at)) {
            $this->scoringService->scoreAttempt($attempt, 'expired');
            throw ValidationException::withMessages([
                'attempt' => ['Waktu ujian telah habis. Jawaban Anda telah dikumpulkan secara otomatis.'],
            ]);
        }

        $aq = AttemptQuestion::where('attempt_id', $attempt->id)
            ->where('id', $attemptQuestionId)
            ->firstOrFail();

        $label = strtoupper(trim($selectedLabel));
        $optionMap = $aq->option_map ?? [];

        if (! isset($optionMap[$label])) {
            throw ValidationException::withMessages([
                'selected_label' => ['Pilihan jawaban tidak valid.'],
            ]);
        }

        $aq->update([
            'selected_option_id' => $optionMap[$label],
            'answered_at' => now(),
        ]);

        return $aq;
    }

    public function submit(User $user, Attempt $attempt): Attempt
    {
        if ((int) $attempt->user_id !== (int) $user->id) {
            abort(403, 'Anda tidak berhak mengumpulkan sesi milik peserta lain.');
        }

        if ($attempt->status !== 'in_progress') {
            return $attempt->load(['attemptQuestions.question.options', 'chapter']);
        }

        $finalStatus = ($attempt->expires_at && now()->gt($attempt->expires_at))
            ? 'expired'
            : 'submitted';

        return $this->scoringService->scoreAttempt($attempt, $finalStatus);
    }

    public function finalizeExpiredAttempts(): int
    {
        $expired = Attempt::where('status', 'in_progress')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->get();

        foreach ($expired as $attempt) {
            $this->scoringService->scoreAttempt($attempt, 'expired');
        }

        return $expired->count();
    }

    public function formatAttemptForClient(Attempt $attempt, bool $allowReview = false): array
    {
        $attempt->loadMissing(['attemptQuestions.question.options', 'chapter', 'exam']);

        $isFinished = in_array($attempt->status, ['submitted', 'expired'], true);
        $showSolutions = $isFinished && ($attempt->type === 'practice' || $allowReview);

        $questionsPayload = $attempt->attemptQuestions->map(function (AttemptQuestion $aq) use ($showSolutions) {
            $optionsById = $aq->question->options->keyBy('id');
            $optionMap = $aq->option_map ?? [];
            $selectedLabel = null;
            $correctLabel = null;
            $displayOptions = [];

            foreach ($optionMap as $label => $optionId) {
                $opt = $optionsById->get($optionId);
                if (! $opt) {
                    continue;
                }
                if ((int) $aq->selected_option_id === (int) $opt->id) {
                    $selectedLabel = $label;
                }
                if ($opt->is_correct) {
                    $correctLabel = $label;
                }
                $displayOptions[] = [
                    'label' => $label,
                    'text' => $opt->text,
                ];
            }

            $item = [
                'attempt_question_id' => $aq->id,
                'question_id' => $aq->question_id,
                'order' => $aq->order,
                'stem' => $aq->question->stem,
                'stimulus' => $aq->question->stimulus,
                'image' => $aq->question->image,
                'options' => $displayOptions,
                'selected_label' => $selectedLabel,
                'is_answered' => $selectedLabel !== null,
            ];

            // Kunci jawaban & pembahasan HANYA dikirim setelah attempt selesai!
            if ($showSolutions) {
                $item['is_correct'] = (bool) $aq->is_correct;
                $item['correct_label'] = $correctLabel;
                $item['explanation'] = $aq->question->explanation;
            }

            return $item;
        })->values();

        return [
            'id' => $attempt->id,
            'type' => $attempt->type,
            'chapter_id' => $attempt->chapter_id,
            'chapter_title' => $attempt->chapter?->title,
            'exam_id' => $attempt->exam_id,
            'exam_title' => $attempt->exam?->title,
            'status' => $attempt->status,
            'started_at' => $attempt->started_at?->toIso8601String(),
            'expires_at' => $attempt->expires_at?->toIso8601String(),
            'remaining_seconds' => $attempt->expires_at && $attempt->status === 'in_progress'
                ? max(0, now()->diffInSeconds($attempt->expires_at, false))
                : 0,
            'submitted_at' => $attempt->submitted_at?->toIso8601String(),
            'score' => $isFinished ? $attempt->score : null,
            'correct_count' => $isFinished ? $attempt->correct_count : null,
            'total_questions' => $attempt->total_questions,
            'passed' => $isFinished ? $attempt->passed : null,
            'kkm' => $attempt->chapter?->kkm ?? 75,
            'questions' => $questionsPayload,
        ];
    }
}
