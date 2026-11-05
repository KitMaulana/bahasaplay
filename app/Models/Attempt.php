<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Attempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'chapter_id',
        'type',
        'exam_id',
        'status',
        'started_at',
        'expires_at',
        'submitted_at',
        'score',
        'correct_count',
        'total_questions',
        'passed',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'expires_at' => 'datetime',
            'submitted_at' => 'datetime',
            'score' => 'float',
            'correct_count' => 'integer',
            'total_questions' => 'integer',
            'passed' => 'boolean',
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

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function attemptQuestions(): HasMany
    {
        return $this->hasMany(AttemptQuestion::class)->orderBy('order');
    }
}
