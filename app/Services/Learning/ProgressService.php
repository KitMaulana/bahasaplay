<?php

namespace App\Services\Learning;

use App\Models\Achievement;
use App\Models\ActivityLog;
use App\Models\Attempt;
use App\Models\Chapter;
use App\Models\ChapterProgress;
use App\Models\MaterialProgress;
use App\Models\MissionProgress;
use App\Models\Setting;
use App\Models\User;
use App\Models\UserAchievement;
use App\Models\UserStat;

class ProgressService
{
    public function markMaterialRead(User $user, int $materialId): MaterialProgress
    {
        $progress = MaterialProgress::updateOrCreate(
            ['user_id' => $user->id, 'material_id' => $materialId],
            [
                'opened_at' => now(),
                'completed_at' => now(),
            ]
        );

        $material = $progress->material()->with('chapter')->first();
        if ($material && $material->chapter) {
            $this->addXp($user, 15);
            ActivityLog::record($user->id, 'material.completed', 'Material', $material->id, [
                'title' => $material->title,
                'chapter_id' => $material->chapter_id,
            ]);
            $this->syncChapterProgress($user, $material->chapter);
            $this->evaluateAchievements($user);
        }

        return $progress;
    }

    public function completeMissionStep(User $user, int $missionId, int $stepId): MissionProgress
    {
        $missionProgress = MissionProgress::firstOrCreate(
            ['user_id' => $user->id, 'mission_id' => $missionId],
            ['status' => 'in_progress', 'completed_steps' => []]
        );

        $steps = $missionProgress->completed_steps ?? [];
        if (! in_array($stepId, $steps, true)) {
            $steps[] = $stepId;
        }

        $mission = $missionProgress->mission()->with(['steps', 'chapter'])->first();
        $allStepIds = $mission ? $mission->steps->pluck('id')->all() : [];
        $allDone = count($allStepIds) > 0 && count(array_intersect($allStepIds, $steps)) >= count($allStepIds);

        $missionProgress->completed_steps = array_values($steps);
        if ($allDone && $missionProgress->status !== 'completed') {
            $missionProgress->status = 'completed';
            $missionProgress->completed_at = now();
            $this->addXp($user, $mission->reward_xp ?? 50);
            ActivityLog::record($user->id, 'mission.completed', 'Mission', $mission->id, [
                'title' => $mission->title,
            ]);
        }
        $missionProgress->save();

        if ($mission && $mission->chapter) {
            $this->syncChapterProgress($user, $mission->chapter);
            $this->evaluateAchievements($user);
        }

        return $missionProgress;
    }

    public function syncChapterProgress(User $user, Chapter $chapter): ChapterProgress
    {
        $kkm = $chapter->kkm ?: (int) Setting::getValue('kkm_default', 75);

        $requiredMaterialIds = $chapter->materials()
            ->where('status', 'published')
            ->where('is_required', true)
            ->pluck('id')
            ->all();

        $completedMaterialCount = 0;
        if (count($requiredMaterialIds) > 0) {
            $completedMaterialCount = MaterialProgress::where('user_id', $user->id)
                ->whereIn('material_id', $requiredMaterialIds)
                ->whereNotNull('completed_at')
                ->count();
        }

        $allMaterialsRead = count($requiredMaterialIds) === 0
            || $completedMaterialCount >= count($requiredMaterialIds);

        $learningStatus = $allMaterialsRead
            ? 'completed'
            : ($completedMaterialCount > 0 ? 'in_progress' : 'in_progress');

        $bestPracticeScore = Attempt::where('user_id', $user->id)
            ->where('chapter_id', $chapter->id)
            ->where('type', 'practice')
            ->where('status', 'submitted')
            ->max('score');

        $practicePassed = $bestPracticeScore !== null && (float) $bestPracticeScore >= $kkm;

        $practiceStatus = 'locked';
        if ($practicePassed) {
            $practiceStatus = 'passed';
        } elseif ($allMaterialsRead) {
            $practiceStatus = 'available';
        }

        // Nilai ujian resmi mengambil nilai tertinggi (best_score) termasuk remedial
        $bestExamScore = Attempt::where('user_id', $user->id)
            ->where('chapter_id', $chapter->id)
            ->where('type', 'exam')
            ->whereIn('status', ['submitted', 'expired'])
            ->max('score');

        $examStatus = 'locked';
        if ($bestExamScore !== null) {
            $examStatus = 'completed';
        } elseif ($practicePassed) {
            $examStatus = 'available';
        }

        $materialRatio = count($requiredMaterialIds) > 0
            ? min(1, $completedMaterialCount / count($requiredMaterialIds))
            : ($allMaterialsRead ? 1 : 0);

        $percent = (int) round($materialRatio * 40);
        if ($practicePassed) {
            $percent += 30;
        }
        if ($bestExamScore !== null) {
            $percent += 30;
        }

        return ChapterProgress::updateOrCreate(
            ['user_id' => $user->id, 'chapter_id' => $chapter->id],
            [
                'learning_status' => $learningStatus,
                'practice_status' => $practiceStatus,
                'exam_status' => $examStatus,
                'best_practice_score' => $bestPracticeScore !== null ? round((float) $bestPracticeScore, 2) : null,
                'exam_score' => $bestExamScore !== null ? round((float) $bestExamScore, 2) : null,
                'progress_percent' => min(100, $percent),
            ]
        );
    }

    public function addXp(User $user, int $amount): UserStat
    {
        $stat = UserStat::firstOrCreate(
            ['user_id' => $user->id],
            ['xp' => 0, 'level' => 1]
        );

        $stat->xp += max(0, $amount);
        $stat->level = max(1, (int) floor($stat->xp / 200) + 1);
        $stat->save();

        return $stat;
    }

    public function evaluateAchievements(User $user): void
    {
        $materialsReadCount = MaterialProgress::where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->count();

        $chaptersProgress = ChapterProgress::where('user_id', $user->id)->get();
        $completedLearningChapters = $chaptersProgress->where('learning_status', 'completed')->count();
        $passedPracticeChapters = $chaptersProgress->where('practice_status', 'passed')->count();
        $completedExamChapters = $chaptersProgress->where('exam_status', 'completed')->count();

        $maxPractice = Attempt::where('user_id', $user->id)
            ->where('type', 'practice')
            ->where('status', 'submitted')
            ->max('score');

        $maxExam = Attempt::where('user_id', $user->id)
            ->where('type', 'exam')
            ->whereIn('status', ['submitted', 'expired'])
            ->max('score');

        $publishedChaptersCount = Chapter::where('status', 'published')->count();

        $unlockKeys = [];

        if ($materialsReadCount >= 1) {
            $unlockKeys[] = 'first_explorer';
        }
        if ($completedLearningChapters >= 1) {
            $unlockKeys[] = 'learning_explorer';
        }
        if ($passedPracticeChapters >= 1) {
            $unlockKeys[] = 'practice_master';
        }
        if (($maxPractice !== null && (float) $maxPractice >= 100) || ($maxExam !== null && (float) $maxExam >= 100)) {
            $unlockKeys[] = 'perfect_score';
        }
        if ($completedExamChapters >= 1) {
            $unlockKeys[] = 'chapter_complete';
        }
        if ($publishedChaptersCount > 0 && $completedExamChapters >= $publishedChaptersCount) {
            $unlockKeys[] = 'bahasa_play_champion';
        }

        if (empty($unlockKeys)) {
            return;
        }

        $achievements = Achievement::whereIn('key', $unlockKeys)->get();
        foreach ($achievements as $achievement) {
            $already = UserAchievement::where('user_id', $user->id)
                ->where('achievement_id', $achievement->id)
                ->exists();

            if (! $already) {
                UserAchievement::create([
                    'user_id' => $user->id,
                    'achievement_id' => $achievement->id,
                    'earned_at' => now(),
                ]);
                $this->addXp($user, $achievement->xp ?? 100);
            }
        }
    }
}
