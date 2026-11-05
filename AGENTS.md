# AGENTS.md — BAHASA PLAY

> File aturan utama untuk SEMUA agen AI (Google Antigravity, Claude Code, Cursor, dll).
> Baca file ini PERTAMA sebelum mengerjakan apa pun. Bahasa komunikasi: **Bahasa Indonesia**.

## 1. Proyek singkat

**BAHASA PLAY** — *Game-Based Learning Management System* untuk Bahasa Indonesia SMA Kelas XII.
Tagline: "Mainkan gamenya, pelajari bahasanya."
LMS lengkap (akun, dashboard 3 role, materi, bank soal, latihan, ujian, laporan) + dunia game 3D
bergaya stylized/low-poly (mirip Roblox) tempat siswa belajar lewat NPC, misi, dan objek interaktif.
Pemilik proyek: Bangkit Candra Maulana (guru Bahasa Indonesia, SMAN 1 Ciruas).

## 2. Urutan baca dokumen (WAJIB)

1. `AGENTS.md` (file ini) — aturan kerja.
2. `docs/PROGRESS.md` — posisi terakhir pekerjaan. **Selalu baca ini sebelum mulai.**
3. `docs/ROADMAP.md` — fase & kriteria selesai. Kerjakan HANYA fase yang aktif.
4. Dokumen rujukan sesuai tugas:
   - `docs/PRD.md` — kebutuhan produk lengkap (sumber kebenaran fitur).
   - `docs/ARCHITECTURE.md` — stack, struktur folder, pola kode.
   - `docs/DATABASE.md` — skema tabel.
   - `docs/API.md` — kontrak endpoint REST.
   - `docs/GAME_DESIGN.md` — sistem 3D, peta, NPC, misi, aset.

Jangan membaca ulang semua dokumen jika tidak perlu — hemat konteks/token.

## 3. Stack (sudah diputuskan, jangan diganti tanpa izin)

- Backend: **Laravel** (versi stabil terbaru) + PHP 8.2+ (XAMPP PHP 8.2.12), REST API di `routes/api.php`, autentikasi **Laravel Sanctum (SPA cookie)**.
- Frontend: **React + Vite + Tailwind CSS** di `resources/js` (SPA, satu repo dengan Laravel). HTTP client: Axios.
- Game: **Three.js via React Three Fiber** + `@react-three/drei` + `@react-three/rapier` (fisika/kolisi).
- State: Zustand (state game & UI), TanStack Query (data server).
- DB: **MySQL** (lokal: XAMPP). AI: **Google Gemini API** lewat backend Laravel saja.
- PWA: `vite-plugin-pwa` (manifest + service worker).
- Lingkungan lokal pemilik: Windows + XAMPP (`C:\xampp\htdocs`). Hosting: Hostinger (SSH + git pull).

## 4. Aturan emas (non-negotiable)

1. **Backend adalah sumber kebenaran nilai.** Kunci jawaban TIDAK PERNAH dikirim ke frontend sebelum
   attempt selesai. Skor dihitung di server. Waktu ujian dihitung dari `started_at`/`expires_at` server.
2. **API key Gemini hanya di `.env`** (`GEMINI_API_KEY`). Tidak boleh muncul di kode frontend, log, atau commit.
3. **Otorisasi berlapis:** middleware role + Laravel Policy. Siswa hanya bisa melihat datanya sendiri.
4. **Validasi via Form Request**, respons via **API Resource**, logika bisnis di **Service class**
   (`app/Services`), controller tipis.
5. **BAB tidak di-hardcode.** Semua BAB (termasuk BAB 5 yang belum ditentukan) berasal dari database
   dan dapat dikelola guru. Jangan mengarang judul/materi BAB 5.
6. **Game data-driven.** Posisi NPC, objek interaktif, dialog, dan misi dibaca dari database/JSON
   konfigurasi zona — bukan ditulis langsung di komponen. Satu komponen `ZoneScene` dipakai untuk semua zona.
7. **Dashboard tidak memuat Three.js.** Semua modul 3D di-*lazy load* (`React.lazy` + dynamic import)
   hanya saat masuk zona game.
8. **Mobile-first**: uji pada lebar 360px. Kontrol sentuh (joystick virtual + tombol interaksi) wajib ada.
9. **Budaya dihormati**: penggambaran kawasan Baduy harus santun dan tidak stereotip (lihat GAME_DESIGN.md).
10. Jangan menghapus/menimpa file di luar cakupan tugas. Jangan menjalankan `migrate:fresh` pada database
    yang berisi data nyata tanpa izin eksplisit.

## 5. Cara kerja agen (protokol)

**Sebelum menulis kode:**
- Baca `docs/PROGRESS.md` dan fase aktif di `docs/ROADMAP.md`.
- Buat rencana singkat (daftar file yang akan dibuat/diubah) dan tunjukkan ke pemilik untuk tugas besar.
- Jika ada kebutuhan yang ambigu atau bertentangan dengan PRD → **tanya**, jangan menebak.

**Saat menulis kode:**
- Kerjakan dalam potongan kecil yang bisa diuji (satu fitur/endpoint/komponen per langkah).
- Ikuti pola yang sudah ada di repo. Cek file serupa sebelum membuat pola baru.
- Setiap migration punya `down()` yang benar. Setiap fitur backend punya minimal satu Feature Test.

**Setelah menulis kode (Definition of Done):**
- `php artisan test` lulus. `npm run build` sukses tanpa error. Tidak ada error di console browser.
- Uji manual alur utama di browser (desktop + tampilan mobile).
- Perbarui `docs/PROGRESS.md`: apa yang selesai, file penting yang diubah, masalah yang tersisa, langkah berikutnya.
- Centang item di `docs/ROADMAP.md`.
- Usulkan pesan commit (format: `feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`).

## 6. Konvensi kode

- Bahasa kode (nama class, variabel, kolom DB): **Inggris**. Teks UI & konten: **Bahasa Indonesia** baku.
- Tabel & kolom: `snake_case`, jamak untuk tabel (`chapters`, `questions`). Model: `PascalCase` tunggal.
- Endpoint: `/api/v1/...`, kebab-case, RESTful. Respons JSON konsisten `{ data, meta?, message? }`.
- React: komponen fungsi + hooks, file `PascalCase.jsx`, satu komponen utama per file.
- Folder frontend: `resources/js/{app,pages,components,features,game,lib,stores}` (detail di ARCHITECTURE.md).
- Tailwind: gunakan token warna dari `tailwind` theme proyek, bukan warna acak per komponen.
- Enum status disimpan sebagai string (`draft`, `published`, `in_progress`, `submitted`, dst).
- Waktu disimpan UTC; ditampilkan dalam zona `Asia/Jakarta`.

## 7. Perintah yang sering dipakai

```bash
composer install && npm install
php artisan migrate --seed
php artisan serve           # backend http://127.0.0.1:8000
npm run dev                 # Vite
php artisan test
npm run build
```

## 8. Batasan tugas

- Jangan menambah dependensi besar baru (engine game lain, UI kit berat, Redux, dsb.) tanpa izin.
- Jangan membuat aset 3D realistis berat. Gunakan bentuk primitif/low-poly dulu (placeholder),
  aset GLB terkompresi menyusul.
- Jika token/konteks hampir habis: hentikan pekerjaan di titik aman, perbarui `docs/PROGRESS.md`,
  sehingga agen lain (Antigravity ↔ Claude Code) bisa melanjutkan.
