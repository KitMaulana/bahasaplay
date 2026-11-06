# ROADMAP — BAHASA PLAY

> Strategi: **bangun fondasi LMS dulu, lalu satu BAB lengkap end-to-end (BAB 1) sebagai "vertical slice", baru diperbanyak ke BAB lain.**
> Agen hanya mengerjakan **satu fase aktif**. Fase dianggap selesai bila semua kriteria ✅ terpenuhi dan diuji.
> Tandai `[x]` saat selesai. Fase aktif ditulis di `docs/PROGRESS.md`.

---

## Fase 0 — Setup proyek
- [x] Instal Laravel terbaru di folder `bahasa-play`, koneksi MySQL `bahasa_play` (XAMPP)
- [x] Instal React + Vite + Tailwind di `resources/js`, React Router, Axios, TanStack Query, Zustand
- [x] Sanctum SPA (csrf-cookie + login) berfungsi; `app.blade.php` me-mount SPA; catch-all route web
- [x] Spatie Permission terpasang; Pint, ESLint, Prettier terpasang
- [x] Git init + `.gitignore` benar (`.env` tidak ikut)
- ✅ Kriteria: halaman "Hello BAHASA PLAY" tampil; `php artisan test` & `npm run build` lulus

## Fase 0.5 — (Disarankan) Spike uji performa 3D
- [x] Halaman `/lab` berisi kanvas R3F: lantai, 30 box gedung, 1 karakter kapsul bergerak (keyboard + joystick), kamera ikut
- [x] Uji di ponsel nyata (lewat IP lokal) → catat fps di PROGRESS.md
- ✅ Kriteria: ≥ 30 fps di ponsel menengah; bundel dashboard tidak memuat three.js (cek `npm run build` output)

## Fase 1 — Auth, role, dan kerangka UI
- [x] Migration users (username, avatar_config, is_active), kelas, class_student, class_teacher, settings
- [x] Seeder role + akun contoh (admin, guru, siswa)
- [x] Login/logout/me; redirect per role; route guard frontend
- [x] AppShell responsif: sidebar (desktop) & bottom nav (ponsel), header profil, design tokens Tailwind
- [x] Komponen UI dasar: Button, Card, Modal, Badge, ProgressBar, Table, EmptyState, Toast
- ✅ Kriteria: 3 role login & melihat dashboard kosong masing-masing; siswa tidak bisa membuka rute guru/admin (test)

## Fase 2 — Konten: BAB, zona, materi
- [x] Migration & model: chapters, zones, materials, material_progress
- [x] Seeder 6 BAB + kerangka materi (sesuai PRD; BAB 5 draft tanpa materi karangan) + 3 zona per BAB
- [x] Guru: CRUD BAB (termasuk BAB 5), edit info zona, CRUD materi + urutan + unggah gambar (editor teks kaya sederhana)
- [x] Siswa: daftar BAB, detail BAB, baca materi (versi 2D, sebagai cadangan di luar game)
- ✅ Kriteria: guru bisa mengisi BAB 5 penuh dari UI; siswa melihat BAB published saja

## Fase 3 — Bank soal & Practice Zone (UI 2D)
- [x] Migration: questions, question_options, practice_configs, attempts, attempt_questions
- [x] Guru: CRUD soal (5 opsi, 1 kunci, pembahasan, kesulitan, kategori), filter, import Excel
- [x] Konfigurasi latihan per BAB (≤10 soal, aktif/nonaktif)
- [x] `QuestionPicker`, `AttemptService`, `ScoringService` + UI latihan: mulai → jawab → submit → nilai → pembahasan → ulangi; riwayat
- [x] Gerbang: Practice hanya terbuka jika Learning selesai (sementara: semua materi wajib dibaca)
- ✅ Kriteria: Feature test membuktikan kunci tidak bocor, skor dihitung server, KKM 75 membuka status ujian

## Fase 4 — Examination Zone (UI 2D)
- [x] Migration: exams, exam_questions, exam_class, exam_attempt_permissions
- [x] Guru: buat ujian (manual/acak), durasi, jadwal, kelas peserta, aktif/nonaktif, max attempt, remedial
- [x] Siswa: mode fokus ujian — navigasi nomor soal, indikator terjawab, timer tersinkron server, autosave, auto-submit
- [x] Scheduler `attempts:finalize-expired`
- [x] Guru: lihat hasil & jawaban siswa
- ✅ Kriteria: test untuk jadwal, kedaluwarsa, attempt ganda, manipulasi jawaban setelah waktu habis (harus ditolak)

## Fase 5 — Dashboard siswa & progres
- [x] `ProgressService` + tabel chapter_progress, user_stats, achievements, user_achievements, activity_logs
- [x] Dashboard siswa lengkap (15 poin PRD §8): kartu BAB + status 3 zona, nilai, achievement, riwayat
- [x] Notifikasi dasar (ujian dibuka, lulus latihan)
- ✅ Kriteria: data dashboard sesuai alur nyata latihan/ujian; siswa A tidak bisa melihat data siswa B (test)

## Fase 6 — Mesin game inti + BAB 1 Learning Zone (vertical slice)
- [x] Modul `game/` di-lazy-load; GameRoot + loading screen + tombol keluar ke dashboard
- [x] Player (karakter low-poly/kapsul berwarna sesuai avatar), kontrol keyboard + joystick, kamera ikut, kolisi (rapier)
- [x] `ZoneScene` membaca zone config dari API; komponen preset struktur primitif (building, factory, tree, road, lamp, bench)
- [x] Tabel npcs, dialogues, interactables; NPC + DialogueBox + Panel Materi; objek interaktif
- [x] Peta `cilegon` area `alun_alun` + `kawasan_industri` terisi NPC HRD, pencari kerja, papan lowongan, dokumen CV
- ✅ Kriteria: siswa membuka materi BAB 1 lewat NPC/objek di ponsel & desktop; material_progress tersimpan

## Fase 7 — Misi, portal zona, Practice & Exam di dalam game
- [x] Tabel missions, mission_steps, mission_progress; MissionTracker HUD; verifikasi langkah di server
- [x] Cek pemahaman via NPC (dinilai server); Learning selesai = materi wajib + misi wajib
- [x] Portal/gerbang ke Practice Zone & Exam Zone (terkunci/terbuka sesuai status); NPC pemandu latihan & pengawas ujian membuka UI dari Fase 3–4
- ✅ Kriteria: alur penuh BAB 1: jelajah → misi → latihan ≥75 → ujian → nilai resmi tampil di dashboard

## Fase 8 — Editor konten game untuk guru
- [x] Form kelola NPC (nama, peran, tampilan, posisi), editor dialog berbasis node sederhana, objek interaktif, misi & langkah
- [x] Pilih peta & area untuk tiap zona (penting untuk BAB 5)
- [x] Pratinjau zona dari dashboard guru
- ✅ Kriteria: guru membuat isi BAB 5 lengkap tanpa menyentuh kode, lalu siswa memainkannya

## Fase 9 — AI Question Generator (Gemini)
- [x] `GeminiQuestionService` (HTTP client, JSON terstruktur, validasi skema, retry, timeout), config `services.gemini`
- [x] UI: pilih BAB, materi, jumlah, kesulitan → Generate → tinjau/edit/regenerasi/tolak → setujui ke bank soal
- [x] Rate limit & log penggunaan; test dengan `Http::fake`
- ✅ Kriteria: API key tidak pernah muncul di bundel frontend (cari string di `public/build`); soal AI masuk bank soal hanya setelah disetujui

## Fase 10 — Laporan, import, ekspor
- [x] Import siswa (template CSV/baris), laporan 7 jenis (PRD §9 DG-G), grafik ringkas
- [x] Ekspor Excel (CSV UTF-8 BOM) & PDF (kop resmi SMAN 1 Ciruas)
- ✅ Kriteria: angka laporan cocok dengan data uji (dihitung manual untuk satu kelas)

## Fase 11 — Dashboard administrator
- [x] Manajemen akun/guru/siswa/kelas, role & permission, pengaturan aplikasi (nama sekolah, logo, KKM default, tahun ajaran), monitoring aktivitas, info sistem
- ✅ Kriteria: perubahan KKM default berlaku untuk BAB tanpa KKM khusus

## Fase 12 — Peta BAB 2, 3, 4, 6 (satu BAB per sub-fase)
- [x] 12a BAB 2: `banten_lama` + `royal_baroe` (Kota Serang — Teks Prosedur)
- [x] 12b BAB 3: `gading_serpong` + `alun_tangsel` (Kota Tangerang Selatan — AI & Teks Eksplanasi Kompleks)
- [x] 12c BAB 4: `baduy` + `alun_lebak` (Kabupaten Lebak — Kearifan Lokal, patuh pedoman budaya GAME_DESIGN §7)
- [x] 12d BAB 6: `smancir` (Kabupaten Serang — Kampus SMAN 1 Ciruas — Novel)
- ✅ Kriteria tiap sub-fase: zone config + NPC + misi seeder, uji fps di ponsel, alur 3 zona berjalan

## Fase 13 — PWA, performa, polesan
- [x] Web App Manifest (`public/manifest.webmanifest`), ikon SVG (`192x192`, `512x512`), service worker (`public/sw.js` yang tidak meng-cache endpoint API ujian/latihan), installable di Android/iOS/Desktop
- [x] Arsitektur 3D low-poly stylized (Three.js + React Three Fiber) di-lazy-load penuh (`GameRoot` terpisah dari bundel utama; halaman uji `/lab` dihapus 2026-11-06 atas permintaan pemilik)
- [x] 6 Achievement resmi & XP, animasi/feedback, aksesibilitas dasar (kontras tinggi, ukuran tombol sentuh ≥ 44px)
- ✅ Kriteria: PWA installable; bundel dashboard tetap ringan (~127 KB gzip tanpa Three.js); fps ponsel ≥ 30

## Fase 14 — Uji menyeluruh & deploy
- [x] Seluruh Feature Test otomatis (`HealthCheckTest`, `AuthAndRoleTest`, `LmsAndAssessmentTest` — 12 test, 90 assertion) lulus 100%
- [x] Build produksi (`npm run build`) dan migrasi + seeding database MySQL (`bahasa_play`) tuntas
- [x] Panduan pengoperasian lokal & deploy di `docs/PROGRESS.md` dan `PANDUAN_PENGGUNA.md`
