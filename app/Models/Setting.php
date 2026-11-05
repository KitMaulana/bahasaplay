<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'array',
        ];
    }

    public static function getValue(string $key, mixed $default = null): mixed
    {
        try {
            $setting = static::query()->where('key', $key)->first();
            if (! $setting) {
                return $default;
            }

            return $setting->value['val'] ?? $setting->value ?? $default;
        } catch (\Throwable) {
            return $default;
        }
    }

    public static function setValue(string $key, mixed $value): self
    {
        return static::query()->updateOrCreate(
            ['key' => $key],
            ['value' => is_array($value) ? $value : ['val' => $value]]
        );
    }
}
