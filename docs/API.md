# API — BAHASA PLAY (REST, prefix `/api/v1`)

Format respons: `{ "data": ..., "meta": {...}?, "message": "..."? }`. Galat validasi: 422 standar Laravel.
Auth: Sanctum SPA → klien memanggil `GET /sanctum/csrf-cookie` lalu `POST /api/v1/auth/login`.
Middleware: `auth:sanctum` + `role:admin|teacher|student`. Kepemilikan data dicek Policy.

## Auth
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/auth/login` | `{username, password}` (rate limited) |
| POST | `/auth/logout` | |
| GET | `/auth/me` | user + roles + kelas |
| PUT | `/auth/password` | ganti password |
| PUT | `/auth/avatar` | simpan `avatar_config` |

## Siswa (`/student`)
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/student/dashboard` | ringkasan: progres total, kartu BAB, nilai, achievement, aktivitas terakhir |
| GET | `/student/chapters` | daftar BAB published + status zona milik siswa |
| GET | `/student/chapters/{chapter}` | detail BAB + status 3 zona |
| GET | `/student/chapters/{chapter}/materials/{material}` | isi materi (tandai `opened`) |
| POST | `/student/materials/{material}/complete` | tandai materi selesai |
| GET | `/student/achievements` | |
| GET | `/student/activities` | riwayat aktivitas sendiri |

## Game (`/game`)
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/game/zones/{zone}` | **zone config** lengkap: peta, NPC, dialog, objek, misi (tanpa kunci jawaban) — 403 jika zona terkunci |
| POST | `/game/missions/{mission}/start` | |
| POST | `/game/missions/{mission}/steps/{step}/complete` | server memverifikasi syarat; untuk `answer_question` kirim `{answer}` dan dinilai server |
| GET | `/game/progress/{chapter}` | status misi & materi |
| PUT | `/game/position` | (opsional) simpan posisi terakhir |

## Latihan (`/student/practice`)
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/student/chapters/{chapter}/practice/attempts` | mulai attempt baru (403 jika Learning belum selesai / latihan nonaktif) |
| GET | `/student/practice/attempts/{attempt}` | soal + opsi teracak, tanpa kunci |
| PUT | `/student/practice/attempts/{attempt}/answers` | `{attempt_question_id, option_label}` |
| POST | `/student/practice/attempts/{attempt}/submit` | → skor, `passed` |
| GET | `/student/practice/attempts/{attempt}/review` | kunci + pembahasan (hanya setelah submit) |
| GET | `/student/chapters/{chapter}/practice/history` | riwayat |

## Ujian (`/student/exams`)
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/student/chapters/{chapter}/exam` | info ujian: jadwal, durasi, status akses, sisa percobaan |
| POST | `/student/exams/{exam}/attempts` | mulai (cek: practice passed, aktif, dalam jadwal, sisa attempt) |
| GET | `/student/exams/attempts/{attempt}` | soal + `server_now` + `expires_at` (timer klien disinkronkan ke server) |
| PUT | `/student/exams/attempts/{attempt}/answers` | autosave; ditolak setelah `expires_at` |
| POST | `/student/exams/attempts/{attempt}/submit` | |
| GET | `/student/exams/attempts/{attempt}/result` | sesuai `show_review_after` |

## Guru (`/teacher`)
| Resource | Endpoint |
|---|---|
| Kelas & siswa | `GET/POST/PUT/DELETE /teacher/classes`, `/teacher/students`, `POST /teacher/students/import` (xlsx/csv), `GET /teacher/students/import-template` |
| BAB | `apiResource /teacher/chapters` |
| Zona | `GET/PUT /teacher/chapters/{chapter}/zones/{type}` (nama, lokasi, map_key, area_key, config) |
| Materi | `apiResource /teacher/chapters/{chapter}/materials`, `PUT /teacher/materials/reorder`, `POST /teacher/uploads` |
| NPC & dialog | `apiResource /teacher/zones/{zone}/npcs`, `PUT /teacher/npcs/{npc}/dialogue` |
| Objek interaktif | `apiResource /teacher/zones/{zone}/interactables` |
| Misi | `apiResource /teacher/chapters/{chapter}/missions` (+ steps nested) |
| Bank soal | `apiResource /teacher/questions` (filter: chapter, material, difficulty, status, source), `POST /teacher/questions/import` |
| Latihan | `GET/PUT /teacher/chapters/{chapter}/practice-config`, `GET /teacher/chapters/{chapter}/practice-results` |
| Ujian | `apiResource /teacher/exams`, `PUT /teacher/exams/{exam}/questions`, `POST /teacher/exams/{exam}/toggle`, `GET /teacher/exams/{exam}/results`, `GET /teacher/exam-attempts/{attempt}` (jawaban siswa), `POST /teacher/exams/{exam}/remedial` |
| Laporan | `GET /teacher/reports/{type}?class_id=&chapter_id=` (`practice-scores`, `exam-scores`, `class-average`, `mastery`, `below-kkm`, `chapter-progress`, `activities`), `GET .../export?format=xlsx|pdf` |
| AI | `POST /teacher/ai/questions/generate`, `GET /teacher/ai/generations/{id}`, `PUT /teacher/ai/items/{item}`, `POST /teacher/ai/items/approve` (`{item_ids:[]}`), `POST /teacher/ai/items/{item}/regenerate` |

## Admin (`/admin`)
`apiResource /admin/users` (filter role), `/admin/teachers`, `/admin/students`, `/admin/classes`,
`GET/PUT /admin/roles`, `GET /admin/permissions`, `GET/PUT /admin/settings`, `GET /admin/activities`, `GET /admin/system` (versi, status queue/scheduler, storage).

## Contoh payload

**Soal saat attempt berjalan (tanpa kunci):**
```json
{ "data": { "id": 991, "status": "in_progress", "expires_at": "2026-11-20T03:30:00Z", "server_now": "2026-11-20T03:05:12Z",
  "questions": [ { "attempt_question_id": 5001, "number": 1, "stem": "Bagian CV yang memuat ...", 
    "options": [ {"label":"A","text":"..."}, {"label":"B","text":"..."}, {"label":"C","text":"..."}, {"label":"D","text":"..."}, {"label":"E","text":"..."} ],
    "selected": null } ] } }
```

**Skema output Gemini yang diminta (divalidasi server):**
```json
{ "questions": [ { "stem": "string", "options": { "A": "string", "B": "string", "C": "string", "D": "string", "E": "string" },
  "answer": "A|B|C|D|E", "explanation": "string", "difficulty": "easy|medium|hard", "material_focus": "string" } ] }
```
