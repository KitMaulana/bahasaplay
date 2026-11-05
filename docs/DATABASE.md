# DATABASE — BAHASA PLAY (MySQL)

> Rancangan awal. Agen boleh menyesuaikan detail kolom, tetapi **perubahan struktur penting harus dicatat di sini** dan di PROGRESS.md.
> Semua tabel punya `id` (bigint), `created_at`, `updated_at` kecuali disebutkan. FK pakai `foreignId()->constrained()`.

## 1. Pengguna & organisasi

**users** — `name`, `username` (unique; NIS/NISN untuk siswa, NIP/username untuk guru), `email` (nullable, unique), `password`, `avatar_config` (json: warna kulit/baju/rambut avatar), `is_active` (bool), `last_login_at`.
Role via **spatie/laravel-permission** (`roles`, `permissions`, `model_has_roles`, ...): `admin`, `teacher`, `student`.

**school_classes** — `name` (mis. "XII-1"), `grade` (default 12), `academic_year` (mis. "2026/2027"), `homeroom_teacher_id` (nullable → users).

**class_student** — `school_class_id`, `student_id` (→ users). Unique (class, student, tahun ajaran via kelas).

**class_teacher** — `school_class_id`, `teacher_id` (→ users). Guru pengampu.

**settings** — `key` (unique), `value` (json). Contoh: `kkm_default=75`, `school_name`, `app_logo`, `active_academic_year`.

## 2. Konten pembelajaran

**chapters** (BAB) — `number` (1–6+), `title`, `slug`, `description`, `cover_image`, `setting_location` (mis. "Kota Cilegon"), `kkm` (nullable → pakai default), `order`, `status` (`draft`/`published`), `created_by`.

**zones** — `chapter_id`, `type` (`learning`/`practice`/`exam`), `name` (mis. "Alun-Alun Kota Cilegon"), `description`, `map_key` (peta 3D yang dipakai, mis. `cilegon`; zona berbeda boleh berbagi peta), `area_key` (area dalam peta, mis. `alun_alun`, `kawasan_industri`), `config` (json: spawn point, objek, dekorasi — lihat GAME_DESIGN.md), `is_active`.
Unique (`chapter_id`, `type`).

**materials** — `chapter_id`, `title`, `slug`, `summary`, `content` (longtext, HTML/Markdown aman), `media` (json: gambar/video), `order`, `is_required` (bool), `status`.

**npcs** — `zone_id`, `name`, `role_label` (mis. "HRD PT Baja Nusantara"), `appearance` (json: warna, aksesori, model GLB opsional), `position` (json `{x,y,z}`), `rotation_y`, `greeting`.

**dialogues** — `npc_id`, `key`, `nodes` (json: daftar node dialog `{id, speaker, text, choices:[{label,next}], actions:[{type:"open_material", material_id}|{type:"start_mission", mission_id}|{type:"complete_step", step_id}|{type:"go_to", target}]}`).

**interactables** — `zone_id`, `type` (`book`/`board`/`computer`/`document`/`building`/`tool`/`custom`), `label`, `position` (json), `model_key`, `action` (json, sama format dengan dialog actions), `material_id` (nullable).

**missions** — `chapter_id`, `zone_id`, `title`, `description`, `order`, `is_required`, `reward_xp`.

**mission_steps** — `mission_id`, `order`, `type` (`talk_to_npc`/`read_material`/`interact`/`collect`/`answer_question`/`reach_area`), `target_ref` (json: id NPC/objek/materi/area), `payload` (json, mis. pertanyaan cek pemahaman beserta kunci — **jangan dikirim ke klien**), `description`.

## 3. Bank soal & asesmen

**questions** — `chapter_id`, `material_id` (nullable), `stem` (teks soal, boleh HTML aman), `stimulus` (nullable; teks bacaan), `image` (nullable), `difficulty` (`easy`/`medium`/`hard`), `category` (nullable), `explanation` (pembahasan), `source` (`manual`/`ai`/`import`), `status` (`draft`/`published`/`archived`), `created_by`.

**question_options** — `question_id`, `label` (A–E, label asli), `text`, `is_correct` (bool). Tepat 5 opsi, tepat 1 benar (divalidasi).

**practice_configs** — `chapter_id` (unique), `question_count` (1–10), `category_filter` (json nullable), `difficulty_mix` (json nullable), `shuffle_options` (bool), `is_active`.

**exams** — `chapter_id`, `title`, `question_count`, `selection_mode` (`manual`/`random`), `duration_minutes`, `starts_at`, `ends_at`, `shuffle_questions` (bool, default true), `shuffle_options` (bool), `max_attempts` (default 1), `show_review_after` (`never`/`after_submit`/`after_end`), `is_active`, `created_by`.

**exam_questions** — `exam_id`, `question_id`, `order` (untuk mode manual).

**exam_class** — `exam_id`, `school_class_id` (kelas peserta).

**attempts** — `user_id`, `chapter_id`, `type` (`practice`/`exam`), `exam_id` (nullable), `status` (`in_progress`/`submitted`/`expired`), `started_at`, `expires_at` (nullable), `submitted_at`, `score` (decimal 5,2, nullable), `correct_count`, `total_questions`, `passed` (bool, nullable), `ip_address`, `user_agent`.

**attempt_questions** — `attempt_id`, `question_id`, `order`, `option_map` (json: urutan tampilan → `question_option_id`, mis. `{"A":12,"B":15,...}`), `selected_option_id` (nullable), `answered_at`, `is_correct` (nullable; diisi saat skoring).

**exam_attempt_permissions** — `exam_id`, `user_id`, `extra_attempts`, `granted_by` (untuk remedial).

## 4. Progres & gamifikasi

**chapter_progress** — `user_id`, `chapter_id` (unique pair), `learning_status` (`locked`/`in_progress`/`completed`), `practice_status` (`locked`/`available`/`passed`), `exam_status` (`locked`/`available`/`completed`), `best_practice_score`, `exam_score`, `progress_percent`, `updated_at`.

**material_progress** — `user_id`, `material_id`, `opened_at`, `completed_at`.

**mission_progress** — `user_id`, `mission_id`, `status` (`not_started`/`in_progress`/`completed`), `completed_steps` (json), `completed_at`.

**achievements** — `key` (unique), `name`, `description`, `icon`, `rule` (json, mis. `{"type":"practice_score","min":100}`), `xp`.

**user_achievements** — `user_id`, `achievement_id`, `earned_at`.

**user_stats** — `user_id` (unique), `xp`, `level`, `last_position` (json per zona, opsional).

## 5. AI & log

**ai_generations** — `teacher_id`, `chapter_id`, `material_id`, `requested_count`, `difficulty`, `model`, `status` (`pending`/`done`/`failed`), `error`, `tokens_used` (nullable), `prompt_hash`.

**ai_generation_items** — `ai_generation_id`, `payload` (json soal draf), `status` (`draft`/`approved`/`rejected`), `question_id` (nullable setelah disetujui).

**activity_logs** — `user_id`, `action` (mis. `login`, `material.opened`, `practice.submitted`, `exam.started`), `subject_type`, `subject_id`, `properties` (json), `ip_address`, `created_at`. (Boleh pakai `spatie/laravel-activitylog`.)

**notifications** — tabel bawaan Laravel (`php artisan make:notifications-table`).

## 6. Seeder awal

1. Role & permission; 1 admin, 1 guru, 2 kelas XII, 10 siswa contoh.
2. 6 BAB (BAB 5 berstatus `draft` dengan judul "BAB 5 (belum ditentukan)" — **tanpa materi karangan**).
3. Kerangka materi BAB 1–4 & 6 (judul sesuai PRD, isi ringkas placeholder bertanda "[isi oleh guru]").
4. 3 zona per BAB + zone config dasar dari `resources/js/game/zones/*.json`.
5. Contoh 10–15 soal per BAB 1 (untuk uji alur), ditandai `status=draft` agar guru meninjau.
6. Achievement dasar (lihat GAME_DESIGN.md).

## 7. Indeks penting
- `attempts (user_id, chapter_id, type)`, `attempts (exam_id, status)`
- `attempt_questions (attempt_id, order)`
- `questions (chapter_id, status, difficulty)`
- `activity_logs (user_id, created_at)`
