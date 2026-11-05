# ARCHITECTURE — BAHASA PLAY

## 1. Gambaran besar

```
┌──────────────────────────── Browser / PWA ────────────────────────────┐
│ React SPA (Vite)                                                       │
│  ├─ Dashboard Siswa / Guru / Admin  (ringan, Tailwind)                 │
│  └─ Game Module (lazy-loaded)  → React Three Fiber + Rapier            │
│        └─ ZoneScene membaca "zone config" (JSON) dari API              │
└──────────────┬─────────────────────────────────────────────────────────┘
               │ Axios + Sanctum (cookie SPA, CSRF)   /api/v1/*
┌──────────────▼──────────── Laravel ────────────────────────────────────┐
│ Routes → Middleware (auth, role) → Controller (tipis)                  │
│   → FormRequest (validasi) → Service (logika) → Model/Eloquent → MySQL │
│   → API Resource (format respons)                                      │
│ Services penting: AttemptService, ScoringService, ProgressService,     │
│                   GeminiQuestionService, ReportService                 │
│ Storage: public disk (gambar materi, aset 3D unggahan)                 │
└────────────────────────────────────────────────────────────────────────┘
               │ HTTPS (server-side only)
         Google Gemini API
```

## 2. Keputusan arsitektur (ADR singkat)

| # | Keputusan | Alasan |
|---|---|---|
| 1 | **Satu repo**: Laravel + React SPA di `resources/js` | Satu deploy, cocok untuk XAMPP & Hostinger, tetap REST API murni. |
| 2 | **Sanctum SPA (cookie)**, bukan token di localStorage | Lebih aman dari XSS; domain sama. |
| 3 | SPA dengan **React Router**, bukan Inertia | Master prompt meminta REST API + React + Axios; game butuh kontrol penuh klien. |
| 4 | **React Three Fiber + drei + rapier** | Three.js yang deklaratif, ekosistem besar, kolisi/fisika siap pakai. |
| 5 | **Game data-driven** (zone config JSON) | 6 BAB × 3 zona tidak ditulis manual satu-satu; BAB 5 bisa dikonfigurasi guru. |
| 6 | **Zustand** (state lokal) + **TanStack Query** (data server) | Ringan, sederhana, cocok untuk game loop. |
| 7 | **Spatie Laravel Permission** untuk role & permission | Standar de facto, mendukung kebutuhan admin "kelola role & permission". |
| 8 | Ekspor: **maatwebsite/excel** + **barryvdh/laravel-dompdf** | Umum dipakai dan stabil. Import siswa juga pakai maatwebsite/excel. |
| 9 | Gemini via **HTTP client Laravel** (`Http::`) di `GeminiQuestionService` | Tidak bergantung SDK pihak ketiga; mudah ganti model lewat `.env`. |
| 10 | PWA via **vite-plugin-pwa** | Manifest + service worker otomatis dari build Vite. |

> Agen: periksa versi paket terbaru saat instalasi; jangan memaksakan versi lama. Jika suatu paket tidak kompatibel dengan versi Laravel terbaru, laporkan dan usulkan alternatif.

## 3. Struktur folder

```
bahasa-play/
├─ AGENTS.md  CLAUDE.md
├─ docs/                      # dokumen proyek (PRD, ROADMAP, PROGRESS, dst.)
├─ app/
│  ├─ Enums/                  # Role, AttemptStatus, ZoneType, Difficulty, ...
│  ├─ Http/
│  │  ├─ Controllers/Api/V1/{Admin,Teacher,Student,Game}/...
│  │  ├─ Requests/            # FormRequest per aksi
│  │  └─ Resources/           # API Resource
│  ├─ Models/
│  ├─ Policies/
│  └─ Services/
│     ├─ Assessment/{AttemptService,ScoringService,QuestionPicker}.php
│     ├─ Learning/ProgressService.php
│     ├─ AI/GeminiQuestionService.php
│     └─ Report/ReportService.php
├─ database/{migrations,seeders,factories}
├─ routes/{api.php,web.php}   # web.php hanya melayani SPA (catch-all → view app)
├─ resources/
│  ├─ views/app.blade.php     # satu-satunya Blade: mount React
│  └─ js/
│     ├─ main.jsx  router.jsx
│     ├─ lib/{axios.js,queryClient.js,format.js}
│     ├─ stores/{authStore.js,gameStore.js}
│     ├─ components/ui/       # Button, Card, Modal, ProgressBar, Badge, Table, ...
│     ├─ components/layout/   # AppShell, Sidebar, BottomNav, Header
│     ├─ features/
│     │  ├─ auth/  student/  teacher/  admin/
│     │  ├─ practice/         # UI latihan (2D, di atas/di luar kanvas)
│     │  ├─ exam/             # UI ujian (2D, mode fokus)
│     │  └─ ai-generator/
│     ├─ pages/               # halaman per rute
│     └─ game/                # SEMUA kode 3D, di-lazy-load
│        ├─ GameRoot.jsx      # Canvas, Suspense, loading screen
│        ├─ ZoneScene.jsx     # membangun zona dari zone config
│        ├─ player/{Player.jsx,useControls.js,CameraRig.jsx}
│        ├─ npc/{Npc.jsx,DialogueRunner.js}
│        ├─ interactables/{Interactable.jsx}
│        ├─ world/{Ground.jsx,Building.jsx,Prop.jsx,Sky.jsx}  # primitif low-poly
│        ├─ hud/{Joystick.jsx,InteractButton.jsx,MissionTracker.jsx,MaterialPanel.jsx,DialogueBox.jsx}
│        └─ zones/            # zone config bawaan (JSON) untuk seeder
├─ public/
│  ├─ assets/models/{common,bab1,bab2,...}/*.glb
│  └─ icons/                  # ikon PWA
└─ tests/{Feature,Unit}
```

## 4. Alur penting

### 4.1 Gerbang zona (unlock)
```
Learning selesai (semua materi wajib dibuka + misi wajib selesai)
   → Practice terbuka
Practice nilai terbaik ≥ KKM (default 75)
   → Examination terbuka (jika ujian aktif & dalam jadwal)
```
Status dihitung oleh `ProgressService` di server dan disimpan di `chapter_progress`. Frontend hanya menampilkan.

### 4.2 Attempt latihan / ujian (anti-manipulasi)
1. `POST .../attempts` → server memilih soal (`QuestionPicker`), mengacak urutan soal & opsi, menyimpan **snapshot** urutan + pemetaan opsi di `attempt_questions`, set `started_at` & `expires_at` (ujian).
2. Server mengirim soal **tanpa kunci jawaban & tanpa pembahasan**. Opsi dikirim dengan label tampilan A–E hasil acak.
3. `PUT .../attempts/{id}/answers` → autosave per jawaban; ditolak jika `now > expires_at` atau status bukan `in_progress`.
4. `POST .../attempts/{id}/submit` → `ScoringService` menghitung skor = benar/total × 100 (dibulatkan 2 desimal).
5. Attempt ujian yang lewat `expires_at` dan belum submit → di-*finalize* otomatis (saat request berikutnya + scheduler `attempts:finalize-expired` tiap menit).
6. Pembahasan & kunci hanya dikirim setelah status `submitted` (latihan: langsung; ujian: sesuai pengaturan guru).

### 4.3 AI Question Generator
`Teacher UI → POST /api/v1/teacher/ai/questions/generate → GeminiQuestionService`
→ bangun prompt (konteks materi) → panggil Gemini dengan permintaan JSON terstruktur
→ validasi skema (5 opsi, 1 kunci A–E, pembahasan tidak kosong) → simpan sebagai `ai_generation_items` (draf)
→ guru meninjau → `POST .../approve` → menjadi baris `questions` (`source = ai`).

## 5. Lingkungan & deploy

### Lokal (Windows + XAMPP)
- PHP & MySQL dari XAMPP; Composer; Node.js LTS.
- `.env`: `DB_DATABASE=bahasa_play`, `APP_URL=http://127.0.0.1:8000`,
  `SANCTUM_STATEFUL_DOMAINS=127.0.0.1:8000,localhost:8000,localhost:5173`, `SESSION_DOMAIN=` (kosong lokal),
  `GEMINI_API_KEY=...`, `GEMINI_MODEL=...` (isi nama model Gemini yang tersedia di akun).
- Jalankan `php artisan serve` + `npm run dev`.

### Produksi (Hostinger, SSH + git)
- Shared hosting biasanya **tanpa Node** → jalankan `npm run build` di lokal; folder `public/build` ikut di-deploy
  (keluarkan dari `.gitignore` atau unggah terpisah — putuskan saat fase deploy).
- Di server: `git pull origin main && composer install --no-dev --optimize-autoloader && php artisan migrate --force && php artisan optimize`.
- Scheduler: cron `* * * * * php /path/artisan schedule:run` (untuk finalisasi ujian kedaluwarsa).
- Queue: driver `database`; jika worker tidak tersedia, generator AI berjalan sinkron dengan timeout wajar.
- HTTPS wajib (PWA & cookie aman).

## 6. Standar kualitas
- Feature Test untuk: auth & role, policy kepemilikan data, alur attempt (mulai → jawab → submit → skor), gerbang zona, timer ujian kedaluwarsa, validasi output Gemini (pakai `Http::fake`).
- Lint/format: Laravel Pint (PHP), Prettier + ESLint (JS).
