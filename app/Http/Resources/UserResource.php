<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'role' => $this->primaryRole(),
            'roles' => $this->getRoleNames()->values(),
            'avatar_config' => $this->avatar_config ?? [
                'skinColor' => '#fde68a',
                'shirtColor' => '#06b6d4',
            ],
            'is_active' => (bool) $this->is_active,
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'school_classes' => $this->whenLoaded('schoolClasses', function () {
                return $this->schoolClasses->map(fn ($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'grade' => $c->grade,
                    'academic_year' => $c->academic_year,
                ]);
            }),
            'teaching_classes' => $this->whenLoaded('teachingClasses', function () {
                return $this->teachingClasses->map(fn ($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'grade' => $c->grade,
                    'academic_year' => $c->academic_year,
                ]);
            }),
        ];
    }
}
