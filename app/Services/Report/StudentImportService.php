<?php

namespace App\Services\Report;

use App\Models\SchoolClass;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Impor siswa massal (dari tempel Excel, CSV, atau formulir banyak baris).
 * - Siswa baru: kata sandi awal = NISN.
 * - Siswa lama (NISN sama): nama & kelas diperbarui, kata sandi TIDAK direset.
 * - NISN milik akun guru/admin atau duplikat dalam satu impor: dilewati beserta alasannya.
 */
class StudentImportService
{
    /**
     * @param  array<int, array{name: string, nisn: string, class_id?: int|null, class_name?: string|null}>  $rows
     * @return array{created: int, updated: int, skipped: array<int, array{row: int, nisn: string, reason: string}>}
     */
    public function import(array $rows): array
    {
        $created = 0;
        $updated = 0;
        $skipped = [];
        $seen = [];
        $academicYear = Setting::getValue('academic_year', '2026/2027');

        DB::transaction(function () use ($rows, $academicYear, &$created, &$updated, &$skipped, &$seen) {
            foreach ($rows as $i => $row) {
                $nisn = trim((string) $row['nisn']);
                $name = trim((string) $row['name']);
                if ($nisn === '' || $name === '') {
                    $skipped[] = ['row' => $i + 1, 'nisn' => $nisn, 'reason' => 'NISN atau nama kosong'];

                    continue;
                }
                if (isset($seen[$nisn])) {
                    $skipped[] = ['row' => $i + 1, 'nisn' => $nisn, 'reason' => 'NISN ganda dalam data impor'];

                    continue;
                }
                $seen[$nisn] = true;

                $schoolClass = ! empty($row['class_id'])
                    ? SchoolClass::find($row['class_id'])
                    : null;
                if (! $schoolClass) {
                    $className = trim((string) ($row['class_name'] ?? '')) ?: 'XII-1';
                    $schoolClass = SchoolClass::firstOrCreate(
                        ['name' => $className, 'academic_year' => $academicYear],
                        ['grade' => 12]
                    );
                }

                $existing = User::where('username', $nisn)->first();
                if ($existing && ! $existing->hasRole('student')) {
                    $skipped[] = ['row' => $i + 1, 'nisn' => $nisn, 'reason' => 'NISN sudah dipakai akun guru/admin'];

                    continue;
                }

                if ($existing) {
                    $existing->update(['name' => $name]);
                    $existing->schoolClasses()->sync([$schoolClass->id]);
                    $updated++;

                    continue;
                }

                $student = User::create([
                    'name' => $name,
                    'username' => $nisn,
                    'password' => Hash::make($nisn),
                    'avatar_config' => ['skinColor' => '#fde68a', 'shirtColor' => '#06b6d4'],
                    'is_active' => true,
                ]);
                $student->assignRole('student');
                $student->schoolClasses()->sync([$schoolClass->id]);
                $created++;
            }
        });

        return ['created' => $created, 'updated' => $updated, 'skipped' => $skipped];
    }
}
