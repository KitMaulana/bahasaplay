<?php

namespace Database\Seeders;

use App\Models\Achievement;
use App\Models\Chapter;
use App\Models\Dialogue;
use App\Models\Exam;
use App\Models\Interactable;
use App\Models\Material;
use App\Models\Mission;
use App\Models\MissionStep;
use App\Models\Npc;
use App\Models\PracticeConfig;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\SchoolClass;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LmsContentSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::where('username', 'bangkit')->first() ?? User::first();
        $classes = SchoolClass::all();

        $this->seedAchievements();
        $this->seedChaptersAndContent($teacher?->id, $classes);
    }

    protected function seedAchievements(): void
    {
        $items = [
            [
                'key' => 'first_explorer',
                'name' => 'First Explorer',
                'description' => 'Memulai petualangan belajar dan membuka materi pertama di Zona Belajar.',
                'icon' => 'compass',
                'xp' => 50,
            ],
            [
                'key' => 'learning_explorer',
                'name' => 'Learning Explorer',
                'description' => 'Menuntaskan seluruh materi pembelajaran wajib pada satu BAB.',
                'icon' => 'book-open',
                'xp' => 100,
            ],
            [
                'key' => 'practice_master',
                'name' => 'Practice Master',
                'description' => 'Berhasil lulus Latihan Soal dengan nilai minimal 75 (KKM) dan membuka Zona Ujian.',
                'icon' => 'award',
                'xp' => 150,
            ],
            [
                'key' => 'perfect_score',
                'name' => 'Perfect Score',
                'description' => 'Meraih nilai sempurna 100 pada sesi Latihan Soal atau Ujian Resmi.',
                'icon' => 'star',
                'xp' => 200,
            ],
            [
                'key' => 'chapter_complete',
                'name' => 'Chapter Complete',
                'description' => 'Menyelesaikan seluruh rangkaian Belajar, Latihan, dan Ujian Resmi pada satu BAB.',
                'icon' => 'medal',
                'xp' => 250,
            ],
            [
                'key' => 'bahasa_play_champion',
                'name' => 'Bahasa Play Champion',
                'description' => 'Menuntaskan seluruh BAB pembelajaran Bahasa Indonesia Kelas XII di BAHASA PLAY.',
                'icon' => 'trophy',
                'xp' => 500,
            ],
        ];

        foreach ($items as $item) {
            Achievement::updateOrCreate(['key' => $item['key']], $item);
        }
    }

    protected function seedChaptersAndContent(?int $teacherId, $classes): void
    {
        $definitions = [
            1 => [
                'title' => 'Curriculum Vitae (CV) dan Surat Lamaran Pekerjaan',
                'slug' => 'bab-1-cv-dan-surat-lamaran-pekerjaan',
                'setting_location' => 'Kota Cilegon',
                'status' => 'published',
                'description' => 'Mempelajari pengertian, fungsi, struktur, dan kaidah kebahasaan Curriculum Vitae (CV) serta Surat Lamaran Pekerjaan dengan latar kawasan perkotaan dan industri Kota Cilegon.',
                'zones' => [
                    'learning' => [
                        'name' => 'Alun-Alun & Kawasan Industri Kota Cilegon',
                        'map_key' => 'cilegon',
                        'area_key' => 'alun_alun',
                        'description' => 'Zona Belajar & Latihan di Alun-Alun Kota Cilegon dan kawasan industri baja.',
                        'theme' => ['sky' => '#bae6fd', 'ground' => '#86efac', 'accent' => '#0284c7'],
                    ],
                    'practice' => [
                        'name' => 'Pusat Karier Kota Cilegon',
                        'map_key' => 'cilegon',
                        'area_key' => 'pusat_kota',
                        'description' => 'Area latihan kemampuan menyusun CV dan surat lamaran pekerjaan.',
                        'theme' => ['sky' => '#bae6fd', 'ground' => '#94a3b8', 'accent' => '#f97316'],
                    ],
                    'exam' => [
                        'name' => 'Gedung Seleksi & Evaluasi Kota Cilegon',
                        'map_key' => 'cilegon',
                        'area_key' => 'gedung_serbaguna',
                        'description' => 'Ruang ujian resmi yang tenang dan formal untuk evaluasi BAB 1.',
                        'theme' => ['sky' => '#cbd5e1', 'ground' => '#64748b', 'accent' => '#0f172a'],
                    ],
                ],
                'materials' => [
                    [
                        'title' => 'Pengertian, Fungsi, dan Struktur Curriculum Vitae (CV)',
                        'summary' => 'Memahami fungsi daftar riwayat hidup (CV) dan urutan strukturnya untuk melamar pekerjaan.',
                        'content' => "<h3>1. Pengertian dan Fungsi CV</h3><p><strong>Curriculum Vitae (CV)</strong> atau Daftar Riwayat Hidup adalah dokumen ringkas yang memuat identitas diri, riwayat pendidikan, pengalaman organisasi/kerja, serta keahlian seseorang secara faktual dan sistematis.</p><h3>2. Struktur dan Unsur Informasi dalam CV</h3><ul><li><strong>Identitas Diri:</strong> Nama lengkap, tempat/tanggal lahir, alamat, nomor telepon, dan pos-el (email) profesional.</li><li><strong>Ringkasan Profil:</strong> Gambaran singkat potensi dan tujuan karier.</li><li><strong>Riwayat Pendidikan:</strong> Urutan pendidikan formal (dimulai dari jenjang terbaru).</li><li><strong>Pengalaman Organisasi/Kerja/Magang:</strong> Posisi, nama instansi, tahun, dan capaian.</li><li><strong>Keahlian (Skills) & Prestasi:</strong> Kemampuan teknis, bahasa, maupun sertifikasi.</li></ul><h3>3. Bahasa dalam CV</h3><p>Gunakan bahasa Indonesia baku, ringkas, jelas, objektif, dan kata kerja aktif yang menggambarkan pencapaian.</p>",
                    ],
                    [
                        'title' => 'Pengertian, Tujuan, dan Struktur Surat Lamaran Pekerjaan',
                        'summary' => 'Mempelajari bagian-bagian surat lamaran pekerjaan resmi dari tempat/tanggal hingga tanda tangan.',
                        'content' => "<h3>1. Pengertian dan Tujuan</h3><p><strong>Surat Lamaran Pekerjaan</strong> adalah surat pribadi yang bersifat resmi yang diajukan oleh seseorang kepada instansi atau perusahaan untuk mengisi posisi pekerjaan tertentu.</p><h3>2. Struktur Surat Lamaran Pekerjaan</h3><ol><li><strong>Tempat dan Tanggal Pembuatan Surat:</strong> Contoh: <em>Cilegon, 5 November 2026</em> (tanpa titik di akhir).</li><li><strong>Lampiran dan Hal (Perihal):</strong> Contoh: <em>Lampiran: Lima lembar</em> (ditulis huruf, bukan angka).</li><li><strong>Alamat Tujuan Surat:</strong> Diawali <em>Yth.</em> (tanpa kata 'Kepada' dan tanpa gelar sapaan ganda seperti 'Bapak/Ibu HRD' jika sudah menyebut jabatan).</li><li><strong>Salam Pembuka:</strong> <em>Dengan hormat,</em> (diakhiri tanda koma).</li><li><strong>Alinea Pembuka:</strong> Menyebutkan sumber informasi lowongan dan posisi yang dilamar.</li><li><strong>Isi (Identitas & Lampiran Berkas):</strong> Rincian data diri (huruf awal kecil: nama, tempat/tanggal lahir, pendidikan, alamat) dan daftar berkas lampiran.</li><li><strong>Alinea Penutup:</strong> Harapan dan ucapan terima kasih yang santun (contoh: <em>Atas perhatian Bapak/Ibu, saya ucapkan terima kasih.</em>).</li><li><strong>Salam Penutup, Tanda Tangan, dan Nama Terang:</strong> <em>Hormat saya,</em> diikuti tanda tangan dan nama lengkap.</li></ol>",
                    ],
                    [
                        'title' => 'Kaidah Kebahasaan dan Penyusunan Surat Lamaran Pekerjaan yang Baik',
                        'summary' => 'Aturan penulisan EYD V dalam surat lamaran pekerjaan yang sering diujikan.',
                        'content' => "<h3>Kaidah Kebahasaan Surat Lamaran Pekerjaan</h3><ul><li><strong>Menggunakan Bahasa Baku (EYD V):</strong> Hindari kata tidak baku seperti <em>fotocopy</em> (baku: <strong>fotokopi</strong>), <em>ijazah</em> (baku: <strong>ijazah</strong>), <em>praktek</em> (baku: <strong>praktik</strong>).</li><li><strong>Penulisan Alamat Tujuan:</strong><br/>Benar: <em>Yth. Manajer Personalia PT Krakatau Baja Nusantara<br/>Jalan Industri Nomor 10<br/>Cilegon</em><br/>(Kata <em>Jalan</em> tidak disingkat <em>Jl.</em>, dan tidak diakhiri tanda titik).</li><li><strong>Kalimat Efektif di Penutup:</strong><br/>Salah: <em>Atas perhatiannya saya haturkan banyak terima kasih.</em><br/>Benar: <em>Atas perhatian Bapak/Ibu, saya ucapkan terima kasih.</em></li></ul>",
                    ],
                ],
                'npcs' => [
                    [
                        'name' => 'Ibu Ratna (HRD Industri Baja)',
                        'role_label' => 'Manajer HRD Kawasan Industri Cilegon',
                        'position' => [-6, 0, -4],
                        'color' => '#0284c7',
                        'greeting' => 'Selamat datang di Kota Cilegon! Sebagai HRD di kawasan industri baja, saya setiap hari menyeleksi ratusan CV dan surat lamaran. Mari pelajari cara menyusun CV yang profesional!',
                    ],
                    [
                        'name' => 'Kang Dimas (Pencari Kerja)',
                        'role_label' => 'Lulusan Muda Pencari Kerja',
                        'position' => [6, 0, -3],
                        'color' => '#10b981',
                        'greeting' => 'Halo! Saya sedang menyiapkan berkas surat lamaran kerja. Ternyata struktur dan ejaan surat lamaran itu harus mengikuti kaidah baku EYD V!',
                    ],
                    [
                        'name' => 'Pak Hendra (Konsultan Karier)',
                        'role_label' => 'Pemandu Latihan & Kaidah Kebahasaan',
                        'position' => [0, 0, -8],
                        'color' => '#f59e0b',
                        'greeting' => 'Sudah membaca ketiga materi CV dan Surat Lamaran? Jika sudah 100%, ayo uji kemampuanmu di Latihan Soal agar gerbang Zona Ujian terbuka!',
                    ],
                ],
                'questions' => [
                    [
                        'stem' => 'Penulisan alamat tujuan surat lamaran pekerjaan yang paling tepat sesuai kaidah EYD V adalah...',
                        'options' => [
                            'A' => "Kepada Yth. Bapak Direktur PT Baja Cilegon\nJl. Raya Industri No. 12\nCilegon.",
                            'B' => "Yth. Direktur PT Baja Cilegon\nJalan Raya Industri Nomor 12\nCilegon",
                            'C' => "Yth: Direktur PT Baja Cilegon\nJln. Raya Industri 12\nKota Cilegon.",
                            'D' => "Kepada:\nYth. Direktur PT. Baja Cilegon\nJalan Raya Industri 12, Cilegon",
                            'E' => "Yth. Bapak/Ibu Direktur PT. Baja Cilegon\nJl. Raya Industri Nomor 12\nCilegon.",
                        ],
                        'correct' => 'B',
                        'explanation' => 'Penulisan alamat tujuan tidak menggunakan kata "Kepada", singkatan "Yth." diakhiri titik, singkatan "PT" tanpa titik, kata "Jalan" dan "Nomor" ditulis lengkap, serta akhir baris tidak diberi tanda titik.',
                    ],
                    [
                        'stem' => 'Perhatikan kalimat penutup surat lamaran berikut: "Atas perhatiannya, saya ucapkan banyak-banyak terima kasih." Perbaikan kalimat tersebut agar efektif dan santun adalah...',
                        'options' => [
                            'A' => 'Atas perhatian Bapak/Ibu, saya ucapkan terima kasih.',
                            'B' => 'Atas perhatian daripada Bapak/Ibu, saya haturkan terima kasih.',
                            'C' => 'Atas perhatiannya Bapak/Ibu, saya mengucapkan terima kasih banyak.',
                            'D' => 'Atas segala perhatiannya, diucapkan terima kasih sebesar-besarnya.',
                            'E' => 'Atas bantuan dan perhatiannya, saya ucapkan terima kasih sekali.',
                        ],
                        'correct' => 'A',
                        'explanation' => 'Kata ganti "-nya" pada "perhatiannya" harus diganti sapaan "Bapak/Ibu" atau "Saudara", dan frasa "banyak-banyak terima kasih" cukup ditulis "terima kasih".',
                    ],
                    [
                        'stem' => 'Fungsi utama Curriculum Vitae (CV) dalam proses melamar pekerjaan adalah...',
                        'options' => [
                            'A' => 'Menjelaskan kisah masa kecil pelamar secara naratif dan puitis.',
                            'B' => 'Memberikan gambaran ringkas, faktual, dan sistematis mengenai kualifikasi, pendidikan, dan pengalaman pelamar.',
                            'C' => 'Menggantikan ijazah asli dan transkrip nilai saat wawancara.',
                            'D' => 'Menentukan besaran gaji yang wajib dibayarkan oleh perusahaan.',
                            'E' => 'Memuat opini pelamar mengenai kondisi ekonomi nasional.',
                        ],
                        'correct' => 'B',
                        'explanation' => 'CV berfungsi menyajikan rangkuman kualifikasi, riwayat pendidikan, pengalaman, dan keahlian pelamar secara faktual kepada perekrut (HRD).',
                    ],
                    [
                        'stem' => 'Apabila seorang pelamar mengetahui lowongan kerja dari pengumuman di koran Banten Pos tanggal 2 November 2026, kalimat alinea pembuka surat lamaran yang tepat adalah...',
                        'options' => [
                            'A' => 'Berdasarkan iklan di harian Banten Pos pada tanggal 2 November 2026, dengan ini saya mengajukan lamaran pekerjaan sebagai Staf Administrasi.',
                            'B' => 'Menurut koran Banten Pos yang saya baca kemarin, saya mau melamar kerja di tempat Bapak.',
                            'C' => 'Sehubungan dengan adanya berita di Banten Pos, saya minta diterima sebagai Staf Administrasi.',
                            'D' => 'Dengan surat ini saya melamar pekerjaan karena melihat koran Banten Pos tanggal 2 November 2026.',
                            'E' => 'Melalui surat ini saya berharap Bapak membaca koran Banten Pos tanggal 2 November 2026.',
                        ],
                        'correct' => 'A',
                        'explanation' => 'Alinea pembuka berdasarkan iklan harus menyebutkan sumber media, tanggal terbit, dan posisi yang dilamar dengan bahasa resmi dan santun.',
                    ],
                    [
                        'stem' => 'Penulisan pemerincian identitas pelamar di dalam isi surat lamaran pekerjaan yang benar sesuai kaidah ejaan adalah...',
                        'options' => [
                            'A' => 'Nama, Tempat/Tanggal Lahir, dan Alamat diawali huruf kapital serta diakhiri tanda titik.',
                            'B' => 'nama, tempat/tanggal lahir, pendidikan terakhir, dan alamat diawali huruf kecil karena merupakan kelanjutan kalimat pengantar.',
                            'C' => 'Seluruh huruf pada identitas wajib ditulis dengan huruf kapital semua.',
                            'D' => 'Tidak perlu mencantumkan nama dan alamat karena sudah ada di amplop.',
                            'E' => 'Setiap baris rincian diakhiri dengan tanda seru (!).',
                        ],
                        'correct' => 'B',
                        'explanation' => 'Pemerincian identitas merupakan kelanjutan dari kalimat pengantar ("Saya yang bertanda tangan di bawah ini,"), sehingga rincian "nama", "tempat, tanggal lahir", " alamat" diawali huruf kecil.',
                    ],
                    [
                        'stem' => 'Manakah di bawah ini yang merupakan penulisan kata baku yang tepat untuk dicantumkan dalam daftar lampiran surat lamaran pekerjaan?',
                        'options' => [
                            'A' => 'Fotocopy ijasah yang telah dilegalisir',
                            'B' => 'Fotokopi ijazah yang telah dilegalisasi',
                            'C' => 'Photo copy ijazah yang sudah dilegalisir',
                            'D' => 'Foto kopi ijasah yang telah dilegalisasi',
                            'E' => 'Fotokopi ijasah yang sudah di legalisir',
                        ],
                        'correct' => 'B',
                        'explanation' => 'Sesuai KBBI dan EYD V, bentuk baku adalah "fotokopi", "ijazah", dan "dilegalisasi".',
                    ],
                    [
                        'stem' => 'Penulisan tempat dan tanggal pembuatan surat lamaran pekerjaan yang benar adalah...',
                        'options' => [
                            'A' => 'Cilegon, 05-11-2026.',
                            'B' => 'Cilegon, 5 November 2026',
                            'C' => 'Kota Cilegon: 5 November 2026.',
                            'D' => 'cilegon, 5 nopember 2026',
                            'E' => 'Cilegon. 5 November 2026',
                        ],
                        'correct' => 'B',
                        'explanation' => 'Nama kota diikuti tanda koma, tanggal dengan angka, nama bulan ditulis lengkap dengan huruf awal kapital (November), tahun dengan angka, tanpa tanda titik di akhir.',
                    ],
                    [
                        'stem' => 'Urutan penulisan riwayat pendidikan dalam CV profesional (chronological order terbalik) biasanya disusun berdasarkan...',
                        'options' => [
                            'A' => 'Jenjang pendidikan paling tinggi/terbaru ke jenjang sebelumnya secara runtut.',
                            'B' => 'Abjad nama sekolah dari A sampai Z.',
                            'C' => 'Jarak lokasi sekolah dari rumah pelamar.',
                            'D' => 'Jumlah siswa yang ada di sekolah tersebut.',
                            'E' => 'Urutan acak sesuai keinginan pelamar.',
                        ],
                        'correct' => 'A',
                        'explanation' => 'Dalam CV profesional, riwayat pendidikan dan pengalaman disusun secara kronologis terbalik (mulai dari yang paling baru) atau kronologis runtut agar mudah ditinjau HRD.',
                    ],
                    [
                        'stem' => 'Penulisan bagian "Lampiran" pada awal surat lamaran pekerjaan yang sesuai kaidah surat resmi adalah...',
                        'options' => [
                            'A' => 'Lampiran: 5 (lima) berkas.',
                            'B' => 'Lampiran: Lima lembar',
                            'C' => 'Lamp. : 5 lbr.',
                            'D' => 'Lampiran = 5 berkas',
                            'E' => 'Lampiran: -',
                        ],
                        'correct' => 'B',
                        'explanation' => 'Kata "Lampiran" tidak disingkat, jumlah ditulis dengan huruf ("Lima lembar" atau "Lima berkas"), dan tidak diakhiri tanda titik.',
                    ],
                    [
                        'stem' => 'Bagian dalam Curriculum Vitae (CV) yang berisi kemampuan penguasaan perangkat lunak, bahasa asing, atau kompetensi teknis disebut...',
                        'options' => [
                            'A' => 'Riwayat Keluarga',
                            'B' => 'Keahlian / Kompetensi (Skills)',
                            'C' => 'Salam Pembuka',
                            'D' => 'Tembusan Surat',
                            'E' => 'Alinea Penutup',
                        ],
                        'correct' => 'B',
                        'explanation' => 'Bagian Keahlian (Skills) memuat kompetensi teknis (hard skills) maupun nonteknis (soft skills) yang relevan dengan posisi yang dilamar.',
                    ],
                ],
            ],
            2 => [
                'title' => 'Teks Prosedur Sederhana dan Teks Prosedur Kompleks',
                'slug' => 'bab-2-teks-prosedur-sederhana-dan-kompleks',
                'setting_location' => 'Kota Serang',
                'status' => 'published',
                'description' => 'Mempelajari pengertian, tujuan, ciri, struktur, dan kaidah kebahasaan teks prosedur sederhana maupun kompleks dengan latar Masjid Agung Banten Lama dan kawasan Royal Baroe Kota Serang.',
                'zones' => [
                    'learning' => [
                        'name' => 'Kawasan Masjid Agung Banten Lama & Royal Baroe',
                        'map_key' => 'banten_lama',
                        'area_key' => 'masjid_agung',
                        'description' => 'Zona Belajar & Latihan di kawasan bersejarah Banten Lama dan Royal Baroe Kota Serang.',
                        'theme' => ['sky' => '#fef3c7', 'ground' => '#86efac', 'accent' => '#d97706'],
                    ],
                    'practice' => [
                        'name' => 'Kawasan Pertokoan Royal Baroe Kota Serang',
                        'map_key' => 'royal_baroe',
                        'area_key' => 'pertokoan',
                        'description' => 'Area latihan analisis struktur dan langkah-langkah teks prosedur.',
                        'theme' => ['sky' => '#bae6fd', 'ground' => '#cbd5e1', 'accent' => '#f59e0b'],
                    ],
                    'exam' => [
                        'name' => 'Aula Evaluasi Royal Baroe Kota Serang',
                        'map_key' => 'royal_baroe',
                        'area_key' => 'aula',
                        'description' => 'Zona ujian resmi BAB 2 di Kota Serang.',
                        'theme' => ['sky' => '#cbd5e1', 'ground' => '#64748b', 'accent' => '#0f172a'],
                    ],
                ],
                'materials' => [
                    [
                        'title' => 'Pengertian, Tujuan, dan Ciri-Ciri Teks Prosedur',
                        'summary' => 'Memahami fungsi teks prosedur dalam memandu langkah-langkah kegiatan secara runtut.',
                        'content' => "<h3>1. Pengertian dan Tujuan</h3><p><strong>Teks Prosedur</strong> adalah teks yang berisi langkah-langkah atau tahapan sistematis yang harus dilakukan untuk mencapai suatu tujuan.</p><h3>2. Ciri-Ciri Teks Prosedur</h3><ul><li>Berisi panduan langkah-langkah yang urut dan logis.</li><li>Menggunakan kalimat perintah (imperatif).</li><li>Menggunakan kata kerja aktif/material.</li><li>Menggunakan konjungsi temporal (urutan waktu).</li><li>Terdapat aturan atau batasan dalam bahan maupun kegiatan.</li></ul>",
                    ],
                    [
                        'title' => 'Teks Prosedur Sederhana, Kompleks, dan Strukturnya',
                        'summary' => 'Perbedaan prosedur sederhana vs kompleks serta struktur Tujuan, Langkah-Langkah, dan Penegasan Ulang.',
                        'content' => "<h3>1. Teks Prosedur Sederhana vs Kompleks</h3><ul><li><strong>Teks Prosedur Sederhana:</strong> Hanya terdiri atas 2–4 langkah singkat dan tidak memiliki sub-langkah bercabang.</li><li><strong>Teks Prosedur Kompleks:</strong> Terdiri atas banyak tahapan, memiliki sub-langkah, serta syarat/kondisi percabangan (<em>jika... maka...</em>).</li></ul><h3>2. Struktur Teks Prosedur</h3><ol><li><strong>Tujuan:</strong> Pengantar mengenai hasil akhir yang akan dicapai.</li><li><strong>Material (Alat dan Bahan):</strong> Opsional, berisi rincian alat/bahan.</li><li><strong>Langkah-Langkah:</strong> Tahapan kronologis yang tidak boleh dibalik.</li><li><strong>Penegasan Ulang (Penutup):</strong> Simpulan atau harapan setelah langkah dijalankan.</li></ol>",
                    ],
                    [
                        'title' => 'Kaidah Kebahasaan: Kalimat Imperatif, Konjungsi Temporal, & Verba Material',
                        'summary' => 'Mengenali kata kerja material, kalimat perintah, dan konjungsi urutan waktu.',
                        'content' => "<h3>Kaidah Kebahasaan Teks Prosedur</h3><ul><li><strong>Kalimat Imperatif (Perintah):</strong> Contoh: <em>Siapkan berkas pendaftaran</em>, <em>Pastikan koneksi stabil</em>.</li><li><strong>Konjungsi Temporal (Urutan Waktu):</strong> Contoh: <em>pertama, kemudian, selanjutnya, setelah itu, akhirnya</em>.</li><li><strong>Verba Material & Tingkah Laku:</strong> Verba material mengacu pada tindakan fisik (<em>memotong, mencetak, mengunggah</em>), sedangkan verba tingkah laku mengacu pada sikap/mental (<em>memastikan, menyetujui</em>).</li></ul>",
                    ],
                ],
                'npcs' => [
                    [
                        'name' => 'Ustadz Hafidz (Pemandu Banten Lama)',
                        'role_label' => 'Pemandu Sejarah & Tata Tertib Kunjungan',
                        'position' => [-5, 0, -4],
                        'color' => '#d97706',
                        'greeting' => 'Assalamualaikum! Di kawasan Masjid Agung Banten Lama ini, setiap pengunjung mengikuti prosedur kunjungan yang tertib. Mari pelajari konsep Teks Prosedur!',
                    ],
                    [
                        'name' => 'Teh Rani (Wirausaha Royal Baroe)',
                        'role_label' => 'Praktisi Kuliner & Prosedur Kompleks',
                        'position' => [5, 0, -4],
                        'color' => '#10b981',
                        'greeting' => 'Halo! Di Royal Baroe Serang, kami menerapkan SOP (prosedur kompleks) mulai dari persiapan bahan hingga pelayanan pelanggan.',
                    ],
                ],
                'questions' => $this->generateQuestionsForChapter(2, 'Teks Prosedur Sederhana dan Kompleks'),
            ],
            3 => [
                'title' => 'Artificial Intelligence dan Teks Eksplanasi Kompleks',
                'slug' => 'bab-3-ai-dan-teks-eksplanasi-kompleks',
                'setting_location' => 'Kota Tangerang Selatan',
                'status' => 'published',
                'description' => 'Mempelajari perkembangan Artificial Intelligence (AI), etika AI, teknik prompting, serta struktur dan kaidah kebahasaan Teks Eksplanasi Kompleks dengan latar kawasan modern Gading Serpong & Kota Tangerang Selatan.',
                'zones' => [
                    'learning' => [
                        'name' => 'Kawasan Inovasi & Bisnis Gading Serpong',
                        'map_key' => 'gading_serpong',
                        'area_key' => 'kawasan_bisnis',
                        'description' => 'Zona Belajar & Latihan di pusat gedung perkantoran teknologi modern Gading Serpong.',
                        'theme' => ['sky' => '#e0f2fe', 'ground' => '#94a3b8', 'accent' => '#6366f1'],
                    ],
                    'practice' => [
                        'name' => 'Alun-Alun Kota Tangerang Selatan',
                        'map_key' => 'alun_tangsel',
                        'area_key' => 'taman',
                        'description' => 'Area latihan analisis sebab-akibat teks eksplanasi kompleks dan prompting AI.',
                        'theme' => ['sky' => '#bae6fd', 'ground' => '#86efac', 'accent' => '#0ea5e9'],
                    ],
                    'exam' => [
                        'name' => 'Pendopo Evaluasi Kota Tangerang Selatan',
                        'map_key' => 'alun_tangsel',
                        'area_key' => 'pendopo',
                        'description' => 'Zona ujian resmi BAB 3 di Kota Tangerang Selatan.',
                        'theme' => ['sky' => '#cbd5e1', 'ground' => '#64748b', 'accent' => '#0f172a'],
                    ],
                ],
                'materials' => [
                    [
                        'title' => 'Perkembangan Artificial Intelligence (AI), Etika, dan Teknik Prompting',
                        'summary' => 'Memahami konsep AI, pemanfaatan etis di sekolah, serta cara menyusun prompt yang efektif.',
                        'content' => "<h3>1. Pengertian dan Perkembangan AI</h3><p><strong>Artificial Intelligence (Kecerdasan Artifisial)</strong> adalah sistem komputasi yang dirancang untuk meniru kemampuan intelektual manusia seperti mengenali pola, mengolah bahasa alami (NLP), dan mengambil keputusan.</p><h3>2. Etika Penggunaan AI</h3><p>Penggunaan AI wajib menjunjung kejujuran akademik, memverifikasi fakta (mencegah halusinasi AI), menghormati hak cipta, dan menjaga privasi data.</p><h3>3. Teknik Prompting Efektif</h3><p>Prompt yang efektif memuat 4 unsur: <strong>Peran (Role)</strong>, <strong>Konteks (Context)</strong>, <strong>Tugas Spesifik (Task)</strong>, dan <strong>Format Output (Format)</strong>.</p>",
                    ],
                    [
                        'title' => 'Struktur dan Kaidah Kebahasaan Teks Eksplanasi Kompleks',
                        'summary' => 'Membedah Pernyataan Umum, Deretan Penjelas (Sebab-Akibat), dan Interpretasi pada fenomena AI.',
                        'content' => "<h3>1. Pengertian Teks Eksplanasi Kompleks</h3><p><strong>Teks Eksplanasi Kompleks</strong> adalah teks yang menjelaskan proses terjadinya suatu fenomena alam, sosial, budaya, atau teknologi secara ilmiah melalui hubungan kausalitas (sebab-akibat) dan kronologis.</p><h3>2. Struktur Teks Eksplanasi</h3><ol><li><strong>Identifikasi Fenomena (Pernyataan Umum):</strong> Gambaran awal fenomena yang dibahas.</li><li><strong>Rangkaian Kejadian (Deretan Penjelas):</strong> Urutan proses sebab-akibat secara rinci.</li><li><strong>Interpretasi (Ulasan/Simpulan):</strong> Ringkasan atau tanggapan penulis terhadap fenomena.</li></ol><h3>3. Kaidah Kebahasaan</h3><p>Menggunakan konjungsi kausalitas (<em>karena, sebab, sehingga, oleh karena itu, akibatnya</em>), konjungsi kronologis (<em>kemudian, lalu, akhirnya</em>), kata benda fenomena, dan istilah teknis.</p>",
                    ],
                ],
                'npcs' => [
                    [
                        'name' => 'Kak Kevin (AI Engineer)',
                        'role_label' => 'Pengembang Teknologi AI Gading Serpong',
                        'position' => [-5, 0, -4],
                        'color' => '#6366f1',
                        'greeting' => 'Selamat datang di distrik teknologi Gading Serpong! Di sini kita mempelajari bagaimana AI bekerja, etika penggunaannya, dan cara membuat prompt yang efektif.',
                    ],
                    [
                        'name' => 'Dr. Nadia (Peneliti Linguistik Komputasi)',
                        'role_label' => 'Peneliti Bahasa & Teks Eksplanasi',
                        'position' => [5, 0, -4],
                        'color' => '#06b6d4',
                        'greeting' => 'Bagaimana cara menjelaskan cara kerja AI kepada masyarakat? Kita gunakan Teks Eksplanasi Kompleks dengan hubungan sebab-akibat yang logis!',
                    ],
                ],
                'questions' => $this->generateQuestionsForChapter(3, 'AI dan Teks Eksplanasi Kompleks'),
            ],
            4 => [
                'title' => 'Kearifan Lokal dan Teks Esai',
                'slug' => 'bab-4-kearifan-lokal',
                'setting_location' => 'Kabupaten Lebak',
                'status' => 'published',
                'description' => 'Mempelajari nilai-nilai kearifan lokal masyarakat Banten (khususnya tradisi menjaga kelestarian alam masyarakat Baduy secara santun), mengidentifikasi fakta dan opini, serta menulis teks tentang pelestarian budaya lokal.',
                'zones' => [
                    'learning' => [
                        'name' => 'Kawasan Budaya Baduy & Alam Lebak',
                        'map_key' => 'baduy',
                        'area_key' => 'kampung',
                        'description' => 'Zona Belajar & Latihan dengan suasana permukiman tradisional yang asri, santun, dan menghormati adat.',
                        'theme' => ['sky' => '#d9f99d', 'ground' => '#65a30d', 'accent' => '#78350f'],
                    ],
                    'practice' => [
                        'name' => 'Alun-Alun Kabupaten Lebak (Rangkasbitung)',
                        'map_key' => 'alun_lebak',
                        'area_key' => 'taman',
                        'description' => 'Area latihan identifikasi fakta, opini, dan nilai kearifan lokal.',
                        'theme' => ['sky' => '#bae6fd', 'ground' => '#86efac', 'accent' => '#15803d'],
                    ],
                    'exam' => [
                        'name' => 'Pendopo Kabupaten Lebak',
                        'map_key' => 'alun_lebak',
                        'area_key' => 'pendopo',
                        'description' => 'Zona ujian resmi BAB 4 di Kabupaten Lebak.',
                        'theme' => ['sky' => '#cbd5e1', 'ground' => '#64748b', 'accent' => '#0f172a'],
                    ],
                ],
                'materials' => [
                    [
                        'title' => 'Pengertian, Bentuk, dan Nilai Kearifan Lokal Masyarakat Banten',
                        'summary' => 'Memahami filosofi keselarasan alam, leuit (ketahanan pangan), dan gotong royong secara santun.',
                        'content' => "<h3>1. Pengertian Kearifan Lokal</h3><p><strong>Kearifan Lokal</strong> adalah pandangan hidup, pengetahuan, serta nilai-nilai luhur yang diwariskan secara turun-temurun oleh suatu masyarakat untuk menjaga keharmonisan hubungan antara manusia, komunitas, dan alam sekitar.</p><h3>2. Nilai Luhur Kearifan Lokal di Banten</h3><ul><li><strong>Menjaga Kelestarian Alam:</strong> Prinsip masyarakat adat Baduy di Kabupaten Lebak yang menjaga hutan lindung, sumber air, dan keseimbangan ekosistem tanpa merusak alam.</li><li><strong>Leuit (Lumbung Padi Tradisional):</strong> Wujud kearifan lokal dalam menjaga ketahanan pangan jangka panjang secara mandiri.</li><li><strong>Kesederhanaan dan Gotong Royong:</strong> Menjunjung kejujuran, kerja sama, dan kesantunan dalam kehidupan bermasyarakat.</li></ul>",
                    ],
                    [
                        'title' => 'Mengidentifikasi Fakta dan Opini dalam Teks Kearifan Lokal',
                        'summary' => 'Membedakan kalimat fakta yang teruji kebenarannya dengan kalimat opini/pendapat penulis.',
                        'content' => "<h3>1. Kalimat Fakta</h3><p><strong>Fakta</strong> adalah pernyataan yang berisi peristiwa atau data nyata yang telah terjadi dan dapat dibuktikan kebenarannya secara objektif (memuat data angka, tanggal, lokasi geografis, atau hasil pengamatan terverifikasi).</p><h3>2. Kalimat Opini</h3><p><strong>Opini</strong> adalah pendapat, penilaian, atau gagasan subjektif seseorang yang belum tentu disepakati semua orang, sering ditandai kata seperti <em>menurut saya, sebaiknya, sangat indah, diperkirakan, seharusnya</em>.</p><h3>3. Kalimat Asumsi</h3><p><strong>Asumsi</strong> adalah dugaan atau anggapan sementara yang dianggap benar sebagai dasar berpikir, tetapi belum dibuktikan. Contoh: <em>Jika hutan larangan terus dijaga, mata air di Lebak diperkirakan tetap lestari.</em></p>",
                    ],
                    [
                        'title' => 'Struktur dan Kaidah Kebahasaan Teks Esai Kearifan Lokal',
                        'summary' => 'Menyusun teks esai (judul, pembuka, isi, penutup), memakai padanan istilah asing, dan konjungsi korelatif.',
                        'content' => "<h3>1. Pengertian Teks Esai</h3><p><strong>Esai</strong> adalah karangan prosa yang membahas suatu masalah secara sepintas dari sudut pandang pribadi penulis, didukung fakta dan argumen yang logis.</p><h3>2. Struktur Teks Esai</h3><ol><li><strong>Judul (Head)</strong> — singkat, menarik, mewakili isi.</li><li><strong>Pembuka (Lead)</strong> — pengantar topik yang memancing minat pembaca.</li><li><strong>Isi (Body)</strong> — uraian gagasan, fakta, opini, dan argumen.</li><li><strong>Penutup (Ending)</strong> — simpulan, penegasan, atau ajakan.</li></ol><h3>3. Padanan Istilah Asing</h3><p><em>podcast</em> → siniar, <em>link</em> → pranala, <em>wireless</em> → nirkabel, <em>survivor</em> → penyintas, <em>sponsor</em> → penaja, <em>brand</em> → jenama, <em>influencer</em> → pemengaruh, <em>talk show</em> → gelar wicara, <em>outsourcing</em> → alih daya, <em>slide</em> → salindia, <em>seafood</em> → boga bahari.</p><h3>4. Konjungsi Korelatif dan Bentuk Idiomatis</h3><p><em>baik ... maupun ...</em>, <em>bukan ..., melainkan ...</em>, <em>tidak ..., tetapi ...</em>, <em>antara ... dan ...</em>, serta <em>dibandingkan dengan</em>. Contoh: <em>Baik masyarakat Kanekes maupun warga Rangkasbitung menjunjung nilai gotong royong.</em></p><h3>5. Sikap Santun</h3><p>Esai tentang masyarakat adat harus ditulis secara hormat, faktual, dan tidak stereotip.</p>",
                    ],
                ],
                'npcs' => [
                    [
                        'name' => 'Ayah Jaro (Tokoh Pemandu Budaya)',
                        'role_label' => 'Pemandu Kearifan Lokal & Pelestarian Alam',
                        'position' => [-5, 0, -4],
                        'color' => '#78350f',
                        'greeting' => 'Sampurasun. Selamat datang di Kabupaten Lebak. Di sini kita belajar menghormati alam, menjaga hutan, dan memahami makna lumbung pangan (leuit) sebagai kearifan lokal yang luhur.',
                    ],
                    [
                        'name' => 'Kang Usep (Budayawan Lebak)',
                        'role_label' => 'Pendamping Literasi Budaya & Fakta-Opini',
                        'position' => [5, 0, -4],
                        'color' => '#15803d',
                        'greeting' => 'Saat menulis artikel tentang kearifan lokal, kita harus cermat membedakan mana kalimat Fakta dan mana kalimat Opini!',
                    ],
                    [
                        'name' => 'Teh Euis (Penulis Esai Budaya)',
                        'role_label' => 'Pembimbing Menulis Teks Esai',
                        'position' => [0, 0, -5],
                        'color' => '#a16207',
                        'greeting' => 'Esai yang baik punya judul, pembuka, isi, dan penutup yang kuat. Gunakan padanan istilah Indonesia seperti siniar dan pranala, ya!',
                    ],
                ],
                'questions' => $this->generateQuestionsForChapter(4, 'Kearifan Lokal dan Fakta-Opini'),
            ],
            5 => [
                // BAB 5 ditetapkan oleh pemilik proyek: Analisis Novel (Buku Siswa Kelas XII Edisi Revisi 2025, Bab III).
                'title' => 'Analisis Novel',
                'slug' => 'bab-5-analisis-novel',
                'setting_location' => 'Kabupaten Pandeglang',
                'status' => 'published',
                'description' => 'Menganalisis novel bertema "Menciptakan Lingkungan Sekolah Aman dan Nyaman": cara pandang (sudut pandang) pengarang, tokoh dan perwatakan tiga dimensi, tahapan alur, hingga menyusun premis, kerangka, dan menulis penggalan novel dengan kalimat langsung/tidak langsung yang tepat. Latar 3D: Taman Literasi Pandeglang dengan latar Gunung Karang.',
                'zones' => [
                    'learning' => [
                        'name' => 'Taman Literasi & Pendopo Sastra Pandeglang',
                        'map_key' => 'pandeglang',
                        'area_key' => 'taman_literasi',
                        'description' => 'Zona Belajar & Latihan di Taman Literasi Pandeglang berlatar Gunung Karang.',
                        'theme' => ['sky' => '#c7d2fe', 'ground' => '#84cc16', 'accent' => '#7c3aed'],
                    ],
                    'practice' => [
                        'name' => 'Pojok Baca Alun-Alun Pandeglang',
                        'map_key' => 'pandeglang',
                        'area_key' => 'pojok_baca',
                        'description' => 'Area latihan analisis sudut pandang, perwatakan, dan alur novel.',
                        'theme' => ['sky' => '#c7d2fe', 'ground' => '#a3e635', 'accent' => '#8b5cf6'],
                    ],
                    'exam' => [
                        'name' => 'Pendopo Sastra Pandeglang (Ruang Ujian)',
                        'map_key' => 'pandeglang',
                        'area_key' => 'pendopo',
                        'description' => 'Zona ujian resmi BAB 5 di Kabupaten Pandeglang.',
                        'theme' => ['sky' => '#cbd5e1', 'ground' => '#64748b', 'accent' => '#0f172a'],
                    ],
                ],
                'materials' => [
                    [
                        'title' => 'Pengertian Novel dan Cara Pandang (Sudut Pandang) Pengarang',
                        'summary' => 'Memahami hakikat novel dan empat jenis sudut pandang pengarang beserta penandanya.',
                        'content' => "<h3>1. Pengertian Novel</h3><p><strong>Novel</strong> adalah karya fiksi berbentuk prosa panjang yang bersifat imajinatif, mengungkapkan unsur-unsur cerita secara lengkap, dan mengangkat permasalahan manusia serta kemasyarakatan (Rahayu, 2014; Hasniati, 2018). Contoh: seri <em>Bumi</em> karya Tere Liye, <em>Laskar Pelangi</em> karya Andrea Hirata, dan <em>Begitu Saja Kok Repot!</em> karya Umi Kulsum.</p><p>Tema pembelajaran BAB ini adalah <strong>Menciptakan Lingkungan Sekolah Aman dan Nyaman</strong>: melalui novel, kita belajar berempati, menolak perundungan, dan menghargai sesama.</p><h3>2. Cara Pandang Pengarang (Sudut Pandang)</h3><p>Sudut pandang adalah posisi atau cara pengarang menempatkan diri dalam menyampaikan cerita (Nurgiyantoro, 2018).</p><ol><li><strong>Orang Pertama</strong> — memakai kata ganti <em>aku/saya</em>; narator adalah tokoh di dalam cerita sehingga kesan yang muncul sangat personal.</li><li><strong>Orang Kedua</strong> — memakai kata ganti <em>kamu/engkau</em>; pembaca seolah-olah diajak menjadi tokoh (kesan interaktif).</li><li><strong>Orang Ketiga Serba Tahu</strong> — memakai <em>dia, ia, mereka,</em> atau nama tokoh; narator mengetahui pikiran dan perasaan <u>semua</u> tokoh.</li><li><strong>Orang Ketiga Terbatas</strong> — memakai <em>dia, ia,</em> atau nama tokoh; narator hanya menyelami pikiran dan perasaan <u>satu</u> tokoh utama (misalnya tokoh Maul dalam <em>Begitu Saja Kok Repot!</em>).</li></ol><h3>3. Tips Mengidentifikasi</h3><p>Perhatikan kata ganti yang dipakai narator dan apakah narator mampu mengungkap isi hati lebih dari satu tokoh.</p>",
                    ],
                    [
                        'title' => 'Tokoh, Perwatakan Tiga Dimensi, dan Tahapan Alur Novel',
                        'summary' => 'Menganalisis lima cara penggambaran watak, tiga dimensi tokoh, dan lima tahap pengembangan alur.',
                        'content' => "<h3>1. Tokoh Utama dan Tokoh Pendamping</h3><p><strong>Tokoh utama</strong> paling banyak diceritakan dan paling menentukan jalan cerita; <strong>tokoh pendamping</strong> mendukung perkembangan tokoh utama.</p><h3>2. Lima Cara Penggambaran Watak (Minderop, 2005)</h3><ol><li>Melalui <strong>ujaran/dialog</strong> tokoh.</li><li>Melalui <strong>tindakan/perilaku</strong> tokoh.</li><li>Melalui <strong>pikiran dan perasaan</strong> tokoh.</li><li>Melalui <strong>penilaian tokoh lain</strong>.</li><li>Melalui <strong>narasi langsung</strong> pengarang.</li></ol><h3>3. Tiga Dimensi Tokoh</h3><ul><li><strong>Dimensi Fisik</strong>: usia, postur, wajah, pakaian.</li><li><strong>Dimensi Internal (Psikologis)</strong>: watak batin, emosi, motivasi.</li><li><strong>Dimensi Eksternal (Sosiologis)</strong>: latar keluarga, pekerjaan, status sosial, budaya.</li></ul><h3>4. Lima Tahapan Pengembangan Alur</h3><ol><li><strong>Eksposisi</strong> — pengenalan tokoh, latar, dan situasi awal.</li><li><strong>Konflik Meningkat (<em>Rising Action</em>)</strong> — masalah mulai muncul dan berkembang.</li><li><strong>Klimaks</strong> — puncak ketegangan konflik.</li><li><strong>Penurunan Konflik (<em>Falling Action</em>)</strong> — upaya penyelesaian mulai tampak.</li><li><strong>Resolusi</strong> — penyelesaian/akhir cerita.</li></ol>",
                    ],
                    [
                        'title' => 'Menulis Novel: Premis, Kerangka, dan Kalimat Langsung-Tidak Langsung',
                        'summary' => 'Menyusun premis dan kerangka novel, menulis dialog dengan kaidah kalimat langsung/tidak langsung, serta memublikasikannya.',
                        'content' => "<h3>1. Premis</h3><p><strong>Premis</strong> adalah gagasan inti cerita yang dirumuskan dalam satu kalimat: <em>tokoh + konflik + arah penyelesaian</em>. Contoh: <em>\"Seorang siswa pendiam yang sering dirundung berani bersuara dan bersama sahabatnya membentuk duta antiperundungan di sekolah.\"</em></p><h3>2. Kerangka Novel</h3><p>Kerangka disusun mengikuti tahapan alur: eksposisi → konflik meningkat → klimaks → penurunan konflik → resolusi, lengkap dengan tokoh dan latar setiap bagian.</p><h3>3. Kalimat Langsung</h3><ul><li>Petikan tuturan diapit <strong>tanda petik dua</strong> (\"...\").</li><li>Tanda titik, koma, tanya, atau seru diletakkan <strong>di dalam</strong> tanda petik.</li><li>Petikan dipisahkan dengan <strong>koma</strong> dari kalimat pengiring. Contoh: <em>\"Kita harus melapor kepada wali kelas,\" kata Nara.</em></li><li>Huruf pertama petikan ditulis kapital.</li></ul><h3>4. Kalimat Tidak Langsung</h3><p>Tidak memakai tanda petik, kata ganti orang disesuaikan, dan biasanya memakai konjungsi <strong>bahwa, kalau, agar/untuk</strong>. Contoh: <em>Nara berkata bahwa mereka harus melapor kepada wali kelas.</em></p><h3>5. Publikasi</h3><p>Penggalan novel yang sudah disunting dapat dipublikasikan di mading, blog sekolah, atau platform menulis digital dengan tetap menjaga kesantunan dan orisinalitas karya.</p>",
                    ],
                ],
                'npcs' => [
                    [
                        'name' => 'Teh Wulan (Penulis Novel Pandeglang)',
                        'role_label' => 'Pemandu Sudut Pandang Pengarang',
                        'position' => [-6, 0, -4],
                        'color' => '#7c3aed',
                        'greeting' => 'Wilujeng sumping di Taman Literasi Pandeglang! Sebelum menganalisis novel, kenali dulu cara pandang pengarang: aku, kamu, atau dia?',
                    ],
                    [
                        'name' => 'Pak Raden (Kritikus Sastra)',
                        'role_label' => 'Pendamping Analisis Tokoh & Alur',
                        'position' => [0, 0, -5],
                        'color' => '#b45309',
                        'greeting' => 'Tokoh yang hidup punya tiga dimensi: fisik, internal, dan eksternal. Alur yang baik bergerak dari eksposisi sampai resolusi. Ayo kita bedah bersama!',
                    ],
                    [
                        'name' => 'Nara (Duta Antiperundungan)',
                        'role_label' => 'Siswa Penulis Muda',
                        'position' => [6, 0, -4],
                        'color' => '#db2777',
                        'greeting' => 'Aku sedang menulis novel tentang sekolah yang aman dan nyaman. Bantu aku menyusun premis dan menulis dialog dengan kalimat langsung yang benar, ya!',
                    ],
                ],
                'questions' => $this->generateQuestionsForChapter(5, 'Analisis Novel'),
            ],
            6 => [
                // BAB 6 ditetapkan oleh pemilik proyek: Surat Resmi dengan fokus Surat Kuasa (Buku Siswa Kelas XII Edisi Revisi 2025, Bab I).
                'title' => 'Surat Resmi dan Surat Kuasa',
                'slug' => 'bab-6-surat-resmi-dan-surat-kuasa',
                'setting_location' => 'SMAN 1 Ciruas, Kabupaten Serang',
                'status' => 'published',
                'description' => 'Mempelajari pengertian, jenis, struktur, dan kaidah kebahasaan surat resmi sesuai EYD Edisi V, dengan fokus utama menyusun Surat Kuasa yang lengkap dan benar: identitas pemberi dan penerima kuasa, isi pelimpahan wewenang, masa berlaku, hingga tanda tangan. Latar 3D: lingkungan SMAN 1 Ciruas, Kabupaten Serang.',
                'zones' => [
                    'learning' => [
                        'name' => 'Lingkungan SMAN 1 Ciruas (Gerbang, Lapangan Upacara & Ruang Tata Usaha)',
                        'map_key' => 'smancir',
                        'area_key' => 'gerbang_lapangan',
                        'description' => 'Zona Belajar & Latihan di miniatur 3D SMAN 1 Ciruas, Kabupaten Serang.',
                        'theme' => ['sky' => '#bae6fd', 'ground' => '#86efac', 'accent' => '#2563eb'],
                    ],
                    'practice' => [
                        'name' => 'Ruang Tata Usaha & Administrasi Surat SMAN 1 Ciruas',
                        'map_key' => 'smancir',
                        'area_key' => 'tata_usaha',
                        'description' => 'Area latihan menyusun dan menyunting surat resmi serta surat kuasa.',
                        'theme' => ['sky' => '#bae6fd', 'ground' => '#cbd5e1', 'accent' => '#0ea5e9'],
                    ],
                    'exam' => [
                        'name' => 'Aula Ujian SMAN 1 Ciruas',
                        'map_key' => 'smancir',
                        'area_key' => 'ruang_ujian',
                        'description' => 'Zona ujian resmi BAB 6 di SMAN 1 Ciruas.',
                        'theme' => ['sky' => '#cbd5e1', 'ground' => '#64748b', 'accent' => '#0f172a'],
                    ],
                ],
                'materials' => [
                    [
                        'title' => 'Pengertian, Jenis, dan Isi Surat Resmi',
                        'summary' => 'Mengenal jenis-jenis surat resmi, pokok isi ADIK SIMBA, makna tersurat-tersirat, dan cara menanggapi isi surat.',
                        'content' => "<h3>1. Pengertian Surat Resmi</h3><p><strong>Surat resmi</strong> adalah surat yang digunakan untuk kepentingan resmi/kedinasan, baik oleh instansi, organisasi, maupun perorangan, dengan bahasa baku dan format yang telah ditentukan.</p><h3>2. Jenis-Jenis Surat Resmi</h3><p>Surat dinas, surat undangan, surat edaran, surat perintah, <strong>surat kuasa</strong>, surat permohonan, surat keputusan, dan surat penawaran.</p><h3>3. Pokok Isi Surat: ADIK SIMBA</h3><p>Isi surat yang lengkap menjawab pertanyaan <strong>A</strong>pa, <strong>D</strong>i mana, <strong>K</strong>apan, <strong>Si</strong>apa, <strong>M</strong>engapa, dan <strong>Ba</strong>gaimana.</p><h3>4. Makna Tersurat dan Tersirat</h3><ul><li><strong>Tersurat</strong>: makna yang tertulis langsung dalam surat.</li><li><strong>Tersirat</strong>: makna yang tidak tertulis, tetapi dapat disimpulkan pembaca melalui membaca intensif.</li></ul><h3>5. Menanggapi Isi Surat</h3><p>Tanggapan dapat berupa <strong>kritik</strong>, <strong>pujian</strong>, atau <strong>saran</strong> yang disampaikan secara santun dan disertai alasan.</p>",
                    ],
                    [
                        'title' => 'Struktur, Bentuk, dan Kaidah Kebahasaan Surat Resmi',
                        'summary' => 'Memahami kepala-tubuh-kaki surat, lima bentuk surat, kalimat efektif, dan kaidah EYD Edisi V dalam surat.',
                        'content' => "<h3>1. Struktur Surat Resmi</h3><ol><li><strong>Kepala Surat</strong>: kop surat (logo, nama instansi, alamat, telepon, pos-el, laman); nomor, lampiran, dan hal; tanggal surat (tanpa nama kota jika sudah tercantum di kop); alamat tujuan diawali <em>Yth.</em> tanpa kata \"Kepada\" dan tanpa titik di akhir.</li><li><strong>Tubuh Surat</strong>: paragraf pembuka (salam dan maksud), isi (informasi utama), dan penutup (harapan/tindak lanjut dan ucapan terima kasih).</li><li><strong>Kaki Surat</strong>: jabatan, tanda tangan, nama lengkap, cap/stempel instansi, dan tembusan (jika ada).</li></ol><h3>2. Bentuk Surat</h3><p><em>Full block</em> (lurus penuh), <em>block</em> (lurus), <em>semi block</em> (setengah lurus), <em>indented</em> (lekuk), dan <em>hanging paragraph</em> (menggantung).</p><h3>3. Lima Ciri Kalimat Efektif (Sasangka, 2019)</h3><ol><li><strong>Lugas</strong> — langsung pada pokok persoalan.</li><li><strong>Tepat</strong> — tidak menimbulkan tafsir ganda.</li><li><strong>Jelas</strong> — unsur kalimat (S-P-O-K) lengkap.</li><li><strong>Hemat</strong> — tidak boros kata. Contoh salah: <em>para siswa-siswa</em>; benar: <em>para siswa</em>.</li><li><strong>Sejajar</strong> — bentuk kata yang dirinci paralel.</li></ol><h3>4. Kaidah EYD Edisi V dalam Surat</h3><ul><li>Singkatan bertitik: <em>Yth., dkk., hlm., No., S.H., M.Si.</em></li><li>Singkatan tanpa titik: <em>PT, KTP, RI, NIK</em>; lambang <em>kg, Rp</em> juga tanpa titik.</li><li>Tidak ada tanda titik di akhir tanggal surat dan alamat tujuan.</li><li>Huruf miring untuk istilah asing; huruf kapital untuk nama jabatan yang diikuti nama orang/instansi.</li></ul>",
                    ],
                    [
                        'title' => 'Fokus Utama: Menyusun Surat Kuasa yang Benar',
                        'summary' => 'Pengertian surat kuasa, pihak pemberi dan penerima kuasa, struktur lengkap, dan contoh surat kuasa OSIS.',
                        'content' => "<h3>1. Pengertian Surat Kuasa</h3><p><strong>Surat kuasa</strong> adalah surat resmi yang berisi <strong>pelimpahan atau pemberian wewenang</strong> dari seseorang/pejabat (<strong>pemberi kuasa</strong>) kepada pihak lain (<strong>penerima kuasa</strong>) untuk melakukan tindakan tertentu atas nama pemberi kuasa.</p><h3>2. Struktur Surat Kuasa</h3><ol><li><strong>Kop surat</strong> (untuk surat kuasa kedinasan/organisasi).</li><li><strong>Judul</strong> <em>SURAT KUASA</em> dan <strong>nomor surat</strong>.</li><li>Kalimat pengantar <em>\"Yang bertanda tangan di bawah ini:\"</em> dan <strong>identitas pemberi kuasa</strong> (nama, jabatan/NIK, alamat).</li><li>Pernyataan <em>\"Dengan ini memberikan kuasa kepada:\"</em> dan <strong>identitas penerima kuasa</strong>.</li><li><strong>Isi pelimpahan wewenang</strong> yang spesifik dan jelas (tidak multitafsir).</li><li><strong>Masa berlaku</strong> kuasa dan kalimat penutup.</li><li><strong>Tempat dan tanggal</strong> pembuatan surat.</li><li><strong>Tanda tangan</strong>: <em>Yang Menerima Kuasa</em> (kiri) dan <em>Yang Memberi Kuasa</em> (kanan, bermeterai bila menyangkut urusan hukum/perorangan), serta <em>Mengetahui</em> bila diperlukan.</li></ol><h3>3. Contoh Ringkas (Organisasi Sekolah)</h3><blockquote><p><strong>SURAT KUASA</strong><br>Nomor: 07/OSIS-SMANCIR/X/2026</p><p>Yang bertanda tangan di bawah ini:<br>nama : Rizky Pratama<br>jabatan : Ketua OSIS SMAN 1 Ciruas</p><p>Dengan ini memberikan kuasa kepada:<br>nama : Salsa Aulia<br>jabatan : Wakil Ketua OSIS SMAN 1 Ciruas</p><p>untuk memimpin rapat persiapan Latihan Dasar Kepemimpinan Siswa (LDKS) pada hari Sabtu, 14 November 2026, di Aula SMAN 1 Ciruas. Surat kuasa ini berlaku hanya untuk kegiatan tersebut.</p><p>Demikian surat kuasa ini dibuat untuk dipergunakan sebagaimana mestinya.</p><p>Serang, 10 November 2026<br>Yang Menerima Kuasa, &nbsp;&nbsp;&nbsp; Yang Memberi Kuasa,<br>Salsa Aulia &nbsp;&nbsp;&nbsp; Rizky Pratama</p></blockquote><h3>4. Kesalahan yang Sering Terjadi</h3><ul><li>Isi wewenang terlalu umum, misalnya \"mengurus semua keperluan saya\".</li><li>Tidak mencantumkan masa berlaku.</li><li>Posisi tanda tangan pemberi dan penerima kuasa tertukar.</li></ul>",
                    ],
                ],
                'npcs' => [
                    [
                        'name' => 'Pak Bangkit (Guru Bahasa Indonesia)',
                        'role_label' => 'Guru Pembimbing Surat Resmi SMAN 1 Ciruas',
                        'position' => [-6, 0, -4],
                        'color' => '#2563eb',
                        'greeting' => 'Selamat datang di SMAN 1 Ciruas! Surat resmi dipakai di mana-mana: undangan, edaran, permohonan, sampai surat kuasa. Mari kita mulai dari jenis dan pokok isinya, ADIK SIMBA!',
                    ],
                    [
                        'name' => 'Bu Rina (Kepala Tata Usaha)',
                        'role_label' => 'Pengelola Administrasi Surat Sekolah',
                        'position' => [0, 0, -5],
                        'color' => '#0d9488',
                        'greeting' => 'Setiap hari Ruang TU menerima dan mengirim surat. Perhatikan kop, nomor, hal, alamat Yth. tanpa titik, dan kalimat yang efektif sesuai EYD Edisi V.',
                    ],
                    [
                        'name' => 'Rizky (Ketua OSIS)',
                        'role_label' => 'Ketua OSIS SMAN 1 Ciruas',
                        'position' => [6, 0, -4],
                        'color' => '#dc2626',
                        'greeting' => 'Aku berhalangan memimpin rapat LDKS, jadi aku harus membuat surat kuasa untuk wakilku. Bantu aku menyusunnya dengan struktur yang benar, ya!',
                    ],
                ],
                'questions' => $this->generateQuestionsForChapter(6, 'Surat Resmi dan Surat Kuasa'),
            ],
        ];

        foreach ($definitions as $num => $def) {
            $chapter = Chapter::updateOrCreate(
                ['number' => $num],
                [
                    'title' => $def['title'],
                    'slug' => $def['slug'],
                    'description' => $def['description'],
                    'setting_location' => $def['setting_location'],
                    'kkm' => 75,
                    'order' => $num,
                    'status' => $def['status'],
                    'created_by' => $teacherId,
                ]
            );

            $createdZones = [];
            foreach ($def['zones'] as $type => $zData) {
                $createdZones[$type] = Zone::updateOrCreate(
                    ['chapter_id' => $chapter->id, 'type' => $type],
                    [
                        'name' => $zData['name'],
                        'description' => $zData['description'],
                        'map_key' => $zData['map_key'],
                        'area_key' => $zData['area_key'],
                        'config' => [
                            'theme' => $zData['theme'],
                            'spawn' => ['position' => [0, 0, 8], 'rotationY' => 3.14],
                        ],
                        'is_active' => true,
                    ]
                );
            }

            $createdMaterials = [];
            foreach ($def['materials'] as $idx => $mData) {
                $createdMaterials[] = Material::updateOrCreate(
                    ['chapter_id' => $chapter->id, 'slug' => Str::slug($mData['title'])],
                    [
                        'title' => $mData['title'],
                        'summary' => $mData['summary'],
                        'content' => $mData['content'],
                        'order' => $idx + 1,
                        'is_required' => true,
                        'status' => 'published',
                    ]
                );
            }

            $learningZone = $createdZones['learning'];
            $stationCoords = [
                0 => ['board' => [-18, 0, -10], 'npc' => [-15, 0, -10]],
                1 => ['board' => [0, 0, -22],   'npc' => [-3, 0, -22]],
                2 => ['board' => [18, 0, -10],  'npc' => [15, 0, -10]],
            ];

            foreach ($def['npcs'] as $idx => $npcData) {
                $npcPos = $stationCoords[$idx % 3]['npc'] ?? $npcData['position'];
                $npc = Npc::updateOrCreate(
                    ['zone_id' => $learningZone->id, 'name' => $npcData['name']],
                    [
                        'role_label' => $npcData['role_label'],
                        'appearance' => ['shirtColor' => $npcData['color'], 'skinColor' => '#fde68a'],
                        'position' => $npcPos,
                        'rotation_y' => 0,
                        'greeting' => $npcData['greeting'],
                    ]
                );

                $linkedMaterial = $createdMaterials[$idx] ?? ($createdMaterials[0] ?? null);
                Dialogue::updateOrCreate(
                    ['npc_id' => $npc->id, 'key' => 'default'],
                    [
                        'nodes' => [
                            [
                                'id' => 'start',
                                'speaker' => $npc->name,
                                'text' => $npcData['greeting'],
                                'actions' => $linkedMaterial
                                    ? [['type' => 'open_material', 'material_id' => $linkedMaterial->id]]
                                    : [],
                            ],
                        ],
                    ]
                );
            }

            foreach ($createdMaterials as $idx => $mat) {
                $boardPos = $stationCoords[$idx % 3]['board'] ?? [($idx - 1) * 12, 0, -12];
                Interactable::updateOrCreate(
                    ['zone_id' => $learningZone->id, 'label' => 'Papan Materi: '.$mat->title],
                    [
                        'type' => 'board',
                        'position' => $boardPos,
                        'model_key' => 'board',
                        'material_id' => $mat->id,
                        'action' => ['type' => 'open_material', 'material_id' => $mat->id],
                    ]
                );
            }

            if (! empty($createdMaterials)) {
                $mission = Mission::updateOrCreate(
                    ['chapter_id' => $chapter->id, 'order' => 1],
                    [
                        'zone_id' => $learningZone->id,
                        'title' => 'Misi Eksplorasi BAB '.$num.': '.$chapter->title,
                        'description' => 'Temui para NPC pemateri di peta 3D dan pelajari seluruh materi wajib hingga tuntas.',
                        'is_required' => true,
                        'reward_xp' => 100,
                    ]
                );

                foreach ($createdMaterials as $idx => $mat) {
                    MissionStep::updateOrCreate(
                        ['mission_id' => $mission->id, 'order' => $idx + 1],
                        [
                            'type' => 'read_material',
                            'target_ref' => ['material_id' => $mat->id],
                            'description' => 'Pelajari materi: '.$mat->title,
                        ]
                    );
                }
            }

            PracticeConfig::updateOrCreate(
                ['chapter_id' => $chapter->id],
                [
                    'question_count' => 10,
                    'shuffle_options' => true,
                    'is_active' => $def['status'] === 'published',
                ]
            );

            if (! empty($def['questions'])) {
                foreach ($def['questions'] as $qIndex => $qData) {
                    $question = Question::updateOrCreate(
                        [
                            'chapter_id' => $chapter->id,
                            'stem' => $qData['stem'],
                        ],
                        [
                            'material_id' => $createdMaterials[$qIndex % count($createdMaterials)]->id ?? null,
                            'difficulty' => $qIndex < 4 ? 'easy' : ($qIndex < 8 ? 'medium' : 'hard'),
                            'category' => $chapter->title,
                            'explanation' => $qData['explanation'],
                            'source' => 'manual',
                            'status' => 'published',
                            'created_by' => $teacherId,
                        ]
                    );

                    foreach ($qData['options'] as $label => $optText) {
                        QuestionOption::updateOrCreate(
                            ['question_id' => $question->id, 'label' => $label],
                            [
                                'text' => $optText,
                                'is_correct' => $label === $qData['correct'],
                            ]
                        );
                    }
                }

                $exam = Exam::updateOrCreate(
                    ['chapter_id' => $chapter->id, 'title' => 'Ujian Resmi BAB '.$num.': '.$chapter->title],
                    [
                        'question_count' => 10,
                        'selection_mode' => 'random',
                        'duration_minutes' => 45,
                        'starts_at' => now()->subDay(),
                        'ends_at' => now()->addMonths(6),
                        'shuffle_questions' => true,
                        'shuffle_options' => true,
                        'max_attempts' => 1,
                        'show_review_after' => 'after_submit',
                        'is_active' => true,
                        'created_by' => $teacherId,
                    ]
                );

                if ($classes->isNotEmpty()) {
                    $exam->schoolClasses()->sync($classes->pluck('id')->all());
                }
            }
        }
    }

    protected function generateQuestionsForChapter(int $babNumber, string $topicTitle): array
    {
        if ($babNumber === 2) {
            return [
                [
                    'stem' => 'Tujuan utama dari penyusunan teks prosedur adalah...',
                    'options' => [
                        'A' => 'Memberikan panduan langkah-langkah secara berurutan agar pembaca dapat melakukan atau membuat sesuatu dengan tepat.',
                        'B' => 'Menghibur pembaca melalui kisah imajinatif tokoh.',
                        'C' => 'Mempengaruhi pembaca agar membeli produk komersial.',
                        'D' => 'Menggambarkan keindahan suatu objek wisata secara rinci.',
                        'E' => 'Menyampaikan kritik terhadap kebijakan publik.',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Teks prosedur bertujuan memandu pembaca melakukan suatu aktivitas atau membuat sesuatu melalui langkah-langkah sistematis.',
                ],
                [
                    'stem' => 'Perbedaan paling mendasar antara teks prosedur sederhana dan teks prosedur kompleks terletak pada...',
                    'options' => [
                        'A' => 'Jumlah langkah serta adanya sub-langkah atau syarat percabangan kondisi pada prosedur kompleks.',
                        'B' => 'Penggunaan bahasa daerah di dalam prosedur kompleks.',
                        'C' => 'Tidak adanya tujuan pada prosedur sederhana.',
                        'D' => 'Prosedur kompleks hanya boleh dibaca oleh ahli teknologi.',
                        'E' => 'Prosedur sederhana wajib terdiri atas minimal 25 langkah.',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Teks prosedur sederhana hanya terdiri atas beberapa langkah singkat, sedangkan prosedur kompleks memiliki banyak tahapan, sub-langkah, dan kondisi percabangan.',
                ],
                [
                    'stem' => 'Manakah di bawah ini yang termasuk contoh kalimat imperatif (perintah) dalam teks prosedur?',
                    'options' => [
                        'A' => 'Apakah Anda sudah mengunduh formulir pendaftaran?',
                        'B' => 'Masukkan nomor induk kependudukan dengan benar lalu tekan tombol simpan!',
                        'C' => 'Sejak kemarin layanan pendaftaran daring sangat ramai.',
                        'D' => 'Banyak siswa yang berkunjung ke Masjid Agung Banten Lama.',
                        'E' => 'Mengapa langkah-langkah ini harus dilakukan secara berurutan?',
                    ],
                    'correct' => 'B',
                    'explanation' => 'Kalimat imperatif berisi perintah atau instruksi untuk melakukan sesuatu, ditandai verba perintah seperti "Masukkan..." dan "tekan...".',
                ],
                [
                    'stem' => 'Kata penghubung seperti "pertama", "kemudian", "selanjutnya", dan "setelah itu" dalam teks prosedur disebut...',
                    'options' => [
                        'A' => 'Konjungsi pertentangan',
                        'B' => 'Konjungsi temporal (urutan waktu)',
                        'C' => 'Konjungsi kausalitas',
                        'D' => 'Konjungsi pemilihan',
                        'E' => 'Konjungsi konsesif',
                    ],
                    'correct' => 'B',
                    'explanation' => 'Konjungsi temporal menyatakan urutan waktu atau tahapan kegiatan secara kronologis.',
                ],
                [
                    'stem' => 'Kata kerja yang mengacu pada tindakan fisik yang dapat dilihat secara nyata seperti "menggunting", "menempelkan", dan "mencetak" disebut...',
                    'options' => [
                        'A' => 'Verba mental',
                        'B' => 'Verba material',
                        'C' => 'Verba relasional',
                        'D' => 'Nomina abstrak',
                        'E' => 'Adjektiva',
                    ],
                    'correct' => 'B',
                    'explanation' => 'Verba material adalah kata kerja yang menunjukkan aktivitas fisik yang dilakukan oleh partisipan.',
                ],
                [
                    'stem' => 'Urutan struktur teks prosedur yang tepat dan lengkap adalah...',
                    'options' => [
                        'A' => 'Abstraksi – Orientasi – Krisis – Reaksi – Koda',
                        'B' => 'Tujuan – Material (Alat/Bahan) – Langkah-Langkah – Penegasan Ulang',
                        'C' => 'Tesis – Argumentasi – Penegasan Ulang',
                        'D' => 'Pernyataan Umum – Deretan Penjelas – Interpretasi',
                        'E' => 'Orientasi – Komplikasi – Evaluasi – Resolusi',
                    ],
                    'correct' => 'B',
                    'explanation' => 'Struktur teks prosedur terdiri atas Tujuan, Material (opsional sesuai jenis prosedur), Langkah-Langkah, dan Penegasan Ulang/Penutup.',
                ],
                [
                    'stem' => 'Perhatikan kalimat berikut: "Jika berkas sudah terverifikasi, unduh kartu peserta; jika belum lengkap, perbaiki dokumen yang ditolak." Kalimat tersebut menunjukkan ciri teks prosedur kompleks berupa...',
                    'options' => [
                        'A' => 'Kalimat interogatif',
                        'B' => 'Konjungsi syarat/kondisi percabangan',
                        'C' => 'Majas hiperbola',
                        'D' => 'Kalimat pasif intransitif',
                        'E' => 'Ungkapan idiomatik',
                    ],
                    'correct' => 'B',
                    'explanation' => 'Penggunaan kata "Jika..." menunjukkan syarat atau kondisi percabangan langkah yang menjadi ciri khas teks prosedur kompleks.',
                ],
                [
                    'stem' => 'Apa akibatnya apabila urutan langkah dalam teks prosedur kompleks diubah secara acak?',
                    'options' => [
                        'A' => 'Tujuan prosedur tetap tercapai lebih cepat.',
                        'B' => 'Proses kegiatan dapat gagal atau tidak mencapai hasil yang diharapkan.',
                        'C' => 'Teks menjadi lebih indah seperti puisi.',
                        'D' => 'Jumlah alat dan bahan otomatis berkurang.',
                        'E' => 'Kalimat imperatif berubah menjadi kalimat tanya.',
                    ],
                    'correct' => 'B',
                    'explanation' => 'Langkah-langkah dalam teks prosedur bersifat kronologis dan bersyarat sehingga tidak dapat dibalik sembarangan.',
                ],
                [
                    'stem' => 'Bagian penutup dalam teks prosedur yang berisi harapan atau manfaat apabila prosedur dijalankan dengan benar disebut...',
                    'options' => [
                        'A' => 'Orientasi',
                        'B' => 'Penegasan Ulang',
                        'C' => 'Abstraksi',
                        'D' => 'Koda',
                        'E' => 'Stimulus',
                    ],
                    'correct' => 'B',
                    'explanation' => 'Penegasan ulang terletak di akhir teks prosedur untuk menegaskan manfaat atau simpulan dari tahapan yang telah dijelaskan.',
                ],
                [
                    'stem' => 'Manakah kalimat berikut yang mengandung verba tingkah laku?',
                    'options' => [
                        'A' => 'Potong kertas menjadi empat bagian sama besar.',
                        'B' => 'Pastikan seluruh data yang Anda ketik sudah sesuai dengan ijazah asli.',
                        'C' => 'Tuangkan air hangat ke dalam wadah secara perlahan.',
                        'D' => 'Tempelkan meterai pada kolom tanda tangan.',
                        'E' => 'Lipat bagian tepi amplop hingga rapi.',
                    ],
                    'correct' => 'B',
                    'explanation' => 'Kata "Pastikan" merupakan verba tingkah laku (sikap/mental), sedangkan memotong, menuangkan, menempelkan, dan melipat adalah verba material (fisik).',
                ],
            ];
        }

        if ($babNumber === 3) {
            return [
                [
                    'stem' => 'Teks eksplanasi kompleks adalah teks yang bertujuan untuk...',
                    'options' => [
                        'A' => 'Menjelaskan proses terjadinya suatu fenomena alam, sosial, atau teknologi melalui hubungan sebab-akibat dan kronologis.',
                        'B' => 'Menceritakan pengalaman liburan pribadi penulis.',
                        'C' => 'Memberikan instruksi cara memasak makanan tradisional.',
                        'D' => 'Menawarkan barang dagangan kepada konsumen.',
                        'E' => 'Menyajikan dialog drama antar tokoh di panggung.',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Teks eksplanasi kompleks memaparkan proses "mengapa" dan "bagaimana" suatu fenomena terjadi secara ilmiah.',
                ],
                [
                    'stem' => 'Struktur utama teks eksplanasi kompleks secara berurutan terdiri atas...',
                    'options' => [
                        'A' => 'Pernyataan Umum (Identifikasi Fenomena) – Deretan Penjelas (Rangkaian Kejadian) – Interpretasi (Ulasan)',
                        'B' => 'Tujuan – Langkah-Langkah – Penegasan Ulang',
                        'C' => 'Tesis – Argumentasi – Rekomendasi',
                        'D' => 'Orientasi – Komplikasi – Resolusi',
                        'E' => 'Pembuka – Isi Surat – Penutup Surat',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Struktur teks eksplanasi meliputi Pernyataan Umum, Deretan Penjelas (sebab-akibat/kronologis), dan Interpretasi.',
                ],
                [
                    'stem' => 'Dalam pemanfaatan Artificial Intelligence (AI), instruksi teks yang diberikan pengguna kepada model AI untuk menghasilkan respons tertentu disebut...',
                    'options' => [
                        'A' => 'Prompt',
                        'B' => 'Hardware',
                        'C' => 'Firewall',
                        'D' => 'Spreadsheet',
                        'E' => 'Browser',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Prompt adalah instruksi atau perintah teks yang dimasukkan pengguna ke sistem AI generatif.',
                ],
                [
                    'stem' => 'Agar menghasilkan jawaban AI yang akurat dan relevan, teknik penyusunan prompt yang efektif sebaiknya memuat unsur...',
                    'options' => [
                        'A' => 'Peran (Role), Konteks, Tugas Spesifik, dan Format Output yang diinginkan.',
                        'B' => 'Satu kata singkat tanpa penjelasan konteks apa pun.',
                        'C' => 'Kata sandi akun pribadi dan nomor rekening.',
                        'D' => 'Kalimat yang sengaja dibuat ambigu dan membingungkan.',
                        'E' => 'Tanda baca seru sebanyak-banyaknya.',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Prompt efektif memberikan konteks, peran, instruksi spesifik, dan batasan format keluaran secara jelas.',
                ],
                [
                    'stem' => 'Perhatikan kalimat berikut: "Perkembangan model bahasa besar (LLM) sangat pesat sehingga banyak industri mengintegrasikan AI ke dalam layanan pelanggan." Konjungsi "sehingga" pada kalimat tersebut menyatakan hubungan...',
                    'options' => [
                        'A' => 'Kausalitas (sebab-akibat)',
                        'B' => 'Pertentangan',
                        'C' => 'Pemilihan',
                        'D' => 'Perbandingan',
                        'E' => 'Harapan',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Kata "sehingga" merupakan konjungsi kausalitas yang menunjukkan akibat dari suatu peristiwa.',
                ],
                [
                    'stem' => 'Sikap etis yang wajib diterapkan siswa SMA saat menggunakan AI dalam pembelajaran adalah...',
                    'options' => [
                        'A' => 'Menyalin seluruh hasil AI tanpa membaca dan mengklaimnya sebagai karya sendiri.',
                        'B' => 'Menggunakan AI sebagai mitra belajar, memverifikasi kebenaran faktanya, dan tetap menulis dengan pemahaman sendiri.',
                        'C' => 'Membuat berita bohong (hoaks) menggunakan generator AI.',
                        'D' => 'Membagikan data pribadi teman sekelas ke platform AI publik.',
                        'E' => 'Menggunakan AI untuk mencurangi ujian resmi.',
                    ],
                    'correct' => 'B',
                    'explanation' => 'Etika penggunaan AI menuntut kejujuran akademik, berpikir kritis melakukan verifikasi fakta, dan menjaga privasi data.',
                ],
                [
                    'stem' => 'Bagian struktur teks eksplanasi yang berisi rincian proses mengapa dan bagaimana fenomena Artificial Intelligence dapat mengenali pola data adalah...',
                    'options' => [
                        'A' => 'Deretan Penjelas (Rangkaian Kejadian)',
                        'B' => 'Judul Karangan',
                        'C' => 'Daftar Pustaka',
                        'D' => 'Lampiran Surat',
                        'E' => 'Koda',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Deretan penjelas menguraikan tahapan proses dan hubungan sebab-akibat fenomena yang dibahas.',
                ],
                [
                    'stem' => 'Kata-kata seperti "algoritma", "jaringan saraf tiruan", "komputasi", dan "data latih" dalam teks eksplanasi tentang AI merupakan kaidah kebahasaan berupa...',
                    'options' => [
                        'A' => 'Istilah teknis / ilmiah sesuai bidang',
                        'B' => 'Kata sapaan kekerabatan',
                        'C' => 'Majas personifikasi',
                        'D' => 'Kata kerja imperatif',
                        'E' => 'Bahasa prokem',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Teks eksplanasi banyak menggunakan istilah teknis atau ilmiah yang sesuai dengan topik fenomena.',
                ],
                [
                    'stem' => 'Risiko ketika model AI menghasilkan informasi yang terdengar meyakinkan tetapi secara faktual salah atau dikarang disebut fenomena...',
                    'options' => [
                        'A' => 'Halusinasi AI (AI Hallucination)',
                        'B' => 'Kompresi File',
                        'C' => 'Instalasi Sistem',
                        'D' => 'Enkripsi Data',
                        'E' => 'Sinkronisasi Waktu',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Halusinasi AI adalah kondisi ketika AI menghasilkan klaim atau referensi yang tidak sesuai fakta nyata.',
                ],
                [
                    'stem' => 'Manakah kalimat di bawah ini yang menggunakan konjungsi kausalitas (sebab-akibat)?',
                    'options' => [
                        'A' => 'Oleh karena data latihnya sangat beragam, sistem AI tersebut mampu mengenali berbagai aksen bahasa.',
                        'B' => 'Pertama-tama nyalakan komputer, lalu buka peramban web.',
                        'C' => 'Baik siswa maupun guru hadir di ruang laboratorium.',
                        'D' => 'Gedung itu tinggi, sedangkan bangunan di sebelahnya rendah.',
                        'E' => 'Apakah kamu sudah membaca artikel tentang teknologi baru?',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Konjungsi "Oleh karena..." menghubungkan sebab (data latih beragam) dan akibat (mampu mengenali berbagai aksen).',
                ],
            ];
        }

        if ($babNumber === 4) {
            return [
                [
                    'stem' => 'Pengertian kearifan lokal yang paling tepat adalah...',
                    'options' => [
                        'A' => 'Nilai-nilai luhur, pengetahuan, dan tradisi bijaksana masyarakat setempat dalam menjaga keharmonisan hidup bersama alam dan sesama.',
                        'B' => 'Budaya asing yang masuk melalui media sosial tanpa penyaringan.',
                        'C' => 'Aturan perusahaan industri modern di kota besar.',
                        'D' => 'Kebiasaan konsumtif membeli barang-barang mewah.',
                        'E' => 'Teknologi impor yang menggantikan seluruh tradisi daerah.',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Kearifan lokal adalah pandangan hidup dan nilai luhur masyarakat lokal yang teruji dalam menjaga harmoni sosial dan lingkungan.',
                ],
                [
                    'stem' => 'Bangunan tradisional masyarakat Baduy di Kabupaten Lebak yang berfungsi menyimpan padi guna menjaga ketahanan pangan jangka panjang disebut...',
                    'options' => [
                        'A' => 'Leuit',
                        'B' => 'Gapura',
                        'C' => 'Pendopo',
                        'D' => 'Menara',
                        'E' => 'Dermaga',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Leuit adalah lumbung padi tradisional masyarakat Baduy/Banten yang melambangkan kemandirian dan ketahanan pangan.',
                ],
                [
                    'stem' => 'Manakah di bawah ini yang merupakan kalimat FAKTA?',
                    'options' => [
                        'A' => 'Kawasan permukiman masyarakat Baduy secara administratif terletak di Desa Kanekes, Kecamatan Leuwidamar, Kabupaten Lebak, Provinsi Banten.',
                        'B' => 'Menurut saya, suasana alam di Kabupaten Lebak adalah yang paling menenangkan di dunia.',
                        'C' => 'Sebaiknya pemerintah daerah menambah festival budaya setiap akhir pekan.',
                        'D' => 'Kain tenun tersebut terlihat sangat indah jika dipadukan dengan jaket modern.',
                        'E' => 'Mungkin tahun depan jumlah wisatawan akan meningkat dua kali lipat.',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Kalimat A memuat data geografis dan administratif yang objektif serta dapat diverifikasi kebenarannya.',
                ],
                [
                    'stem' => 'Manakah di bawah ini yang merupakan kalimat OPINI?',
                    'options' => [
                        'A' => 'Generasi muda sebaiknya lebih aktif mendokumentasikan kearifan lokal agar tidak terlupakan.',
                        'B' => 'Kabupaten Lebak merupakan salah satu kabupaten di Provinsi Banten.',
                        'C' => 'Ibu kota Kabupaten Lebak berada di Rangkasbitung.',
                        'D' => 'Bahasa Sunda dialek Banten digunakan oleh sebagian masyarakat di wilayah selatan Banten.',
                        'E' => 'Leuit digunakan oleh masyarakat Kanekes untuk menyimpan hasil panen padi huma.',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Kata "sebaiknya" menunjukkan saran atau pendapat subjektif penulis (opini).',
                ],
                [
                    'stem' => 'Nilai kearifan lokal masyarakat Baduy dalam membagi kawasan hutan menjadi hutan larangan (titipan) yang tidak boleh dirusak memberikan pelajaran penting tentang...',
                    'options' => [
                        'A' => 'Pelestarian ekosistem alam dan konservasi sumber daya air bagi kehidupan.',
                        'B' => 'Eksploitasi kayu hutan secara besar-besaran.',
                        'C' => 'Pembangunan gedung pencakar langit di tengah hutan.',
                        'D' => 'Penggunaan bahan kimia sintetis di sungai.',
                        'E' => 'Pengabaian kelestarian lingkungan demi keuntungan sesaat.',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Tradisi menjaga hutan larangan merupakan wujud nyata konservasi ekologis yang menjaga keseimbangan alam dan mata air.',
                ],
                [
                    'stem' => 'Sikap yang tepat dan santun ketika mempelajari atau berkunjung ke kawasan budaya tradisional seperti Baduy adalah...',
                    'options' => [
                        'A' => 'Menghormati aturan adat setempat, menjaga kebersihan alam, dan bertutur kata santun.',
                        'B' => 'Melanggar larangan adat demi membuat konten media sosial.',
                        'C' => 'Membuang sampah plastik sembarangan di sungai.',
                        'D' => 'Memandang rendah tradisi lokal yang berbeda dengan kehidupan kota.',
                        'E' => 'Mengambil foto di wilayah yang dilarang secara adat.',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Menghormati aturan adat, kesantunan, dan menjaga kelestarian lingkungan adalah sikap mutlak dalam menghargai kearifan lokal.',
                ],
                [
                    'stem' => 'Ciri penanda bahasa pada kalimat opini adalah adanya kata-kata yang bersifat subjektif seperti...',
                    'options' => [
                        'A' => 'seharusnya, menurut pendapat saya, sangat mengagumkan, diperkirakan',
                        'B' => 'berdasarkan data BPS tahun 2025, tercatat sebanyak, terletak di',
                        'C' => 'pada tanggal 17 Agustus 1945, pukul 10.00 WIB',
                        'D' => 'berjarak 40 kilometer, memiliki luas 5.136 hektare',
                        'E' => 'terdiri atas tiga kecamatan, disahkan melalui peraturan nomor',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Kata "seharusnya", "menurut pendapat saya", dan penilaian subjektif menandai kalimat opini.',
                ],
                [
                    'stem' => 'Upaya nyata yang dapat dilakukan siswa SMA untuk melestarikan kearifan lokal melalui keterampilan berbahasa Indonesia adalah...',
                    'options' => [
                        'A' => 'Menulis artikel, esai, atau konten edukatif yang santun dan faktual mengenai nilai-nilai budaya lokal daerahnya.',
                        'B' => 'Menyebarkan informasi yang belum terverifikasi tentang tradisi daerah.',
                        'C' => 'Melupakan bahasa dan budaya daerah sama sekali.',
                        'D' => 'Menjiplak tulisan orang lain tanpa mencantumkan sumber.',
                        'E' => 'Menggunakan bahasa yang merendahkan budaya tradisional.',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Menulis karya literasi yang faktual, santun, dan edukatif membantu memperkenalkan serta melestarikan kearifan lokal.',
                ],
                [
                    'stem' => 'Tradisi bekerja bersama-sama membangun rumah atau jembatan bambu secara sukarela dalam masyarakat tradisional mencerminkan nilai...',
                    'options' => [
                        'A' => 'Gotong royong dan solidaritas sosial',
                        'B' => 'Individualisme',
                        'C' => 'Materialisme',
                        'D' => 'Kompetisi bebas',
                        'E' => 'Egoisme kelompok',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Bekerja bersama untuk kepentingan bersama merupakan wujud nilai gotong royong dan kebersamaan.',
                ],
                [
                    'stem' => 'Dalam menyusun teks tentang kearifan lokal, mengapa penulis perlu menggabungkan data fakta yang akurat dengan argumen yang santun?',
                    'options' => [
                        'A' => 'Agar tulisan dapat dipercaya kebenarannya sekaligus menghormati martabat budaya yang dibahas.',
                        'B' => 'Agar jumlah halaman tulisan menjadi sangat tebal.',
                        'C' => 'Supaya pembaca bingung membedakan fakta dan khayalan.',
                        'D' => 'Untuk menggantikan seluruh buku sejarah di perpustakaan.',
                        'E' => 'Agar tidak perlu memperhatikan kaidah ejaan Bahasa Indonesia.',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Fakta yang akurat membangun kredibilitas tulisan, sedangkan bahasa yang santun menjaga penghormatan terhadap nilai budaya.',
                ],
            ];
        }

        if ($babNumber === 5) {
            // BAB 5 — Analisis Novel (Buku Siswa Kelas XII Edisi Revisi 2025, Bab III)
            return [
                [
                    'stem' => 'Novel adalah karya fiksi berbentuk prosa panjang yang bersifat imajinatif. Ciri yang membedakan novel dari cerpen adalah...',
                    'options' => [
                        'A' => 'Novel mengungkapkan unsur-unsur cerita secara lebih lengkap dan konflik tokohnya berkembang lebih kompleks.',
                        'B' => 'Novel selalu ditulis dalam bentuk bait dan rima.',
                        'C' => 'Novel tidak memiliki tokoh dan latar.',
                        'D' => 'Novel hanya berisi langkah-langkah melakukan sesuatu.',
                        'E' => 'Novel wajib berdasarkan data statistik resmi.',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Novel adalah prosa panjang yang mengungkapkan unsur cerita secara lengkap serta permasalahan manusia dan kemasyarakatan secara lebih kompleks dibanding cerpen.',
                ],
                [
                    'stem' => 'Perhatikan kutipan berikut: "Aku menunduk ketika mereka tertawa di belakang kelas. Aku ingin bersuara, tetapi lidahku kelu." Sudut pandang yang digunakan pengarang adalah...',
                    'options' => [
                        'A' => 'Orang pertama',
                        'B' => 'Orang kedua',
                        'C' => 'Orang ketiga serba tahu',
                        'D' => 'Orang ketiga terbatas',
                        'E' => 'Campuran orang kedua dan ketiga',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Kata ganti "aku" menunjukkan narator adalah tokoh di dalam cerita, yaitu sudut pandang orang pertama yang memberi kesan personal.',
                ],
                [
                    'stem' => 'Sudut pandang yang menempatkan narator mengetahui pikiran dan perasaan SEMUA tokoh dalam cerita disebut...',
                    'options' => [
                        'A' => 'Orang ketiga serba tahu',
                        'B' => 'Orang ketiga terbatas',
                        'C' => 'Orang pertama pelaku sampingan',
                        'D' => 'Orang kedua',
                        'E' => 'Orang pertama pelaku utama',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Pada sudut pandang orang ketiga serba tahu, narator memakai dia/ia/nama tokoh dan mengetahui isi hati semua tokoh.',
                ],
                [
                    'stem' => 'Penggunaan kata ganti "kamu" atau "engkau" sehingga pembaca seolah-olah diajak menjadi tokoh dalam cerita merupakan ciri sudut pandang...',
                    'options' => [
                        'A' => 'Orang kedua',
                        'B' => 'Orang pertama',
                        'C' => 'Orang ketiga serba tahu',
                        'D' => 'Orang ketiga terbatas',
                        'E' => 'Pengamat objektif',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Sudut pandang orang kedua memakai kata ganti kamu/engkau dan menimbulkan kesan interaktif dengan pembaca.',
                ],
                [
                    'stem' => 'Deskripsi "Laras berusia tujuh belas tahun, bertubuh mungil, dan selalu mengenakan kerudung biru" menggambarkan tokoh dari dimensi...',
                    'options' => [
                        'A' => 'Fisik',
                        'B' => 'Internal (psikologis)',
                        'C' => 'Eksternal (sosiologis)',
                        'D' => 'Religius',
                        'E' => 'Ekonomi',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Usia, postur tubuh, wajah, dan pakaian merupakan dimensi fisik tokoh.',
                ],
                [
                    'stem' => 'Perhatikan kutipan: "Dimas memang pendiam, tetapi dialah yang paling dulu menolong kalau ada teman yang kesulitan," ujar Bu Rahma. Teknik penggambaran watak Dimas pada kutipan tersebut adalah melalui...',
                    'options' => [
                        'A' => 'Penilaian tokoh lain',
                        'B' => 'Narasi langsung pengarang',
                        'C' => 'Pikiran tokoh itu sendiri',
                        'D' => 'Deskripsi latar tempat',
                        'E' => 'Tindakan tokoh Dimas secara langsung',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Watak Dimas diungkapkan melalui ucapan/penilaian tokoh lain, yaitu Bu Rahma.',
                ],
                [
                    'stem' => 'Tahap alur novel yang berisi pengenalan tokoh, latar, dan situasi awal cerita disebut...',
                    'options' => [
                        'A' => 'Eksposisi',
                        'B' => 'Konflik meningkat (rising action)',
                        'C' => 'Klimaks',
                        'D' => 'Penurunan konflik (falling action)',
                        'E' => 'Resolusi',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Eksposisi adalah tahap awal alur yang memperkenalkan tokoh, latar, dan situasi awal.',
                ],
                [
                    'stem' => 'Urutan lima tahapan pengembangan alur novel yang tepat adalah...',
                    'options' => [
                        'A' => 'Eksposisi – konflik meningkat – klimaks – penurunan konflik – resolusi',
                        'B' => 'Klimaks – eksposisi – resolusi – konflik meningkat – penurunan konflik',
                        'C' => 'Tesis – argumentasi – penegasan ulang – rekomendasi – simpulan',
                        'D' => 'Pernyataan umum – deretan penjelas – interpretasi – koda – orientasi',
                        'E' => 'Resolusi – klimaks – eksposisi – penurunan konflik – konflik meningkat',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Alur berkembang dari eksposisi, konflik meningkat, klimaks, penurunan konflik, hingga resolusi.',
                ],
                [
                    'stem' => 'Gagasan inti cerita yang dirumuskan dalam satu kalimat dan memuat tokoh, konflik, serta arah penyelesaian disebut...',
                    'options' => [
                        'A' => 'Premis',
                        'B' => 'Sinopsis',
                        'C' => 'Epilog',
                        'D' => 'Prolog',
                        'E' => 'Resensi',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Premis adalah gagasan inti cerita dalam satu kalimat yang menjadi dasar penyusunan kerangka novel.',
                ],
                [
                    'stem' => 'Penulisan kalimat langsung yang tepat sesuai EYD Edisi V adalah...',
                    'options' => [
                        'A' => '"Kita harus melaporkan perundungan itu kepada wali kelas," kata Nara.',
                        'B' => '"Kita harus melaporkan perundungan itu kepada wali kelas", kata Nara.',
                        'C' => '"kita harus melaporkan perundungan itu kepada wali kelas," kata Nara.',
                        'D' => 'Kita harus melaporkan perundungan itu kepada wali kelas," kata Nara.',
                        'E' => 'Nara berkata bahwa "kita harus melaporkan perundungan itu kepada wali kelas".',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Petikan diapit tanda petik dua, diawali huruf kapital, dan tanda koma diletakkan di dalam tanda petik sebelum kalimat pengiring.',
                ],
                [
                    'stem' => 'Ubahlah kalimat langsung berikut menjadi kalimat tidak langsung: Bu Rahma berkata, "Saya akan membentuk duta antiperundungan di kelas ini."',
                    'options' => [
                        'A' => 'Bu Rahma berkata bahwa beliau akan membentuk duta antiperundungan di kelas itu.',
                        'B' => 'Bu Rahma berkata bahwa "saya akan membentuk duta antiperundungan".',
                        'C' => 'Bu Rahma berkata, saya akan membentuk duta antiperundungan di kelas ini.',
                        'D' => '"Bu Rahma akan membentuk duta antiperundungan," katanya.',
                        'E' => 'Bu Rahma bertanya apakah saya akan membentuk duta antiperundungan.',
                    ],
                    'correct' => 'A',
                    'explanation' => 'Kalimat tidak langsung tidak memakai tanda petik, memakai konjungsi "bahwa", dan menyesuaikan kata ganti (saya → beliau) serta keterangan (ini → itu).',
                ],
            ];
        }

        // BAB 6 — Surat Resmi dan Surat Kuasa (Buku Siswa Kelas XII Edisi Revisi 2025, Bab I)
        return [
            [
                'stem' => 'Surat resmi yang berisi pelimpahan atau pemberian wewenang dari seseorang kepada pihak lain untuk bertindak atas nama pemberi wewenang disebut...',
                'options' => [
                    'A' => 'Surat kuasa',
                    'B' => 'Surat edaran',
                    'C' => 'Surat undangan',
                    'D' => 'Surat penawaran',
                    'E' => 'Surat keputusan',
                ],
                'correct' => 'A',
                'explanation' => 'Surat kuasa adalah surat resmi yang berisi pelimpahan wewenang dari pemberi kuasa kepada penerima kuasa.',
            ],
            [
                'stem' => 'Pokok isi surat resmi yang lengkap sebaiknya menjawab unsur ADIK SIMBA, yaitu...',
                'options' => [
                    'A' => 'Apa, di mana, kapan, siapa, mengapa, dan bagaimana',
                    'B' => 'Alamat, data, identitas, kop, salam, dan materai',
                    'C' => 'Abstrak, deskripsi, isi, kesimpulan, saran, dan bukti',
                    'D' => 'Apa, dengan siapa, kepada siapa, sejak kapan, berapa, dan alasan',
                    'E' => 'Awal, dalam, inti, kaki, simpulan, dan akhir',
                ],
                'correct' => 'A',
                'explanation' => 'ADIK SIMBA adalah singkatan Apa, Di mana, Kapan, Siapa, Mengapa, dan Bagaimana sebagai pokok isi surat.',
            ],
            [
                'stem' => 'Penulisan alamat tujuan surat resmi yang sesuai kaidah adalah...',
                'options' => [
                    'A' => 'Yth. Kepala SMAN 1 Ciruas',
                    'B' => 'Kepada Yth. Kepala SMAN 1 Ciruas.',
                    'C' => 'Kepada Yth: Bapak Kepala SMAN 1 Ciruas.',
                    'D' => 'Yth Kepala SMAN 1 Ciruas.',
                    'E' => 'Kepada, Yth. Kepala SMAN 1 Ciruas',
                ],
                'correct' => 'A',
                'explanation' => 'Alamat tujuan diawali singkatan "Yth." (bertitik), tanpa kata "Kepada", dan tanpa tanda titik di akhir.',
            ],
            [
                'stem' => 'Bagian surat resmi yang memuat jabatan pengirim, tanda tangan, nama lengkap, cap instansi, dan tembusan disebut...',
                'options' => [
                    'A' => 'Kaki surat',
                    'B' => 'Kepala surat',
                    'C' => 'Tubuh surat',
                    'D' => 'Kop surat',
                    'E' => 'Lampiran surat',
                ],
                'correct' => 'A',
                'explanation' => 'Kaki surat berisi jabatan, tanda tangan, nama lengkap, stempel/cap, dan tembusan bila ada.',
            ],
            [
                'stem' => 'Manakah kalimat berikut yang merupakan kalimat efektif (hemat)?',
                'options' => [
                    'A' => 'Para siswa diminta hadir di aula pukul 07.30.',
                    'B' => 'Para siswa-siswa diminta untuk hadir di aula pukul 07.30.',
                    'C' => 'Para siswa-siswi semua diminta agar supaya hadir di aula.',
                    'D' => 'Bagi para siswa-siswa diharapkan hadir di aula.',
                    'E' => 'Kepada seluruh para siswa diminta hadir di aula.',
                ],
                'correct' => 'A',
                'explanation' => '"Para" sudah menyatakan jamak sehingga tidak perlu diulang; "agar supaya" juga pemborosan. Kalimat A hemat dan jelas.',
            ],
            [
                'stem' => 'Penulisan singkatan berikut yang sesuai dengan EYD Edisi V adalah...',
                'options' => [
                    'A' => 'Yth., dkk., S.H., PT, NIK',
                    'B' => 'Yth, dkk, S.H, P.T., N.I.K.',
                    'C' => 'Y.th., d.k.k., SH., PT., NIK.',
                    'D' => 'Yth., dkk, SH, P.T, N.I.K',
                    'E' => 'YTH., DKK., S.H., P.T., NIK.',
                ],
                'correct' => 'A',
                'explanation' => 'Yth., dkk., dan gelar S.H. memakai titik, sedangkan singkatan huruf awal kapital seperti PT dan NIK ditulis tanpa titik.',
            ],
            [
                'stem' => 'Dalam surat kuasa, pihak yang melimpahkan wewenangnya kepada orang lain disebut...',
                'options' => [
                    'A' => 'Pemberi kuasa',
                    'B' => 'Penerima kuasa',
                    'C' => 'Saksi',
                    'D' => 'Tembusan',
                    'E' => 'Pihak yang mengetahui',
                ],
                'correct' => 'A',
                'explanation' => 'Pemberi kuasa adalah pihak yang melimpahkan wewenang; penerima kuasa adalah pihak yang menjalankan wewenang tersebut.',
            ],
            [
                'stem' => 'Rizky, Ketua OSIS, ingin menguasakan tugas memimpin rapat LDKS kepada wakilnya. Rumusan isi pelimpahan wewenang yang paling tepat adalah...',
                'options' => [
                    'A' => 'untuk memimpin rapat persiapan LDKS pada hari Sabtu, 14 November 2026, di Aula SMAN 1 Ciruas.',
                    'B' => 'untuk mengurus semua keperluan saya di sekolah.',
                    'C' => 'untuk melakukan apa saja yang dianggap perlu.',
                    'D' => 'untuk menggantikan saya selamanya sebagai Ketua OSIS.',
                    'E' => 'untuk hadir di sekolah kapan pun.',
                ],
                'correct' => 'A',
                'explanation' => 'Isi pelimpahan wewenang harus spesifik dan jelas (tugas, waktu, tempat) agar tidak multitafsir dan tidak disalahgunakan.',
            ],
            [
                'stem' => 'Urutan unsur surat kuasa yang tepat adalah...',
                'options' => [
                    'A' => 'Judul dan nomor – identitas pemberi kuasa – identitas penerima kuasa – isi pelimpahan wewenang – penutup – tempat, tanggal, dan tanda tangan',
                    'B' => 'Identitas penerima kuasa – tanda tangan – judul – isi wewenang – identitas pemberi kuasa',
                    'C' => 'Tanda tangan – tempat dan tanggal – isi wewenang – judul – identitas',
                    'D' => 'Isi wewenang – judul – penutup – identitas penerima kuasa – nomor',
                    'E' => 'Penutup – identitas pemberi kuasa – judul – tanda tangan – isi wewenang',
                ],
                'correct' => 'A',
                'explanation' => 'Surat kuasa diawali judul dan nomor, identitas pemberi lalu penerima kuasa, isi wewenang beserta masa berlaku, penutup, kemudian tempat, tanggal, dan tanda tangan.',
            ],
            [
                'stem' => 'Pada bagian tanda tangan surat kuasa perorangan untuk urusan resmi, hal yang tepat adalah...',
                'options' => [
                    'A' => 'Penerima kuasa menandatangani di sebelah kiri, sedangkan pemberi kuasa di sebelah kanan di atas meterai.',
                    'B' => 'Hanya penerima kuasa yang menandatangani surat.',
                    'C' => 'Pemberi kuasa tidak perlu menandatangani karena sudah tercantum namanya.',
                    'D' => 'Tanda tangan cukup ditulis dengan huruf kapital tanpa nama terang.',
                    'E' => 'Meterai ditempel pada kolom tanda tangan penerima kuasa.',
                ],
                'correct' => 'A',
                'explanation' => 'Lazimnya "Yang Menerima Kuasa" di kiri dan "Yang Memberi Kuasa" di kanan; meterai ditempel pada tanda tangan pemberi kuasa bila menyangkut urusan resmi/hukum.',
            ],
            [
                'stem' => 'Sebuah surat kuasa tidak mencantumkan sampai kapan kuasa itu berlaku. Akibat yang paling mungkin terjadi adalah...',
                'options' => [
                    'A' => 'Wewenang dapat disalahgunakan karena batas waktu pelaksanaannya tidak jelas.',
                    'B' => 'Surat menjadi lebih sah secara hukum.',
                    'C' => 'Pemberi kuasa otomatis kehilangan jabatannya.',
                    'D' => 'Surat berubah menjadi surat undangan.',
                    'E' => 'Tidak ada pengaruh apa pun terhadap isi surat.',
                ],
                'correct' => 'A',
                'explanation' => 'Masa berlaku membatasi pelimpahan wewenang. Tanpa batas waktu, kuasa berpotensi digunakan di luar keperluan yang dimaksud.',
            ],
        ];
    }
}
