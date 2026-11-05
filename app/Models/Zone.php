<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Zone extends Model
{
    use HasFactory;

    protected $fillable = [
        'chapter_id',
        'type',
        'name',
        'description',
        'map_key',
        'area_key',
        'config',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    public function npcs(): HasMany
    {
        return $this->hasMany(Npc::class);
    }

    public function interactables(): HasMany
    {
        return $this->hasMany(Interactable::class);
    }

    public function missions(): HasMany
    {
        return $this->hasMany(Mission::class)->orderBy('order');
    }
}
