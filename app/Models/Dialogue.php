<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dialogue extends Model
{
    use HasFactory;

    protected $fillable = [
        'npc_id',
        'key',
        'nodes',
    ];

    protected function casts(): array
    {
        return [
            'nodes' => 'array',
        ];
    }

    public function npc(): BelongsTo
    {
        return $this->belongsTo(Npc::class);
    }
}
