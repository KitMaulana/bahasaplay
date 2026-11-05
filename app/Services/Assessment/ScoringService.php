<?php

namespace App\Services\Assessment;

use App\Models\ActivityLog;
use App\Models\Attempt;
use App\Models\Setting;
use App\Services\Learning\ProgressService;
use Illuminate\Support\Facades\DB;

class ScoringService
{
    public function __construct(
        protected ProgressService $progressService
    ) {}

    public function scoreAttempt(Attempt $attempt, string $finalStatus = 'submitted'): Attempt
    {
        return DB::transaction(function () use ($attempt, $finalStatus) {
            $attempt->load(['attemptQuestions.question.options', 'chapter', 'user']);

            $total = $attempt->attemptQuestions->count();
            $correctCount = 0;

            foreach ($attempt->attemptQuestions as $aq) {
                $correctOption = $aq->question->options->firstWhere('is_correct', true);
                $isCorrect = $correctOption
                    && $aq->selected_option_id !== null
                    && (int) $aq->selected_option_id === (int) $correctOption->id;

                if ($isCorrect) {
                    $correctCount++;
                }

                $aq->update([
                    'is_correct' => $isCorrect,
                ]);
            }

            $score = $total > 0 ? round(($correctCount / $total) * 100, 2) : 0.0;
            $kkm = $attempt->chapter?->kkm ?: (int) Setting::getValue('kkm_default', 75);
            $passed = $score >= $kkm;

            $attempt->update([
                'status' => $finalStatus,
                'submitted_at' => $attempt->submitted_at ?? now(),
                'score' => $score,
                'correct_count' => $correctCount,
                'total_questions' => $total,
                'passed' => $passed,
            ]);

            if ($attempt->user && $attempt->chapter) {
                $xpReward = $attempt->type === 'exam'
                    ? ($passed ? 150 : 50)
                    : ($passed ? 80 : 25);

                $this->progressService->addXp($attempt->user, $xpReward);
                $this->progressService->syncChapterProgress($attempt->user, $attempt->chapter);
                $this->progressService->evaluateAchievements($attempt->user);

                ActivityLog::record(
                    $attempt->user_id,
                    $attempt->type.'.'.$finalStatus,
                    'Attempt',
                    $attempt->id,
                    [
                        'chapter_id' => $attempt->chapter_id,
                        'score' => $score,
                        'passed' => $passed,
                    ]
                );
            }

            return $attempt->fresh(['attemptQuestions.question.options', 'chapter']);
        });
    }
}
