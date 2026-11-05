<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Chapter extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'title',
        'slug',
        'description',
        'cover_image',
        'setting_location',
        'kkm',
        'order',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'number' => 'integer',
            'kkm' => 'integer',
            'order' => 'integer',
        ];
    }

    public function zones(): HasMany
    {
        return $this->hasMany(Zone::class);
    }

    public function materials(): HasMany
    {
        return $this->hasMany(Material::class)->orderBy('order');
    }

    public function missions(): HasMany
    {
        return $this->hasMany(Mission::class)->orderBy('order');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

    public function practiceConfig(): HasOne
    {
        return $this->hasOne(PracticeConfig::class);
    }

    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class);
    }
}
