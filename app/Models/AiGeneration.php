<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiGeneration extends Model
{
    protected $fillable = [
        'teacher_id',
        'chapter_id',
        'material_id',
        'requested_count',
        'difficulty',
        'model',
        'status',
        'error',
        'tokens_used',
        'prompt_hash',
    ];

    protected function casts(): array
    {
        return [
            'requested_count' => 'integer',
            'tokens_used' => 'integer',
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(AiGenerationItem::class);
    }
}
