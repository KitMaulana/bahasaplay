<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PracticeConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'chapter_id',
        'question_count',
        'category_filter',
        'difficulty_mix',
        'shuffle_options',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'question_count' => 'integer',
            'category_filter' => 'array',
            'difficulty_mix' => 'array',
            'shuffle_options' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }
}
