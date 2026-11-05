# GAME DESIGN — BAHASA PLAY

## 1. Pilar desain
1. **Belajar dulu, baru main.** Setiap aksi di dunia 3D harus mengarah ke materi, misi, atau soal.
2. **Ringan.** Low-poly stylized, warna cerah datar (flat/toon), sedikit tekstur. Target ≥ 30 fps di ponsel kelas menengah.
3. **Data-driven.** Satu mesin (`ZoneScene`) + konfigurasi JSON per zona = 18 zona tanpa menulis 18 scene manual.
4. **Hormat budaya & tempat nyata.** Landmark digambarkan "terinspirasi", bukan replika; tanpa logo/merek dagang perusahaan.

## 2. Gaya visual
- Stylized/low-poly ala Roblox: bentuk kotak-bulat, proporsi chibi, tanpa realisme.
- Palet per BAB (bisa diubah):
  - BAB 1 Cilegon: biru baja, oranye industri, abu muda.
  - BAB 2 Serang (Banten Lama): putih gading, hijau lumut, bata merah; Royal Baroe: warna pertokoan cerah.
  - BAB 3 Tangsel/Gading Serpong: kaca biru-toska, putih, aksen neon ungu (tema teknologi).
  - BAB 4 Lebak/Baduy: cokelat kayu & bambu, hijau hutan, krem ijuk; Alun-Alun Lebak: hijau taman.
  - BAB 6 SMAN 1 Ciruas: warna gedung sekolah sesuai foto referensi.
- Zona **Examination** di tiap peta: warna lebih tenang, sedikit NPC, musik/ambience minim, papan "Ruang Ujian".
- Material: `MeshToonMaterial` atau `MeshStandardMaterial` roughness tinggi; bayangan sederhana (1 directional light + `ContactShadows`/baked).

## 3. Kontrol & kamera
| Platform | Gerak | Interaksi | Lainnya |
|---|---|---|---|
| Desktop | WASD / panah, Shift lari | **E** / klik NPC | Esc = menu jeda, M = peta mini (opsional) |
| Ponsel | Joystick virtual kiri bawah | Tombol "Bicara/Lihat" kanan bawah (muncul saat dekat target) | Tombol menu kanan atas |

- Kamera third-person mengikuti pemain (lerp halus), tidak menembus dinding (raycast sederhana / jarak dibatasi).
- Portrait: kamera sedikit lebih jauh & tinggi; HUD menyesuaikan.
- Interaksi aktif bila jarak ≤ 2,5 unit; tampilkan penanda "!" (misi) atau "?" (info) di atas NPC.

## 4. Siklus belajar dalam zona
```
Masuk zona (loading screen + tujuan zona)
 → NPC pemandu menyapa → memberi misi pertama
 → Pemain menjelajah, bicara dengan NPC lain / membuka objek
 → Panel Materi terbuka (teks + gambar, bertahap per halaman)
 → Cek pemahaman singkat (1–2 soal ringan, dinilai server, tidak masuk nilai)
 → Misi selesai → XP + progres → misi berikutnya
 → Semua materi wajib + misi wajib selesai → "Learning Zone selesai!" → portal ke Practice Zone terbuka
```
- **Practice Zone**: NPC pemandu latihan → membuka UI latihan 2D (modal layar penuh di atas kanvas). Hasil ≥ KKM → gerbang ujian terbuka (animasi gerbang).
- **Examination Zone**: NPC pengawas → konfirmasi aturan ujian → **mode fokus** (kanvas 3D di-unmount/dijeda untuk menghemat baterai, UI ujian 2D penuh).

## 5. Format zone config (JSON)
```json
{
  "map_key": "cilegon",
  "area_key": "alun_alun",
  "theme": { "sky": "#bfe3ff", "ground": "#8fd18f", "fog": [20, 80] },
  "spawn": { "position": [0, 0, 8], "rotationY": 3.14 },
  "bounds": { "min": [-40, -40], "max": [40, 40] },
  "structures": [
    { "type": "building", "preset": "factory", "position": [-18, 0, -12], "size": [10, 6, 8], "color": "#6b7c93", "label": "Kawasan Industri" },
    { "type": "prop", "model": "assets/models/common/tree.glb", "position": [4, 0, -3], "scale": 1.2 }
  ],
  "npcs": [ { "id": "npc_hrd", "ref": 12 } ],
  "interactables": [ { "id": "board_cv", "ref": 40 } ],
  "portals": [ { "to": "practice", "position": [30, 0, 0], "requires": "learning_completed" } ]
}
```
- `structures` boleh **primitif** (box/cylinder dengan preset: `building`, `factory`, `mosque`, `tower`, `house_stilts`, `shop`, `school_block`, `fence`, `tree`, `road`, `bench`, `lamp`) — agen membuat komponen preset ini sekali, dipakai ulang semua zona.
- NPC, objek, dialog, misi berasal dari tabel DB (`ref`) dan dikelola guru. Posisi bisa diatur guru lewat form angka (fase lanjut: editor drag-drop sederhana).
- Zona yang berbagi peta (`map_key` sama) memakai struktur peta yang sama, hanya `area_key`/spawn berbeda.

## 6. Peta per BAB (sketsa isi)
| Peta | Area | Isi kunci |
|---|---|---|
| `cilegon` | `alun_alun` (Learning), `kawasan_industri` (Learning, sub-area), `pusat_kota` (Practice), `gedung_serbaguna` (Exam) | Alun-alun, pabrik baja bergaya low-poly (cerobong, pipa, gudang), kantor HRD, papan lowongan kerja |
| `banten_lama` | `masjid_agung` (Learning) | Siluet menara & masjid bergaya terinspirasi (atap tumpang), pelataran, papan sejarah, objek "langkah-langkah" (mis. tata cara berwudu sebagai contoh teks prosedur — konfirmasi guru) |
| `royal_baroe` | `pertokoan` (Practice), `aula` (Exam) | Deretan toko, kios, area publik |
| `gading_serpong` | `kawasan_bisnis` (Learning) | Gedung kaca tinggi, kantor startup, layar hologram, robot pemandu, komputer interaktif |
| `alun_tangsel` | `taman` (Practice), `pendopo` (Exam) | Alun-alun, taman, bangunan publik |
| `baduy` | `kampung` (Learning) | Rumah panggung kayu-bambu beratap ijuk, leuit (lumbung padi), jalan setapak tanah, sungai, hutan, jembatan bambu |
| `alun_lebak` | `taman` (Practice), `pendopo` (Exam) | Alun-alun Rangkasbitung, pendopo |
| `smancir` | `gerbang_lapangan` (Learning), `perpustakaan` & `koridor` (Learning), `kelas` (Practice), `ruang_ujian` (Exam) | Dibuat dari foto referensi pemilik proyek |
| (BAB 5) | dipilih guru dari peta yang ada | Guru memilih `map_key` + `area_key` yang tersedia |

## 7. Pedoman budaya — kawasan Baduy (WAJIB)
- Gambarkan sebagai permukiman yang hidup dan bermartabat; NPC adalah pemandu/tokoh yang **menjelaskan** nilai (pikukuh, menjaga hutan, kesederhanaan, gotong royong), bukan objek tontonan.
- Hindari: karikatur, label "primitif/terbelakang", humor tentang adat, pakaian yang salah kaprah, ritual sakral sebagai permainan.
- Pakaian NPC sederhana dan sopan (warna putih/hitam/biru tua secara umum), tanpa detail sakral yang tidak dipahami.
- Latar cukup bergaya "Baduy Luar/kampung adat secara umum"; jangan menggambarkan tempat/ritual yang dirahasiakan.
- Seluruh teks materi tentang Baduy ditinjau guru sebelum `published`.

## 8. Aset 3D
- Tahap 1: **semua primitif** (box, cylinder, cone) + warna — cepat dan ringan, cukup untuk alur belajar.
- Tahap 2: ganti bertahap dengan GLB low-poly berlisensi bebas: **Kenney.nl** (CC0), **Quaternius** (CC0), **Poly Pizza** (cek lisensi per model). Simpan atribusi di `public/assets/CREDITS.md`.
- Landmark khusus (masjid, sekolah): dimodelkan sederhana di **Blender** dari foto referensi, atau dibuat dengan generator 3D AI lalu dirapikan.
- Optimasi wajib: `gltf-transform` (draco/meshopt + resize tekstur ≤ 1024px), instancing untuk objek berulang (pohon, lampu), batas ±50–80 ribu segitiga per zona, `useGLTF.preload` hanya untuk zona berikutnya.
- Avatar: karakter low-poly dengan animasi idle/jalan/lari (mis. dari Quaternius/Mixamo), warna baju & kulit bisa dikustom (`avatar_config`).

## 9. Dialog & materi
- Kalimat NPC pendek (≤ 2 kalimat per gelembung), bahasa santun, sapaan khas daerah secukupnya (mis. "Punten", "Mangga").
- Materi panjang tidak ditaruh di gelembung dialog → gunakan **Panel Materi** (berhalaman, ada gambar, tombol "Saya sudah paham").
- Setiap dialog berakhir dengan arahan jelas: "Coba temui Pak X di dekat menara" + penanda di peta mini/kompas.

## 10. Achievement (usulan, dapat diubah guru/admin)
| Key | Nama | Syarat |
|---|---|---|
| `first_steps` | Langkah Pertama | Menyelesaikan misi pertama |
| `explorer_{bab}` | Penjelajah BAB n | Semua materi wajib BAB n dibuka |
| `practice_pass` | Siap Ujian | Lulus latihan pertama kali |
| `perfect_practice` | Sempurna! | Nilai latihan 100 |
| `persistent` | Pantang Menyerah | Lulus latihan setelah ≥ 3 percobaan |
| `exam_master` | Juara Ujian | Nilai ujian ≥ 90 |
| `all_chapters` | Sang Pujangga | Menyelesaikan semua BAB |

## 11. Audio (opsional, fase akhir)
Ambience per peta (lalu lintas, pabrik, burung, sungai), SFX interaksi & berhasil. Tombol mute; nonaktif otomatis di Examination Zone.
