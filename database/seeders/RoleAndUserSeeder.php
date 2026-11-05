<?php

namespace Database\Seeders;

use App\Models\SchoolClass;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndUserSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'manage_users',
            'manage_roles',
            'manage_settings',
            'manage_chapters',
            'manage_materials',
            'manage_questions',
            'manage_exams',
            'view_reports',
            'use_ai_generator',
            'access_learning',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $teacherRole = Role::firstOrCreate(['name' => 'teacher', 'guard_name' => 'web']);
        $studentRole = Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);

        $adminRole->syncPermissions($permissions);
        $teacherRole->syncPermissions([
            'manage_users',
            'manage_chapters',
            'manage_materials',
            'manage_questions',
            'manage_exams',
            'view_reports',
            'use_ai_generator',
            'access_learning',
        ]);
        $studentRole->syncPermissions(['access_learning']);

        Setting::setValue('school_name', 'SMAN 1 Ciruas');
        Setting::setValue('academic_year', '2026/2027');
        Setting::setValue('kkm_default', 75);
        Setting::setValue('app_tagline', 'Mainkan gamenya, pelajari bahasanya.');

        $admin = User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Administrator BAHASA PLAY',
                'email' => 'admin@smancir1.sch.id',
                'password' => Hash::make('admin123'),
                'avatar_config' => ['skinColor' => '#fde68a', 'shirtColor' => '#6366f1'],
                'is_active' => true,
            ]
        );
        $admin->syncRoles([$adminRole]);

        $teacher = User::updateOrCreate(
            ['username' => 'bangkit'],
            [
                'name' => 'Bangkit Candra Maulana, S.Pd.',
                'email' => 'guru@smancir1.sch.id',
                'password' => Hash::make('smancir123'),
                'avatar_config' => ['skinColor' => '#fde68a', 'shirtColor' => '#0ea5e9'],
                'is_active' => true,
            ]
        );
        $teacher->syncRoles([$teacherRole]);

        $class1 = SchoolClass::updateOrCreate(
            ['name' => 'XII-1', 'academic_year' => '2026/2027'],
            ['grade' => 12, 'homeroom_teacher_id' => $teacher->id]
        );
        $class2 = SchoolClass::updateOrCreate(
            ['name' => 'XII-2', 'academic_year' => '2026/2027'],
            ['grade' => 12, 'homeroom_teacher_id' => $teacher->id]
        );
        $class3 = SchoolClass::updateOrCreate(
            ['name' => 'XII-3', 'academic_year' => '2026/2027'],
            ['grade' => 12, 'homeroom_teacher_id' => $teacher->id]
        );

        $teacher->teachingClasses()->sync([$class1->id, $class2->id, $class3->id]);

        $sampleStudents = [
            ['nisn' => '0081234501', 'name' => 'Aditya Pratama', 'class' => $class1],
            ['nisn' => '0081234502', 'name' => 'Bunga Citra Lestari', 'class' => $class1],
            ['nisn' => '0081234503', 'name' => 'Chandra Wijaya', 'class' => $class1],
            ['nisn' => '0081234504', 'name' => 'Dewi Sartika Putri', 'class' => $class1],
            ['nisn' => '0081234505', 'name' => 'Eko Prasetyo', 'class' => $class1],
            ['nisn' => '0081234506', 'name' => 'Farah Nabila', 'class' => $class2],
            ['nisn' => '0081234507', 'name' => 'Gilang Ramadhan', 'class' => $class2],
            ['nisn' => '0081234508', 'name' => 'Hana Pertiwi', 'class' => $class2],
            ['nisn' => '0081234509', 'name' => 'Indra Kusuma', 'class' => $class3],
            ['nisn' => '0081234510', 'name' => 'Jihan Aulia', 'class' => $class3],
        ];

        foreach ($sampleStudents as $idx => $item) {
            $student = User::updateOrCreate(
                ['username' => $item['nisn']],
                [
                    'name' => $item['name'],
                    'email' => null,
                    'password' => Hash::make($item['nisn']),
                    'avatar_config' => [
                        'skinColor' => '#fde68a',
                        'shirtColor' => $idx % 2 === 0 ? '#06b6d4' : '#10b981',
                    ],
                    'is_active' => true,
                ]
            );
            $student->syncRoles([$studentRole]);
            $student->schoolClasses()->sync([$item['class']->id]);
        }
    }
}
