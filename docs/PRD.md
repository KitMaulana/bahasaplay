# PRD — BAHASA PLAY
*Product Requirements Document. Sumber: "Master Prompt Google Antigravity" milik pemilik proyek, disusun ulang agar mudah dirujuk agen AI. Setiap kebutuhan punya kode (mis. `EX-05`) supaya bisa dirujuk di prompt, commit, dan PROGRESS.md.*

> ✅ **Catatan:** File `# MASTER PROMPT GOOGLE ANTIGRAVITY.txt` utuh (Bagian 1–21, 1.447 baris) telah dianalisis dan disinkronkan bersama keputusan pemilik proyek per 2026-11-05.

---

## 1. Identitas

- **Nama:** BAHASA PLAY: Game-Based Learning Management System untuk Pembelajaran Bahasa Indonesia SMA Kelas XII
- **Tagline:** "Mainkan gamenya, pelajari bahasanya."
- **Pengguna:** Administrator, Guru, Siswa kelas XII.
- **Prinsip:** Aplikasi yang benar-benar berfungsi (bukan prototipe statis). LMS lengkap + dunia game 3D.

## 2. Role & hak akses (RBAC)

| Role | Ringkasan akses |
|---|---|
| Administrator | Akses penuh: akun, guru, siswa, kelas, role/permission, pengaturan aplikasi & sistem, monitoring aktivitas, konfigurasi global. |
| Guru | Kelola siswa & kelas yang diampu, BAB, materi, NPC, misi, bank soal, konfigurasi latihan/ujian, laporan, AI Question Generator. |
| Siswa | Bermain & belajar, latihan, ujian, melihat progres/nilai/achievement **miliknya sendiri saja**. |

## 3. Struktur pembelajaran

Setiap BAB punya 3 zona berurutan: **Learning Zone → Practice Zone → Examination Zone**.
Judul BAB = judul materi. Kota/kabupaten hanya **latar** lingkungan game.

| BAB | Judul | Latar game | Learning Zone | Practice Zone | Examination Zone |
|---|---|---|---|---|---|
| 1 | Curriculum Vitae (CV) dan Surat Lamaran Pekerjaan | Kota Cilegon | Alun-Alun Cilegon + kawasan industri (terinspirasi Krakatau Steel/Krakatau Posco). NPC: pencari kerja, HRD, tokoh pendukung | Area lain di Cilegon, NPC pemandu latihan | Area lain di Cilegon, nuansa formal & tenang, NPC pengawas |
| 2 | Teks Prosedur Sederhana dan Teks Prosedur Kompleks | Kota Serang | Masjid Agung Banten Lama, suasana bersejarah khas Banten | Royal Baroe (pertokoan & area publik) | Peta Royal Baroe yang sama, area berbeda, formal |
| 3 | Artificial Intelligence dan Teks Eksplanasi Kompleks | Kota Tangerang Selatan | Gading Serpong: perkantoran modern, kawasan bisnis, gedung tinggi. NPC: pengembang teknologi, peneliti, pengguna AI | Alun-Alun Kota Tangerang Selatan | Peta yang sama, area berbeda, formal |
| 4 | Kearifan Lokal | Kabupaten Lebak | Kawasan Baduy: rumah adat, jalan setapak, alam, permukiman tradisional. NPC: tokoh masyarakat, pemandu budaya. **Wajib santun & menghormati budaya** | Alun-Alun Kabupaten Lebak | Peta yang sama, area berbeda, formal |
| 5 | **Belum ditentukan — diisi guru lewat dashboard** | Diatur guru | Diatur guru | Diatur guru | Diatur guru |
| 6 | Novel | SMAN 1 Ciruas, Kab. Serang | Miniatur 3D sekolah (dari foto referensi): gedung, kelas, lapangan, taman, koridor, perpustakaan. NPC: guru, siswa, pustakawan, warga sekolah | Area sekolah lain | Area sekolah lain, formal |

### Cakupan materi per BAB

**BAB 1 — CV & Surat Lamaran:** pengertian & fungsi CV; struktur CV; unsur informasi CV; bahasa dalam CV; pengertian surat lamaran; struktur surat lamaran; kaidah kebahasaan surat lamaran; tujuan & karakteristik surat lamaran; menyusun CV & surat lamaran yang baik.

**BAB 2 — Teks Prosedur:** pengertian; tujuan; ciri-ciri; teks prosedur sederhana; teks prosedur kompleks; struktur; kaidah kebahasaan; kalimat imperatif; konjungsi temporal; kata kerja material; menyusun teks prosedur; menganalisis ketepatan urutan langkah.

**BAB 3 — AI & Teks Eksplanasi Kompleks:** pengertian AI; sejarah & perkembangan AI; penerapan AI; manfaat & risiko; etika penggunaan AI; teknik prompting; membuat prompt efektif; pengertian teks eksplanasi kompleks; struktur; kaidah kebahasaan; hubungan sebab-akibat; menulis teks eksplanasi tentang perkembangan AI.

**BAB 4 — Kearifan Lokal:** pengertian; bentuk kearifan lokal; nilai budaya & tradisi; kearifan lokal masyarakat Banten; fakta dan opini; mengidentifikasi fakta & opini; pelestarian budaya lokal; menulis teks tentang kearifan lokal.

**BAB 5:** JANGAN dikarang. Semua isi (judul, deskripsi, materi, lokasi 3 zona, NPC, misi, bank soal, konfigurasi latihan & ujian) diisi guru.

**BAB 6 — Novel:** pengertian novel; unsur intrinsik; unsur ekstrinsik; tokoh & penokohan; alur; latar; sudut pandang; tema & amanat; analisis isi; menafsirkan pesan; nilai-nilai kehidupan; mengaitkan nilai dengan kehidupan sehari-hari; lingkungan sekolah aman, nyaman, bebas kekerasan sebagai konteks.

> Seeder awal berisi kerangka judul materi di atas. **Isi materi lengkap** diisi/diedit guru (atau dibantu AI lalu ditinjau guru).

## 4. Sistem game 3D

- **GM-01** Avatar siswa; gerak maju/mundur/kiri/kanan; kamera mengikuti (third-person).
- **GM-02** Kontrol keyboard (WASD/panah + E untuk interaksi) di desktop; joystick virtual + tombol interaksi di ponsel.
- **GM-03** NPC: bisa ditemui, menampilkan dialog, menjelaskan materi, memberi misi & instruksi, mengarahkan ke aktivitas berikutnya.
- **GM-04** Objek interaktif: buku, papan informasi, komputer, bangunan, dokumen, peralatan, objek terkait materi.
- **GM-05** Misi per BAB (temukan NPC, kumpulkan informasi, baca dokumen, selesaikan tantangan, jawab pertanyaan). Status misi tersimpan di database.
- **GM-06** Loading screen saat masuk zona; aset dimuat bertahap per BAB & zona.
- **GM-07** Performa layak di ponsel kelas menengah; mendukung portrait & landscape.

## 5. Learning Zone (LZ)

- **LZ-01** Masuk lingkungan 3D, eksplorasi, bertemu & berinteraksi dengan NPC.
- **LZ-02** Materi disajikan bertahap lewat dialog NPC dan **panel materi** yang terbuka saat berinteraksi dengan NPC/objek.
- **LZ-03** Objek interaktif & misi pembelajaran; indikator progres.
- **LZ-04** Status materi yang sudah dipelajari tersimpan.
- **LZ-05** Siswa benar-benar belajar, bukan sekadar jalan-jalan: [ASUMSI] Learning Zone dinyatakan selesai jika semua materi wajib sudah dibuka **dan** misi wajib selesai (termasuk pertanyaan cek pemahaman singkat dari NPC).
- **LZ-06** [ASUMSI] Practice Zone baru terbuka setelah Learning Zone selesai.

## 6. Practice Zone (PZ)

- **PZ-01** Maksimal 10 soal pilihan ganda, opsi A–E, diambil dari bank soal.
- **PZ-02** Urutan soal diacak; urutan opsi dapat diacak.
- **PZ-03** Hasil tersimpan; siswa melihat nilai, kunci jawaban, dan pembahasan **setelah submit**.
- **PZ-04** Bisa diulang; ada riwayat latihan.
- **PZ-05** KKM 75: nilai ≥ 75 → Examination Zone terbuka; < 75 → tetap terkunci (harus mengulang/belajar lagi).
- **PZ-06** Status kelulusan latihan tersimpan. Nilai latihan **bukan** nilai resmi.

## 7. Examination Zone (EX)

- **EX-01** Pilihan ganda A–E; jumlah soal ditentukan guru; soal dipilih dari bank soal.
- **EX-02** Urutan soal diacak per siswa; opsi dapat diacak.
- **EX-03** Timer; durasi ditentukan guru; jadwal (waktu mulai & berakhir) ditentukan guru.
- **EX-04** Guru dapat mengaktifkan/menonaktifkan ujian.
- **EX-05** Navigasi antarsoal; indikator soal sudah/belum dijawab.
- **EX-06** Jawaban tersimpan otomatis & aman (autosave per jawaban).
- **EX-07** Otomatis dikumpulkan saat waktu habis (ditegakkan oleh server, bukan hanya timer browser).
- **EX-08** Nilai dihitung backend; hasil tersimpan. Siswa tidak bisa memanipulasi nilai dari frontend.
- **EX-09** Nilai ujian = nilai resmi; dilihat guru dan siswa sesuai hak akses.
- **EX-10** [ASUMSI] Jumlah percobaan ujian default 1 kali; guru dapat memberi izin ujian ulang (remedial) per siswa.

## 8. Dashboard Siswa (DS)

Login; profil (nama, kelas); 6 kartu BAB; progres per BAB; status Learning/Practice Zone; nilai & status kelulusan latihan; status akses ujian; nilai & riwayat ujian; achievement; total progres; riwayat aktivitas. Hanya data milik sendiri.

## 9. Dashboard Guru (DG)

- **DG-A Siswa:** tambah/edit/hapus, import (Excel/CSV), kelola kelas, lihat progres & nilai.
- **DG-B BAB:** tambah/edit/hapus; judul, deskripsi, lokasi game, zona, NPC, misi. BAB 5 diisi di sini.
- **DG-C Materi:** CRUD, urutan, unggah gambar/media, per BAB.
- **DG-D Bank soal:** CRUD; opsi A–E; kunci; pembahasan; tingkat kesulitan; kelompok per BAB & materi.
- **DG-E Practice:** jumlah soal (≤10), kategori soal, aktif/nonaktif, lihat hasil.
- **DG-F Ujian:** jumlah soal, pilih soal, durasi, jadwal mulai–berakhir, aktif/nonaktif, lihat hasil & jawaban siswa.
- **DG-G Laporan:** nilai latihan, nilai ujian, rata-rata kelas, persentase ketuntasan, siswa < 75, progres per BAB, riwayat aktivitas. **Ekspor Excel & PDF.**

## 10. Dashboard Administrator (DA)

Manajemen akun, guru, siswa, kelas, role & permission, pengaturan aplikasi, pengaturan sistem, monitoring aktivitas, konfigurasi global (mis. KKM default, nama sekolah, tahun ajaran, logo).

## 11. Desain & UX

- Modern, futuristik, menyenangkan, profesional; warna cerah tapi nyaman.
- Mobile-first; responsif ponsel/tablet/desktop; portrait & landscape.
- Navigasi sederhana untuk siswa SMA; loading cepat.
- Dashboard: navigasi adaptif (sidebar desktop, bottom nav ponsel), header profil, kartu progres, kartu BAB, statistik nilai, achievement, progress bar, notifikasi, riwayat aktivitas.
- **Dashboard tidak boleh berat karena game 3D** (3D di-lazy-load).

## 12. AI Question Generator (AI)

Alur dari master prompt:
1. Guru membuka menu AI Question Generator.
2. Memilih BAB. 3. Memilih materi. 4. Menentukan jumlah soal. 5. Menentukan tingkat kesulitan.
6. Menekan **Generate**. 7. Backend Laravel mengirim permintaan ke Gemini API. 8. Gemini menghasilkan soal.
9. **[ASUMSI — teks asli terpotong]** Hasil ditampilkan sebagai **draf** untuk ditinjau guru:
10. [ASUMSI] Guru dapat mengedit, menghapus, atau membuat ulang tiap soal.
11. [ASUMSI] Guru memilih soal yang disetujui → disimpan ke bank soal (status `published`, sumber `ai`).
12. [ASUMSI] Soal AI **tidak pernah** masuk ujian tanpa disetujui guru.

Ketentuan teknis:
- **AI-01** Panggilan Gemini hanya dari backend; key di `.env`; model diatur via `GEMINI_MODEL`.
- **AI-02** Output diminta dalam **JSON terstruktur** (soal, opsi A–E, kunci, pembahasan, tingkat kesulitan) lalu divalidasi server; jika format salah → coba ulang/beri pesan galat yang jelas.
- **AI-03** Prompt ke Gemini menyertakan konteks materi (judul + ringkasan isi materi dari DB), jenjang kelas XII, Kurikulum Merdeka, bahasa Indonesia baku.
- **AI-04** Batasi jumlah per permintaan (mis. ≤ 20 soal) & rate limit per guru; catat log penggunaan (tanpa menyimpan API key).
- **AI-05** [ASUMSI, opsional] AI membantu menyusun draf isi materi atau dialog NPC — selalu sebagai draf yang ditinjau guru.

## 13. PWA [ASUMSI pelengkap]

- Manifest (nama, ikon, warna tema, `display: standalone`); service worker via `vite-plugin-pwa`.
- Installable di Android, desktop, iOS yang mendukung.
- Cache: shell aplikasi & aset statis (termasuk aset 3D zona yang pernah dibuka).
- **Ujian tidak bisa dikerjakan offline**; jika koneksi putus, jawaban yang belum terkirim diantrekan dan dikirim ulang saat online, namun batas waktu tetap mengikuti server.

## 14. Keamanan & integritas [ASUMSI pelengkap]

- Sanctum SPA (cookie, CSRF); password hash; rate limit login.
- Policy untuk setiap resource; siswa tidak bisa mengakses ID milik siswa lain (uji dengan Feature Test).
- Kunci jawaban tidak pernah ada di payload soal selama attempt berjalan.
- Log aktivitas (login, mulai/selesai latihan/ujian, perubahan nilai/konfigurasi).
- Validasi upload (tipe & ukuran file).

## 15. Kebutuhan non-fungsional

- Dashboard: First load ringan (target bundle awal < ~300 KB gzip tanpa 3D).
- Game: target ≥ 30 fps di ponsel kelas menengah; aset per zona idealnya < 5–10 MB (GLB terkompresi).
- Bisa berjalan di XAMPP lokal dan di hosting Hostinger.

## 16. Keputusan pemilik proyek (Dikonfirmasi 2026-11-05)

1. **Master Prompt Utuh (Bagian 1–21)**:
   - Alur AI Question Generator (§12): Pilih BAB → Materi → Jumlah soal → Tingkat kesulitan → Generate → Tampil ke guru → Guru dapat mengedit & menyetujui → Soal yang disetujui masuk ke bank soal.
   - Daftar Achievement resmi (§15): `First Explorer`, `Learning Explorer`, `Practice Master`, `Perfect Score`, `Chapter Complete`, `Bahasa Play Champion`.
   - Halaman depan (§21): Menyediakan **Landing Page profesional** sebelum masuk ke halaman Login/Dashboard.
2. **Skema Login & Password Default**:
   - **Siswa**: Login menggunakan **NISN** + password. Password default awal saat dibuat/di-import = **NISN** siswa tersebut.
   - **Guru**: Login menggunakan **Email** + password. Password default awal = `smancir123`.
   - **Administrator**: Login menggunakan **Username** `admin`, password default = `admin123`.
   - Form login menerima satu input fleksibel (`NISN / Email / Username`) + password.
3. **Cakupan Guru & Kelas**:
   - Tahap awal digunakan oleh **1 Guru Bahasa Indonesia** (Pak Bangkit Candra Maulana) yang mengampu banyak kelas XII di SMAN 1 Ciruas.
4. **Aturan Nilai Ujian & Remedial**:
   - Nilai resmi ujian yang diambil jika siswa melakukan lebih dari 1 percobaan (remedial) adalah **Nilai Tertinggi (`best_score`)**.
5. **Struktur Zona & Syarat Kelulusan (Penyederhanaan UX menjadi 2 Zona Utama per BAB)**:
   - **Syarat lulus materi (Learning)**: Siswa telah membaca **semua materi wajib** pada BAB tersebut.
   - **Penggabungan Learning + Practice di Peta 3D**: Agar pengalaman siswa lebih ringkas dan tidak berpindah-pindah 3 peta per BAB, **Learning Zone dan Practice Zone disatukan dalam satu lingkungan "Zona Belajar & Latihan"**, lalu diikuti **"Zona Ujian (Examination Zone)"**:
     1. **Zona Belajar & Latihan**: Siswa menjelajahi peta 3D, berinteraksi dengan NPC pemateri & objek untuk membaca semua materi. Setelah semua materi dibaca, siswa langsung dapat mengakses **Latihan Soal (Practice)** lewat NPC Pemandu Latihan / panel latihan di zona yang sama (maks. 10 soal A–E acak, pembahasan tampil setelah submit).
     2. **Zona Ujian (Examination Zone)**: Terbuka otomatis setelah nilai terbaik Latihan Soal **≥ 75 (KKM)**. Berisi ujian resmi ber-timer server.
   - Di database dan Dashboard Siswa/Guru, progres **Materi (Learning)**, **Latihan (Practice)**, dan **Ujian (Examination)** tetap tercatat dan ditampilkan secara terpisah agar laporan tetap detail.
6. **Nama Folder Proyek**:
   - Tetap menggunakan `C:\xampp\htdocs\BAHASA-PLAY` (huruf kapital sepenuhnya didukung oleh Windows, XAMPP, Laravel, dan Vite).
