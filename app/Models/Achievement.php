<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    protected $fillable = [
        'key',
        'name',
        'description',
        'icon',
        'rule',
        'xp',
    ];

    protected function casts(): array
    {
        return [
            'rule' => 'array',
            'xp' => 'integer',
        ];
    }
}
