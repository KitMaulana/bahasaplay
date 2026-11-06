<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class ActivityRecapRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['teacher', 'admin']) ?? false;
    }

    public function rules(): array
    {
        return [
            'class_id' => ['nullable', 'integer', 'exists:school_classes,id'],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d'],
        ];
    }

    public function messages(): array
    {
        return [
            'from.date_format' => 'Format tanggal awal harus TTTT-BB-HH.',
            'to.date_format' => 'Format tanggal akhir harus TTTT-BB-HH.',
        ];
    }
}
