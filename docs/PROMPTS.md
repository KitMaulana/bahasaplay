# PROMPTS — Salin-tempel ke chat agen

> Gunakan prompt ini di Antigravity (panel Agent) atau Claude Code. Jika workflow/command `/lanjut`, `/fase`, `/cek`, `/simpan` sudah terbaca, cukup ketik perintah itu.

---

## P0. Prompt pembuka proyek (sekali saja, di folder kosong berisi kit ini)
```
Kamu adalah tim senior (Full-Stack Laravel + React, Game Developer Three.js/R3F, Database Engineer, AI Engineer)
untuk proyek BAHASA PLAY. Baca AGENTS.md, lalu docs/PRD.md, docs/ARCHITECTURE.md, dan docs/ROADMAP.md.

Jangan menulis kode dulu. Tugasmu sekarang:
1. Ringkas pemahamanmu tentang proyek dalam 10 poin.
2. Sebutkan hal yang ambigu atau berisiko, dan pertanyaan untuk saya (maksimal 8).
3. Cek lingkungan saya: versi PHP, Composer, Node, npm, MySQL (XAMPP) — beri perintah untuk mengeceknya di Windows.
4. Usulkan rencana detail Fase 0 (dan Fase 0.5 spike 3D). Folder ini sudah berisi file kit
   (AGENTS.md, CLAUDE.md, docs/, .agents/, .claude/) — pasang Laravel TANPA menimpa atau menghapus file-file itu.
Tunggu persetujuan saya sebelum mengeksekusi.
```

## P1. Mulai fase
```
/fase 1
```
atau tanpa workflow:
```
Baca AGENTS.md dan docs/PROGRESS.md. Kita mulai Fase 1 di docs/ROADMAP.md.
Susun rencana implementasi bertahap, tampilkan ke saya, lalu kerjakan setelah saya setujui.
Jangan mengerjakan item di luar Fase 1.
```

## P2. Lanjutkan (sesi baru / pindah alat)
```
/lanjut
```
atau:
```
Baca AGENTS.md dan docs/PROGRESS.md, lalu lanjutkan item berikutnya di fase aktif ROADMAP.md.
Tunjukkan rencana singkat dulu.
```

## P3. Saat ada error
```
Terjadi error berikut saat saya [menjalankan apa / membuka halaman apa]:
<tempel pesan error lengkap + langkah sebelum error>

Analisis penyebab paling mungkin (maksimal 3 hipotesis), cek file yang relevan, lalu perbaiki
penyebab akarnya — bukan sekadar menyembunyikan error. Setelah itu jalankan tes terkait.
```

## P4. Perbaiki tampilan berdasarkan screenshot
```
Ini screenshot halaman [nama halaman] di [ponsel/desktop]. Masalahnya: [jelaskan].
Perbaiki agar sesuai prinsip desain di docs/PRD.md §11 dan tetap mobile-first. Jangan ubah logika backend.
```

## P5. Membangun satu peta zona (Fase 6 & 12)
```
Bangun peta `[map_key]` area `[area_key]` untuk BAB [n] sesuai docs/GAME_DESIGN.md §5–§8.
- Gunakan ZoneScene & komponen preset primitif yang sudah ada; tambah preset baru hanya jika perlu.
- Buat zone config JSON di resources/js/game/zones/[map_key].json + seeder NPC, dialog, objek, misi
  berdasarkan materi BAB [n] di database (bukan karangan baru di luar PRD).
- Target ≤ 80 ribu segitiga, ≥ 30 fps ponsel. Tampilkan sketsa tata letak (denah teks) sebelum membuat kode.
[Untuk BAB 4: patuhi GAME_DESIGN.md §7 pedoman budaya Baduy.]
[Untuk BAB 6: gunakan foto referensi terlampir untuk tata letak gedung SMAN 1 Ciruas.]
```

## P6. Review keamanan ujian
```
/cek
Fokus khusus: alur attempt latihan & ujian. Coba "serang" API seolah-olah kamu siswa yang curang
(mengirim jawaban setelah waktu habis, membuka attempt siswa lain, menebak kunci dari payload,
mengubah skor). Tulis Feature Test untuk tiap skenario dan pastikan semuanya ditolak.
```

## P7. Isi materi dengan bantuan AI (konten, bukan kode)
```
Bantu saya menyusun DRAF isi materi "[judul materi]" BAB [n] untuk kelas XII Kurikulum Merdeka:
penjelasan ringkas, contoh, dan 2 pertanyaan cek pemahaman. Bahasa Indonesia baku, ramah siswa.
Simpan sebagai status draft agar saya tinjau. Jangan ubah materi lain.
```

## P8. Menutup sesi
```
/simpan
```

---

## Tips menulis prompt yang efektif
- **Satu tugas per prompt.** "Buat CRUD bank soal" lebih baik daripada "buat seluruh dashboard guru".
- **Rujuk kode kebutuhan** dari PRD, mis. "kerjakan EX-05 sampai EX-07".
- **Minta rencana dulu** untuk tugas besar; setujui/koreksi baru eksekusi.
- **Beri bukti** saat ada masalah: pesan error lengkap, screenshot, langkah reproduksi.
- **Tolak perubahan yang melebar.** Jika agen mulai mengubah banyak file di luar tugas, hentikan dan minta fokus.
- **Commit setiap fitur berhasil** — memudahkan kembali jika agen merusak sesuatu (`git checkout .`).
