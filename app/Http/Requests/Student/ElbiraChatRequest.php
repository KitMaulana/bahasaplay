<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class ElbiraChatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'min:1', 'max:600'],
            'chapter_id' => ['nullable', 'integer', 'exists:chapters,id'],
            'material_id' => ['nullable', 'integer', 'exists:materials,id'],
            // Riwayat singkat agar Elbira paham konteks percakapan (dibatasi supaya hemat token)
            'history' => ['nullable', 'array', 'max:10'],
            'history.*.role' => ['required_with:history', 'string', 'in:user,elbira'],
            'history.*.text' => ['required_with:history', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'message.required' => 'Tulis pertanyaanmu untuk Elbira dulu, ya.',
            'message.max' => 'Pertanyaan terlalu panjang (maksimal 600 karakter).',
        ];
    }
}
