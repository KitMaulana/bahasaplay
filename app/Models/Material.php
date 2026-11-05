<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Material extends Model
{
    use HasFactory;

    protected $fillable = [
        'chapter_id',
        'title',
        'slug',
        'summary',
        'content',
        'media',
        'order',
        'is_required',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'media' => 'array',
            'order' => 'integer',
            'is_required' => 'boolean',
        ];
    }

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }
}
