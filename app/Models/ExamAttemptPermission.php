<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamAttemptPermission extends Model
{
    protected $fillable = [
        'exam_id',
        'user_id',
        'extra_attempts',
        'granted_by',
    ];

    protected function casts(): array
    {
        return [
            'extra_attempts' => 'integer',
        ];
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
