<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Npc extends Model
{
    use HasFactory;

    protected $fillable = [
        'zone_id',
        'name',
        'role_label',
        'appearance',
        'position',
        'rotation_y',
        'greeting',
    ];

    protected function casts(): array
    {
        return [
            'appearance' => 'array',
            'position' => 'array',
            'rotation_y' => 'float',
        ];
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    public function dialogues(): HasMany
    {
        return $this->hasMany(Dialogue::class);
    }
}
