<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = [
        'chapter_id',
        'title',
        'question_count',
        'selection_mode',
        'duration_minutes',
        'starts_at',
        'ends_at',
        'shuffle_questions',
        'shuffle_options',
        'max_attempts',
        'show_review_after',
        'is_active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'question_count' => 'integer',
            'duration_minutes' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'shuffle_questions' => 'boolean',
            'shuffle_options' => 'boolean',
            'max_attempts' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(Question::class, 'exam_questions')
            ->withPivot('order')
            ->orderBy('exam_questions.order')
            ->withTimestamps();
    }

    public function schoolClasses(): BelongsToMany
    {
        return $this->belongsToMany(SchoolClass::class, 'exam_class')
            ->withTimestamps();
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(Attempt::class);
    }

    public function attemptPermissions(): HasMany
    {
        return $this->hasMany(ExamAttemptPermission::class);
    }
}
