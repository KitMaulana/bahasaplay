<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChapterProgress extends Model
{
    protected $table = 'chapter_progress';

    protected $fillable = [
        'user_id',
        'chapter_id',
        'learning_status',
        'practice_status',
        'exam_status',
        'best_practice_score',
        'exam_score',
        'progress_percent',
    ];

    protected function casts(): array
    {
        return [
            'best_practice_score' => 'float',
            'exam_score' => 'float',
            'progress_percent' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }
}
