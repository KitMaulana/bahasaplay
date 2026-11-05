<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mission extends Model
{
    use HasFactory;

    protected $fillable = [
        'chapter_id',
        'zone_id',
        'title',
        'description',
        'order',
        'is_required',
        'reward_xp',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'is_required' => 'boolean',
            'reward_xp' => 'integer',
        ];
    }

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    public function steps(): HasMany
    {
        return $this->hasMany(MissionStep::class)->orderBy('order');
    }
}
