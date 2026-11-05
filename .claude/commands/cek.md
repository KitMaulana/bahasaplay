---
description: Review dan uji hasil kerja sebelum commit
---

Lakukan review dan pengujian atas pekerjaan terakhir sebelum commit.

1. Jalankan `php artisan test` dan `npm run build`; laporkan hasilnya.
2. Periksa terhadap aturan emas di `AGENTS.md` §4, khususnya:
   - kunci jawaban/pembahasan tidak bocor ke respons sebelum submit,
   - skor & waktu ujian dihitung server,
   - Policy kepemilikan data siswa,
   - tidak ada API key/rahasia di kode frontend atau file yang di-commit,
   - three.js tidak ikut ke bundel dashboard.
3. Cek tampilan mobile (lebar 360px) untuk halaman yang diubah; cek console browser bebas error.
4. Cocokkan dengan kriteria ✅ fase aktif di ROADMAP.md.
5. Buat daftar temuan (Kritis / Sebaiknya / Kosmetik) dan perbaiki yang Kritis setelah saya setujui.

