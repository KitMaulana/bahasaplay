<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserStat extends Model
{
    protected $fillable = [
        'user_id',
        'xp',
        'level',
        'last_position',
    ];

    protected function casts(): array
    {
        return [
            'xp' => 'integer',
            'level' => 'integer',
            'last_position' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
