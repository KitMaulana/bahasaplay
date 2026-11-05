<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MissionStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'mission_id',
        'order',
        'type',
        'target_ref',
        'payload',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'target_ref' => 'array',
            'payload' => 'array',
        ];
    }

    public function mission(): BelongsTo
    {
        return $this->belongsTo(Mission::class);
    }
}
