<?php

namespace App\Services\Assessment;

use App\Models\Chapter;
use App\Models\Exam;
use App\Models\Question;
use Illuminate\Support\Collection;

class QuestionPicker
{
    public function pickForPractice(Chapter $chapter): Collection
    {
        $config = $chapter->practiceConfig;
        $limit = min(10, max(1, $config?->question_count ?? 10));

        $query = Question::with('options')
            ->where('chapter_id', $chapter->id)
            ->where('status', 'published');

        if (! empty($config?->category_filter)) {
            $query->whereIn('category', (array) $config->category_filter);
        }

        return $query->inRandomOrder()->limit($limit)->get();
    }

    public function pickForExam(Exam $exam): Collection
    {
        if ($exam->selection_mode === 'manual' && $exam->questions()->count() > 0) {
            $questions = $exam->questions()->with('options')->get();

            return $exam->shuffle_questions ? $questions->shuffle()->values() : $questions->values();
        }

        $limit = max(1, $exam->question_count ?: 10);
        $query = Question::with('options')
            ->where('chapter_id', $exam->chapter_id)
            ->where('status', 'published');

        return $exam->shuffle_questions
            ? $query->inRandomOrder()->limit($limit)->get()
            : $query->orderBy('id')->limit($limit)->get();
    }

    public function buildOptionMap(Question $question, bool $shuffle = true): array
    {
        $options = $question->options->values();
        if ($shuffle) {
            $options = $options->shuffle()->values();
        }

        $labels = ['A', 'B', 'C', 'D', 'E'];
        $map = [];
        foreach ($options as $index => $option) {
            $label = $labels[$index] ?? chr(65 + $index);
            $map[$label] = $option->id;
        }

        return $map;
    }
}
