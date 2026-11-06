<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class ImportStudentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['teacher', 'admin']) ?? false;
    }

    public function rules(): array
    {
        return [
            'rows' => ['required', 'array', 'min:1', 'max:500'],
            'rows.*.name' => ['required', 'string', 'max:191'],
            'rows.*.nisn' => ['required', 'string', 'max:50', 'regex:/^[0-9A-Za-z.\-]+$/'],
            'rows.*.class_id' => ['nullable', 'integer', 'exists:school_classes,id'],
            'rows.*.class_name' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'rows.required' => 'Data siswa yang akan diimpor masih kosong.',
            'rows.max' => 'Maksimal 500 siswa per sekali impor.',
            'rows.*.name.required' => 'Nama siswa pada baris :position wajib diisi.',
            'rows.*.nisn.required' => 'NISN pada baris :position wajib diisi.',
            'rows.*.nisn.regex' => 'NISN pada baris :position hanya boleh berisi angka/huruf tanpa spasi.',
        ];
    }
}
