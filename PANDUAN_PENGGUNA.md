# PANDUAN — Membangun BAHASA PLAY dengan Agentic AI
*Untuk: Bangkit Candra Maulana · Alat: Google Antigravity (utama) & Claude Code di VS Code (cadangan)*

---

## 1. Mengapa tidak menempel master prompt sekaligus?

Master prompt Anda sangat bagus sebagai **visi**, tetapi jika ditempel utuh dalam satu permintaan, agen AI cenderung:
- membuat kerangka "setengah jadi" di banyak bagian sekaligus (terlihat lengkap, tapi banyak yang tidak berfungsi),
- kehabisan konteks/token di tengah jalan dan **lupa** keputusan sebelumnya,
- mengarang hal yang belum ditentukan (misalnya BAB 5).

Solusinya adalah **context engineering**: memecah master prompt menjadi dokumen proyek yang selalu dibaca agen, plus peta jalan bertahap. Itulah isi kit ini.

## 2. Isi kit

| File | Fungsi | Dibaca oleh |
|---|---|---|
| `AGENTS.md` | Aturan kerja utama (stack, aturan emas, protokol, konvensi) | Antigravity & Claude Code **otomatis** |
| `CLAUDE.md` | Mengimpor AGENTS.md + catatan khusus Claude Code | Claude Code otomatis |
| `docs/PRD.md` | Master prompt Anda yang dirapikan + kode kebutuhan (EX-05, PZ-03, dst.) | Agen saat perlu |
| `docs/ARCHITECTURE.md` | Keputusan teknis, struktur folder, alur anti-curang, deploy | Agen saat perlu |
| `docs/DATABASE.md` | Rancangan tabel MySQL | Agen saat perlu |
| `docs/API.md` | Daftar endpoint REST + contoh payload | Agen saat perlu |
| `docs/GAME_DESIGN.md` | Desain game 3D, peta per BAB, pedoman budaya Baduy, aset | Agen saat perlu |
| `docs/ROADMAP.md` | Fase 0–14 berurutan dengan kriteria selesai | Agen + Anda |
| `docs/PROGRESS.md` | **Catatan serah-terima** — kunci agar bisa pindah Antigravity ↔ Claude Code | Agen setiap mulai sesi |
| `docs/PROMPTS.md` | Prompt siap salin-tempel | Anda |
| `.agents/workflows/*.md` | Perintah `/lanjut` `/fase` `/cek` `/simpan` di Antigravity | Antigravity |
| `.claude/commands/*.md` | Perintah yang sama di Claude Code | Claude Code |

## 3. Persiapan (sekali saja)

1. **Pasang/cek:** XAMPP (PHP 8.3+ & MySQL), Composer, Node.js LTS, Git. Di terminal:
   `php -v` · `composer -V` · `node -v` · `npm -v` · `git --version`
2. **Buat database** `bahasa_play` di phpMyAdmin.
3. **Buat folder proyek** `C:\xampp\htdocs\bahasa-play` lalu **ekstrak isi kit ini ke dalamnya** (termasuk folder tersembunyi `.agents` dan `.claude`).
   > Laravel biasanya dipasang di folder kosong. Dalam prompt P0, agen akan diminta memasang Laravel tanpa menimpa file kit (misalnya pasang di folder sementara lalu dipindahkan). Pastikan agen melakukannya dengan aman.
4. **API key Gemini:** buat di Google AI Studio, simpan nanti di `.env` sebagai `GEMINI_API_KEY`. **Jangan pernah** menempelkan key di chat agen atau di kode.
5. Buka folder di **Antigravity** (File → Open Folder). Cek di pengaturan/panel *Customizations* bahwa rules (AGENTS.md) dan workflows terbaca.
   - Jika perintah `/lanjut` dkk. tidak muncul, ganti nama folder `.agents` menjadi `.agent` (versi Antigravity berbeda memakai nama berbeda).
   - Jika versi Antigravity Anda belum membaca AGENTS.md, salin isinya ke file `GEMINI.md` di root.

## 4. Ritme kerja harian

```
Buka proyek → /lanjut (atau /fase N)
   → agen menampilkan RENCANA → Anda setujui / koreksi
   → agen mengerjakan sedikit demi sedikit
   → Anda uji di browser (desktop + HP)
   → /cek → perbaiki temuan
   → /simpan → git commit
```

**Aturan praktis:**
- Satu sesi = satu atau beberapa item dari **satu fase**. Jangan lompat fase.
- **Commit setelah tiap fitur berhasil.** Jika agen merusak sesuatu, Anda bisa kembali.
- Gunakan **Planning mode** di Antigravity (atau *plan mode* di Claude Code) untuk tugas besar; *Fast mode* untuk perbaikan kecil.
- Uji di HP: jalankan `php artisan serve --host=0.0.0.0` dan `npm run dev -- --host`, lalu buka IP laptop dari HP di Wi-Fi yang sama.

## 5. Pindah ke Claude Code saat kuota Antigravity habis

1. Pastikan sesi terakhir sudah `/simpan` (PROGRESS.md terbarui) dan sudah commit.
2. Buka folder yang sama di VS Code → buka Claude Code.
3. Ketik `/lanjut`. Claude Code membaca CLAUDE.md → AGENTS.md → PROGRESS.md dan melanjutkan dari titik yang sama.
4. Sebelum kembali ke Antigravity, jalankan `/simpan` lagi.

> Kuncinya: **ingatan proyek tinggal di file, bukan di chat.** Agen mana pun bisa melanjutkan.

## 6. Hemat token
- Mulai **sesi/percakapan baru** untuk setiap fase atau setiap fitur besar; jangan satu chat panjang berhari-hari.
- Jangan minta agen "baca semua file". AGENTS.md sudah mengatur urutan baca seperlunya.
- Tempel hanya bagian error yang relevan (stack trace lengkap boleh, log 2.000 baris jangan).
- Di Claude Code, gunakan `/compact` saat percakapan mulai panjang (setelah `/simpan`).

## 7. Saran & improvisasi dari saya

1. **Bangun "vertical slice" BAB 1 dulu.** Satu BAB yang lengkap (jelajah → misi → latihan → ujian → nilai) jauh lebih berharga daripada enam BAB setengah jadi. Setelah BAB 1 jalan, BAB lain tinggal "mengisi data" karena mesin gamenya data-driven.
2. **LMS dulu, game kemudian (Fase 1–5 sebelum Fase 6).** Latihan & ujian dibuat sebagai UI 2D lebih dulu; game nanti hanya "membungkus" alur yang sudah teruji. Ini juga menjadi **cadangan**: jika HP siswa terlalu lemah untuk 3D, pembelajaran tetap bisa jalan.
3. **Lakukan Fase 0.5 (spike 3D) di awal.** Uji kanvas 3D sederhana di HP siswa yang paling umum di sekolah. Jika fps rendah, desain grafis disesuaikan sejak awal — bukan setelah semuanya dibangun.
4. **Mulai dari bangunan primitif (kotak & silinder berwarna).** Gaya Roblox justru cocok dengan bentuk sederhana. Aset 3D yang lebih cantik (Kenney, Quaternius — gratis CC0; atau Blender untuk masjid & sekolah) menyusul di Fase 13. Latar belakang multimedia Anda sangat membantu di tahap ini.
5. **Landmark "terinspirasi", bukan replika**, dan tanpa logo perusahaan (Krakatau Steel/Posco) — lebih aman secara hak cipta/merek dan lebih ringan.
6. **Siapkan bahan konten sejak sekarang:** foto SMAN 1 Ciruas (dari depan, samping, atas/drone bila ada, denah), ringkasan materi tiap BAB, dan contoh soal. Agen hebat soal kode, tetapi **kualitas materi tetap di tangan Anda sebagai guru.**
7. **Soal dari AI selalu masuk sebagai draf** dan baru dipakai setelah Anda setujui — sudah saya tetapkan di PRD.
8. **Lengkapi master prompt yang terpotong.** File TXT Anda berhenti di Bagian 12 langkah 9 ("Hasil dit..."). Saya mengisi sisanya sebagai **[ASUMSI]** di `docs/PRD.md` (draf → tinjau → setujui; PWA; keamanan). Periksa dan sesuaikan bagian bertanda [ASUMSI], serta jawab "Pertanyaan terbuka" di PRD §16 sebelum Fase 1.
9. **Potensi lomba/karya inovasi:** proyek ini sangat cocok didokumentasikan sejak awal (screenshot tiap fase di PROGRESS.md) untuk bahan laporan/presentasi inovasi pembelajaran.

## 8. Tanda agen mulai "melenceng" (dan cara menanganinya)
| Gejala | Tindakan |
|---|---|
| Mengubah banyak file yang tidak diminta | "Stop. Kembalikan perubahan di luar tugas. Fokus hanya pada item X." |
| Mengarang isi BAB 5 atau materi | "Hapus. BAB 5 hanya diisi guru (AGENTS.md aturan 5)." |
| Mengirim kunci jawaban ke frontend | Jalankan prompt P6 (`/cek` keamanan ujian). |
| Error berulang 3× dengan perbaikan yang sama | Mulai sesi baru, tempel error + minta 3 hipotesis penyebab (prompt P3). |
| Mengganti stack (mis. ke Next.js/Inertia) | "Stack sudah diputuskan di ARCHITECTURE.md, jangan diganti." |
