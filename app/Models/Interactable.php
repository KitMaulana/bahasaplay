<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Interactable extends Model
{
    use HasFactory;

    protected $fillable = [
        'zone_id',
        'type',
        'label',
        'position',
        'model_key',
        'action',
        'material_id',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'array',
            'action' => 'array',
        ];
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }
}
