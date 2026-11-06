import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Activity, BarChart3, BookOpenCheck, Bot, ChevronRight, Gamepad2, GraduationCap, Heart, Map, MessagesSquare, Play, ShieldCheck, Smartphone, Sparkles, Trophy } from 'lucide-react';
import api from '../lib/axios';
import BlockyAvatar from '../components/game/BlockyAvatar';
import { BlockCloud, GrassIsland, MasjidAgung, MenaraBanten } from '../components/game/BantenArt';
import { teacherProfile } from '../data/teacherProfile';

/*
 * Halaman utama publik BAHASA PLAY.AI — nuansa game blok ala Roblox berpadu budaya Banten
 * (pola batik belah ketupat, Menara Banten, Masjid Agung beratap tumpang, palet emas–toska–terakota).
 * Tidak memuat Three.js (aturan emas #7).
 */

const WORLDS = [
    { name: 'Kota Cilegon', tag: 'Kota Baja & Pelabuhan', color: 'from-sky-400 to-blue-600', emoji: '🏭' },
    { name: 'Banten Lama', tag: 'Masjid Agung & Menara', color: 'from-amber-300 to-orange-600', emoji: '🕌' },
    { name: 'Gading Serpong', tag: 'Kota Digital & AI', color: 'from-indigo-400 to-violet-600', emoji: '🤖' },
    { name: 'Kawasan Adat Lebak', tag: 'Kearifan Lokal & Alam', color: 'from-lime-400 to-green-700', emoji: '🌾' },
    { name: 'Pandeglang', tag: 'Taman Literasi', color: 'from-teal-300 to-cyan-700', emoji: '🦏' },
    { name: 'SMAN 1 Ciruas', tag: 'Kampus Kita', color: 'from-blue-400 to-blue-800', emoji: '🏫' },
];

const STEPS = [
    { icon: Map, title: 'Jelajahi Dunia', text: 'Masuki peta 3D kota-kota di Banten dan ikuti penanda di minimap.', color: 'bg-sky-400' },
    { icon: MessagesSquare, title: 'Ngobrol dengan NPC', text: 'Tokoh pemandu menjelaskan materi lewat percakapan bertahap.', color: 'bg-banten-gold' },
    { icon: BookOpenCheck, title: 'Latihan Soal', text: 'Uji pemahamanmu di Arena Latihan. Capai KKM untuk membuka gerbang ujian.', color: 'bg-orange-400' },
    { icon: Trophy, title: 'Ujian Resmi', text: 'Tuntaskan Zona Ujian bertimer server dan kumpulkan pencapaian.', color: 'bg-emerald-400' },
];

const FEATURES = [
    { icon: Gamepad2, title: 'Dunia 3D Interaktif', text: 'Kamera 360°, joystick sentuh, dan minimap seperti game favoritmu.' },
    { icon: ShieldCheck, title: 'Penilaian Aman', text: 'Kunci jawaban & skor dihitung di server. Waktu ujian tidak bisa diakali.' },
    { icon: Bot, title: 'AI Question Generator', text: 'Guru menyusun soal pilihan ganda A–E dibantu Google Gemini, ditinjau sebelum terbit.' },
    { icon: BarChart3, title: 'Laporan Lengkap', text: 'Progres per siswa, per kelas, dan per BAB siap diekspor ke Excel & PDF.' },
    { icon: Smartphone, title: 'Ramah HP', text: 'Bisa dipasang sebagai aplikasi (PWA) dan nyaman di layar 360px.' },
    { icon: Sparkles, title: 'Pencapaian & XP', text: 'Kumpulkan XP dan lencana dari setiap materi, latihan, dan ujian.' },
];

function Logo({ size = 'lg' }) {
    const big = size === 'lg';
    return (
        <span className={`font-game leading-none tracking-wide inline-flex items-baseline gap-1 ${big ? 'text-[2.55rem] sm:text-7xl lg:text-8xl' : 'text-xl sm:text-2xl'}`}>
            <span className="text-white text-stroke-game" style={{ WebkitTextStrokeWidth: big ? 5 : 3 }}>
                BAHASA
            </span>
            <span className="text-banten-gold text-stroke-game" style={{ WebkitTextStrokeWidth: big ? 5 : 3 }}>
                PLAY
            </span>
            <span
                className={`relative -top-1 rounded-lg bg-banten-teal text-white border-banten-night ${big ? 'text-2xl sm:text-4xl px-2 border-4 -rotate-6' : 'text-xs px-1 border-2 -rotate-6'}`}
            >
                .AI
            </span>
        </span>
    );
}

export default function LandingPage() {
    const { data: health, isLoading } = useQuery({
        queryKey: ['health'],
        queryFn: async () => {
            const response = await api.get('/health');
            return response.data;
        },
    });

    return (
        <div className="min-h-screen bg-sky-300 text-banten-night overflow-x-hidden">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-banten-night/95 backdrop-blur border-b-4 border-banten-gold">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
                    <Link to="/" className="flex items-center gap-2.5 min-w-0">
                        <span className="w-10 h-10 rounded-xl bg-banten-gold border-4 border-white/90 flex items-center justify-center -rotate-6 shrink-0 btn-chunky">
                            <Gamepad2 className="w-5 h-5 text-banten-night" />
                        </span>
                        <span className="min-w-0">
                            <Logo size="sm" />
                            <span className="hidden sm:block text-[10px] font-bold text-amber-100/80 -mt-0.5">Game-Based LMS · Bahasa Indonesia Kelas XII</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link
                            to="/profil-guru"
                            className="btn-chunky inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-game text-sm sm:text-base bg-white text-banten-night border-2 border-banten-night"
                            aria-label="Profil Guru"
                        >
                            <GraduationCap className="w-4 h-4" />
                            <span className="hidden sm:inline">Profil Guru</span>
                        </Link>
                        <Link to="/login" className="btn-chunky px-4 py-2 rounded-xl font-game text-sm sm:text-base bg-gradient-to-b from-lime-300 to-green-600 text-white border-2 border-banten-night">
                            Masuk
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200">
                <BlockCloud className="absolute top-8 left-[4%] w-28 sm:w-40 animate-float opacity-95" />
                <BlockCloud className="absolute top-24 right-[8%] w-24 sm:w-36 animate-float opacity-90" style={{ animationDelay: '1.2s' }} />
                <BlockCloud className="absolute bottom-40 left-[45%] w-20 animate-float opacity-80 hidden lg:block" style={{ animationDelay: '0.6s' }} />
                <div className="absolute -top-16 right-[30%] w-40 h-40 rounded-full bg-amber-200/70 blur-2xl" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-0 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                    <div className="lg:col-span-7 min-w-0 space-y-5 pb-10 lg:pb-20 text-center lg:text-left">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-banten-night text-amber-100 text-[11px] sm:text-xs font-extrabold border-2 border-banten-gold">
                            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" /> SMAN 1 Ciruas · Kurikulum Merdeka
                        </span>
                        <h1 className="animate-pop">
                            <Logo />
                        </h1>
                        <p className="font-game text-lg sm:text-2xl text-banten-night leading-snug max-w-2xl mx-auto lg:mx-0">
                            Game-Based Learning Management System (LMS) untuk Pembelajaran Bahasa Indonesia SMA Kelas XII
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-banten-night/80 max-w-xl mx-auto lg:mx-0">
                            Mainkan gamenya, pelajari bahasanya. Jelajahi dunia 3D bernuansa Banten, ngobrol dengan NPC, dan taklukkan latihan serta ujian.
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-1">
                            <Link to="/login" className="btn-chunky inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-game text-xl sm:text-2xl bg-gradient-to-b from-lime-300 to-green-600 text-white border-4 border-banten-night">
                                <Play className="w-6 h-6 fill-white" /> MAIN SEKARANG
                            </Link>
                        </div>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-2">
                            {['6 Dunia Banten', 'NPC Pemandu', 'Latihan KKM 75', 'Ujian Bertimer'].map((t) => (
                                <span key={t} className="px-3 py-1 rounded-xl bg-white/80 border-2 border-banten-night text-xs font-extrabold">
                                    {t}
                                </span>
                            ))}
                        </div>
                        <Link
                            to="/profil-guru"
                            className="group inline-flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full bg-white border-4 border-banten-night shadow-[0_5px_0_0_#10213a] hover:-translate-y-0.5 transition-transform text-left"
                        >
                            <img src={teacherProfile.avatar} alt="" width="48" height="48" className="w-12 h-12 rounded-full object-cover border-2 border-banten-gold bg-white" />
                            <span className="leading-tight">
                                <span className="block text-[11px] font-bold text-slate-500">
                                    Dibuat dengan <Heart className="inline w-3 h-3 fill-rose-500 text-rose-500 -mt-0.5" /> oleh
                                </span>
                                <span className="block font-game text-sm sm:text-base">BANGKIT CANDRA MAULANA</span>
                                <span className="block text-[10px] font-extrabold text-banten-terracotta">Guru Bahasa Indonesia – SMAN 1 Ciruas</span>
                            </span>
                            <ChevronRight className="w-5 h-5 text-banten-night/60 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>

                    {/* Ilustrasi pulau Banten */}
                    <div className="lg:col-span-5 relative mx-auto w-full max-w-md lg:max-w-none">
                        <GrassIsland className="mx-2 sm:mx-6">
                            <div className="relative h-64 sm:h-80">
                                <MasjidAgung className="absolute bottom-0 left-0 w-36 sm:w-48" />
                                <MenaraBanten className="absolute bottom-0 right-2 sm:right-6 w-16 sm:w-20" />
                                <div className="absolute bottom-0 left-[40%] flex items-end gap-1">
                                    <div className="animate-float">
                                        <BlockyAvatar preset="siswa" hair="short" size={64} />
                                    </div>
                                    <div className="animate-float" style={{ animationDelay: '0.5s' }}>
                                        <BlockyAvatar preset="guru" hair="peci" size={56} />
                                    </div>
                                </div>
                                <div className="absolute top-6 left-[30%] animate-bubble-in rounded-2xl rounded-bl-sm bg-white border-4 border-banten-night px-3 py-2 text-xs sm:text-sm font-extrabold shadow-lg">
                                    Ayo belajar Bahasa Indonesia!
                                </div>
                            </div>
                        </GrassIsland>
                    </div>
                </div>
                {/* Pita batik */}
                <div className="relative h-6 bg-banten-terracotta border-y-4 border-banten-night overflow-hidden">
                    <div className="absolute inset-0 bg-batik-banten opacity-90" style={{ backgroundSize: '24px 24px' }} />
                </div>
            </section>

            {/* Dunia */}
            <section id="dunia" className="relative bg-banten-night text-white py-12 sm:py-16 scroll-mt-16">
                <div className="absolute inset-0 bg-batik-banten opacity-10" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-8">
                        <h2 className="font-game text-3xl sm:text-5xl text-banten-gold text-stroke-game">Pilih Duniamu</h2>
                        <p className="text-sm text-amber-100/80 mt-2">Setiap BAB punya dunia 3D sendiri, terinspirasi dari tempat nyata di Provinsi Banten.</p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                        {WORLDS.map((w) => (
                            <div key={w.name} className="group btn-chunky rounded-3xl border-4 border-white/90 overflow-hidden bg-white text-banten-night">
                                <div className={`relative h-24 sm:h-36 bg-gradient-to-br ${w.color} flex items-center justify-center`}>
                                    <div className="absolute inset-0 bg-batik-banten opacity-25" />
                                    <span className="relative text-5xl sm:text-7xl drop-shadow-lg group-hover:scale-110 transition-transform">{w.emoji}</span>
                                </div>
                                <div className="p-3 sm:p-4">
                                    <p className="font-game text-base sm:text-xl leading-tight">{w.name}</p>
                                    <p className="text-[11px] sm:text-xs font-bold text-slate-500">{w.tag}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Cara bermain */}
            <section className="bg-banten-cream py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <h2 className="font-game text-3xl sm:text-5xl text-center text-banten-terracotta">Cara Bermain</h2>
                    <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {STEPS.map((s, i) => (
                            <div key={s.title} className="relative rounded-3xl bg-white border-4 border-banten-night p-5 pt-8 shadow-[0_6px_0_0_#10213a]">
                                <span className="absolute -top-5 left-5 w-11 h-11 rounded-2xl bg-banten-night text-banten-gold font-game text-2xl flex items-center justify-center -rotate-6">
                                    {i + 1}
                                </span>
                                <span className={`w-12 h-12 rounded-2xl ${s.color} border-4 border-banten-night flex items-center justify-center`}>
                                    <s.icon className="w-6 h-6 text-banten-night" />
                                </span>
                                <h3 className="font-game text-xl mt-3">{s.title}</h3>
                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{s.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Fitur */}
            <section className="bg-gradient-to-b from-banten-teal to-cyan-900 text-white py-12 sm:py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-batik-banten opacity-10" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
                    <h2 className="font-game text-3xl sm:text-5xl text-center text-white text-stroke-game">LMS Lengkap, Rasa Game</h2>
                    <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {FEATURES.map((f) => (
                            <div key={f.title} className="rounded-3xl bg-white/10 border-2 border-white/25 p-5 backdrop-blur">
                                <f.icon className="w-8 h-8 text-banten-gold" />
                                <h3 className="font-game text-xl mt-2">{f.title}</h3>
                                <p className="text-sm text-cyan-50/85 mt-1 leading-relaxed">{f.text}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 text-center">
                        <Link to="/login" className="btn-chunky inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-game text-2xl bg-gradient-to-b from-amber-300 to-banten-copper text-banten-night border-4 border-banten-night">
                            <Play className="w-6 h-6 fill-banten-night" /> Mulai Petualangan
                        </Link>
                    </div>
                </div>
            </section>

            {/* Kreator */}
            <section className="relative bg-banten-cream py-12 sm:py-16 overflow-hidden">
                <div className="absolute inset-0 bg-batik-banten opacity-[0.12]" />
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="rounded-[2rem] bg-white border-4 border-banten-night shadow-[0_10px_0_0_#10213a] overflow-hidden">
                        <div className="relative bg-banten-night px-5 py-3 text-center">
                            <div className="absolute inset-0 bg-batik-banten opacity-20" />
                            <p className="relative font-game text-lg sm:text-2xl text-white tracking-wide">
                                BAHASA PLAY.AI dibuat dengan <Heart className="inline w-5 h-5 sm:w-6 sm:h-6 fill-rose-500 text-rose-500 -mt-1 animate-pulse" /> oleh
                            </p>
                        </div>
                        <div className="p-5 sm:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                            <Link to="/profil-guru" className="relative shrink-0 group" aria-label="Lihat profil guru">
                                <span className="absolute -inset-2 rounded-full bg-banten-gold border-4 border-banten-night rotate-6 group-hover:rotate-12 transition-transform" />
                                <img
                                    src={teacherProfile.avatar}
                                    alt={`Foto ${teacherProfile.name}`}
                                    width="560"
                                    height="560"
                                    loading="lazy"
                                    className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-banten-night bg-white"
                                />
                                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-xl bg-lime-400 border-2 border-banten-night font-game text-xs">
                                    Kreator
                                </span>
                            </Link>
                            <div className="min-w-0 text-center md:text-left">
                                <h2 className="font-game text-3xl sm:text-4xl leading-tight uppercase">{teacherProfile.name}</h2>
                                <p className="font-game text-lg sm:text-xl text-banten-terracotta mt-1">Guru Bahasa Indonesia – SMAN 1 Ciruas</p>
                                <p className="text-sm text-slate-600 mt-3 leading-relaxed max-w-xl">“{teacherProfile.quote}”</p>
                                <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
                                    {['Kepala Perpustakaan Pusmancir', 'Pelatih Debat LDBI', 'Pembimbing OPSI Nasional'].map((t) => (
                                        <span key={t} className="px-2.5 py-1 rounded-xl bg-amber-100 border-2 border-banten-night text-[11px] font-extrabold">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <Link
                                    to="/profil-guru"
                                    className="btn-chunky mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-game text-lg bg-gradient-to-b from-sky-300 to-sky-600 text-white border-4 border-banten-night"
                                >
                                    <GraduationCap className="w-5 h-5" /> Lihat Profil Guru <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-banten-night text-amber-100/80 border-t-4 border-banten-gold">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="text-center sm:text-left">
                        <Logo size="sm" />
                        <p className="mt-1">SMAN 1 Ciruas · Kabupaten Serang, Banten</p>
                        <p className="mt-1">
                            Dibuat dengan <Heart className="inline w-3.5 h-3.5 fill-rose-400 text-rose-400 -mt-0.5" /> oleh{' '}
                            <Link to="/profil-guru" className="font-extrabold text-banten-gold hover:underline">
                                Bangkit Candra Maulana
                            </Link>{' '}
                            (Guru Bahasa Indonesia – SMAN 1 Ciruas)
                        </p>
                        <p className="mt-1 text-amber-200/70">♪ Lagu latar: Donkgedank - SAMAPTA (No Copyright music)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-lime-400" />
                        <span>
                            Server:{' '}
                            {isLoading ? 'memeriksa...' : health?.data?.status === 'ok' ? 'terhubung' : 'siap'}
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
