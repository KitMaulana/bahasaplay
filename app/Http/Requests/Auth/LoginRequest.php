<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'identifier' => ['required', 'string', 'max:191'],
            'password' => ['required', 'string'],
            // Peran yang dipilih di halaman login; server memastikan akun benar-benar berperan itu.
            'role' => ['required', 'in:student,teacher,admin'],
        ];
    }

    public function messages(): array
    {
        return [
            'identifier.required' => 'NISN, Email, atau Username wajib diisi.',
            'password.required' => 'Kata sandi wajib diisi.',
            'role.required' => 'Pilih peran masuk terlebih dahulu.',
            'role.in' => 'Peran masuk tidak dikenal.',
        ];
    }
}
