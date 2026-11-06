import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    BookOpenCheck,
    Clapperboard,
    GraduationCap,
    Heart,
    Library,
    Mail,
    MapPin,
    Medal,
    MessagesSquare,
    Microscope,
    Play,
    School,
    Sparkles,
    Trophy,
} from 'lucide-react';
import { teacherProfile as P } from '../data/teacherProfile';
import { BlockCloud, MasjidAgung, MenaraBanten } from '../components/game/BantenArt';

/*
 * Halaman Profil Guru pembuat BAHASA PLAY.AI — bergaya "kartu karakter" game,
 * senada dengan halaman utama. Data diambil dari resources/js/data/teacherProfile.js.
 */

const SKILL_ICONS = { library: Library, research: Microscope, debate: MessagesSquare, film: Clapperboard };
const SKILL_COLORS = ['bg-sky-400', 'bg-lime-400', 'bg-banten-gold', 'bg-orange-400'];
const LEVEL_STYLE = {
    Nasional: 'bg-rose-500 text-white',
    Provinsi: 'bg-violet-500 text-white',
    Kabupaten: 'bg-banten-teal text-white',
    Kota: 'bg-sky-500 text-white',
};

function SectionTitle({ icon: Icon, children, light = false }) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <span className="w-11 h-11 shrink-0 rounded-2xl bg-banten-gold border-4 border-banten-night flex items-center justify-center -rotate-6">
                <Icon className="w-5 h-5 text-banten-night" />
            </span>
            <h2 className={`font-game text-2xl sm:text-4xl tracking-wide ${light ? 'text-white text-stroke-game' : 'text-banten-night'}`}>{children}</h2>
        </div>
    );
}

function StatTile({ value, label }) {
    return (
        <div className="rounded-2xl bg-white border-4 border-banten-night shadow-[0_5px_0_0_#10213a] px-3 py-3 text-center">
            <p className="font-game text-3xl sm:text-4xl text-banten-terracotta leading-none">{value}</p>
            <p className="text-[11px] sm:text-xs font-extrabold text-slate-600 mt-1">{label}</p>
        </div>
    );
}

export default function TeacherProfilePage() {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = `Profil Guru · ${P.name} — BAHASA PLAY.AI`;
        return () => {
            document.title = 'BAHASA PLAY.AI';
        };
    }, []);

    const stats = [
        { value: P.yearsTeaching, label: 'Tahun mengajar' },
        { value: P.portfolio.length, label: 'Prestasi siswa binaan' },
        { value: P.awards.length, label: 'Penghargaan pribadi' },
        { value: P.portfolio.filter((p) => p.level === 'Nasional').length, label: 'Prestasi nasional' },
    ];

    return (
        <div className="min-h-screen bg-sky-300 text-banten-night overflow-x-hidden">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-banten-night/95 backdrop-blur border-b-4 border-banten-gold">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
                    <Link to="/" className="btn-chunky inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border-2 border-banten-night font-game text-sm">
                        <ArrowLeft className="w-4 h-4" /> Beranda
                    </Link>
                    <span className="font-game text-white text-lg sm:text-xl tracking-wide truncate">Profil Guru</span>
                    <Link to="/login" className="btn-chunky px-4 py-2 rounded-xl font-game text-sm sm:text-base bg-gradient-to-b from-lime-300 to-green-600 text-white border-2 border-banten-night">
                        Masuk
                    </Link>
                </div>
            </header>

            {/* Hero: kartu karakter */}
            <section className="relative overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200">
                <BlockCloud className="absolute top-8 left-[4%] w-28 sm:w-40 animate-float opacity-95" />
                <BlockCloud className="absolute top-28 right-[6%] w-24 sm:w-36 animate-float hidden sm:block" style={{ animationDelay: '1.2s' }} />
                <div className="absolute -top-16 right-[30%] w-40 h-40 rounded-full bg-amber-200/70 blur-2xl" />

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-10 grid lg:grid-cols-12 gap-8 items-center">
                    {/* Foto */}
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="relative w-64 sm:w-80 animate-pop">
                            <div className="absolute -inset-3 rounded-t-full rounded-b-[2.5rem] bg-banten-gold border-4 border-banten-night rotate-3" />
                            <div className="relative rounded-t-full rounded-b-[2rem] overflow-hidden border-4 border-banten-night bg-white shadow-[0_10px_0_0_#10213a]">
                                <img src={P.photo} alt={`Foto ${P.name}`} className="w-full h-auto block" width="700" height="800" />
                            </div>
                            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 rounded-xl bg-banten-night text-banten-gold font-game text-base border-4 border-white -rotate-2">
                                LEVEL GURU · MAX
                            </span>
                            <span className="absolute top-6 -right-4 w-14 h-14 rounded-2xl bg-white border-4 border-banten-night flex items-center justify-center rotate-12 animate-wiggle">
                                <Trophy className="w-7 h-7 text-banten-copper" />
                            </span>
                        </div>
                    </div>

                    {/* Identitas */}
                    <div className="lg:col-span-7 min-w-0 text-center lg:text-left space-y-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-banten-night text-amber-100 text-[11px] sm:text-xs font-extrabold border-2 border-banten-gold">
                            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" /> Kreator BAHASA PLAY.AI
                        </span>
                        <h1 className="font-game leading-[1.05] tracking-wide">
                            <span className="block text-4xl sm:text-6xl text-white text-stroke-game" style={{ WebkitTextStrokeWidth: 5 }}>
                                {P.name}
                            </span>
                            <span className="block text-2xl sm:text-3xl text-banten-gold text-stroke-game mt-1" style={{ WebkitTextStrokeWidth: 4 }}>
                                {P.title}
                            </span>
                        </h1>
                        <p className="font-game text-lg sm:text-2xl">{P.headline}</p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                            {P.roles.map((r) => (
                                <span key={r} className="px-3 py-1 rounded-xl bg-white/85 border-2 border-banten-night text-[11px] sm:text-xs font-extrabold">
                                    {r}
                                </span>
                            ))}
                        </div>
                        <blockquote className="relative mx-auto lg:mx-0 max-w-xl rounded-2xl rounded-bl-sm bg-white border-4 border-banten-night px-4 py-3 text-sm font-bold text-left shadow-[0_5px_0_0_#10213a]">
                            “{P.quote}”
                        </blockquote>
                    </div>
                </div>

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {stats.map((s) => (
                        <StatTile key={s.label} {...s} />
                    ))}
                </div>

                <div className="relative h-6 bg-banten-terracotta border-y-4 border-banten-night overflow-hidden">
                    <div className="absolute inset-0 bg-batik-banten opacity-90" style={{ backgroundSize: '24px 24px' }} />
                </div>
            </section>

            {/* Tentang + Pendidikan + Kontak */}
            <section className="bg-banten-cream py-12 sm:py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 space-y-6">
                        <div>
                            <SectionTitle icon={BookOpenCheck}>Tentang Saya</SectionTitle>
                            <div className="rounded-3xl bg-white border-4 border-banten-night p-5 sm:p-6 shadow-[0_6px_0_0_#10213a]">
                                <p className="text-sm sm:text-base leading-relaxed text-slate-700">{P.about}</p>
                            </div>
                        </div>
                        <div>
                            <SectionTitle icon={GraduationCap}>Pendidikan</SectionTitle>
                            <ol className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-banten-night/20">
                                {P.education.map((e) => (
                                    <li key={e.school} className="relative">
                                        <span className="absolute -left-6 top-4 w-5 h-5 rounded-full bg-banten-gold border-4 border-banten-night" />
                                        <div className="rounded-3xl bg-white border-4 border-banten-night p-4 shadow-[0_5px_0_0_#10213a]">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="px-2.5 py-0.5 rounded-lg bg-banten-night text-banten-gold text-xs font-extrabold">{e.years}</span>
                                                {e.note && <span className="px-2.5 py-0.5 rounded-lg bg-lime-300 border-2 border-banten-night text-xs font-extrabold">{e.note}</span>}
                                            </div>
                                            <p className="font-game text-lg sm:text-xl mt-2 leading-tight">{e.school}</p>
                                            <p className="text-sm font-bold text-slate-600">{e.program}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <SectionTitle icon={School}>Kontak</SectionTitle>
                        <div className="rounded-3xl bg-banten-night text-white border-4 border-banten-night p-5 shadow-[0_6px_0_0_#10213a] relative overflow-hidden">
                            <div className="absolute inset-0 bg-batik-banten opacity-10" />
                            <ul className="relative space-y-3 text-sm">
                                <li className="flex items-center gap-3">
                                    <span className="w-10 h-10 shrink-0 rounded-xl bg-sky-400 border-2 border-white flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-banten-night" />
                                    </span>
                                    <a href={`mailto:${P.contact.email}`} className="font-bold break-all hover:text-banten-gold">
                                        {P.contact.email}
                                    </a>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-10 h-10 shrink-0 rounded-xl bg-lime-400 border-2 border-white flex items-center justify-center">
                                        <School className="w-5 h-5 text-banten-night" />
                                    </span>
                                    <span className="font-bold">{P.contact.school}</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-10 h-10 shrink-0 rounded-xl bg-banten-gold border-2 border-white flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-banten-night" />
                                    </span>
                                    <span className="font-bold">{P.contact.location}</span>
                                </li>
                            </ul>
                            <div className="relative mt-5 h-24">
                                <MasjidAgung className="absolute bottom-0 left-0 w-28" />
                                <MenaraBanten className="absolute bottom-0 right-4 w-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Keahlian */}
            <section className="relative bg-banten-night text-white py-12 sm:py-16">
                <div className="absolute inset-0 bg-batik-banten opacity-10" />
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
                    <SectionTitle icon={Sparkles} light>
                        Keahlian (Skill Tree)
                    </SectionTitle>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {P.skills.map((s, i) => {
                            const Icon = SKILL_ICONS[s.icon] || Sparkles;
                            return (
                                <div key={s.title} className="rounded-3xl bg-white text-banten-night border-4 border-white/90 p-5 shadow-[0_6px_0_0_rgba(0,0,0,0.45)]">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-12 h-12 shrink-0 rounded-2xl ${SKILL_COLORS[i % SKILL_COLORS.length]} border-4 border-banten-night flex items-center justify-center`}>
                                            <Icon className="w-6 h-6" />
                                        </span>
                                        <h3 className="font-game text-lg sm:text-xl leading-tight">{s.title}</h3>
                                    </div>
                                    <ul className="mt-3 space-y-2">
                                        {s.points.map((p) => (
                                            <li key={p} className="flex gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span className="mt-1.5 w-2 h-2 shrink-0 rotate-45 bg-banten-copper" />
                                                <span>{p}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Penghargaan pribadi */}
            <section className="bg-gradient-to-b from-sky-300 to-sky-200 py-12 sm:py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <SectionTitle icon={Trophy}>Kualifikasi & Penghargaan</SectionTitle>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {P.awards.map((a) => (
                            <div key={a.title} className="relative rounded-3xl bg-gradient-to-b from-amber-100 to-white border-4 border-banten-night p-5 pt-6 shadow-[0_6px_0_0_#10213a]">
                                <span className="absolute -top-4 right-4 px-3 py-1 rounded-xl bg-banten-night text-banten-gold font-game text-base border-2 border-white">{a.year}</span>
                                <Trophy className="w-8 h-8 text-banten-copper" />
                                <p className="font-game text-lg mt-2 leading-tight">{a.title}</p>
                                <p className="text-xs font-bold text-slate-600 mt-1">{a.by}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Portofolio pembimbingan */}
            <section className="bg-banten-cream py-12 sm:py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <SectionTitle icon={Medal}>Rekam Jejak Pembimbingan</SectionTitle>
                    <p className="-mt-3 mb-5 text-sm font-bold text-slate-600">Prestasi siswa binaan yang diraih bersama tim SMAN 1 Ciruas dan sekolah lain.</p>
                    <div className="rounded-3xl bg-white border-4 border-banten-night shadow-[0_6px_0_0_#10213a] overflow-hidden divide-y-2 divide-banten-night/10">
                        {P.portfolio.map((p) => (
                            <div key={p.title} className="flex items-center gap-3 sm:gap-4 px-4 py-3 sm:px-5">
                                <span className="w-11 h-11 shrink-0 rounded-2xl bg-banten-gold border-4 border-banten-night flex items-center justify-center">
                                    <Medal className="w-5 h-5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="font-extrabold text-sm sm:text-base leading-tight">{p.title}</p>
                                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{p.by}</p>
                                </div>
                                <div className="shrink-0 flex flex-col items-end gap-1">
                                    <span className="px-2 py-0.5 rounded-lg bg-banten-night text-banten-gold text-[11px] font-extrabold whitespace-nowrap">{p.year}</span>
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${LEVEL_STYLE[p.level] || 'bg-slate-500 text-white'}`}>{p.level}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ajakan */}
            <section className="bg-gradient-to-b from-banten-teal to-cyan-900 text-white py-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-batik-banten opacity-10" />
                <div className="relative max-w-3xl mx-auto px-4 text-center">
                    <p className="font-game text-2xl sm:text-4xl text-white text-stroke-game">Siap belajar bersama Pak Bangkit?</p>
                    <p className="text-sm text-cyan-50/85 mt-2">Masuk ke dunia BAHASA PLAY.AI dan selesaikan misi Bahasa Indonesia Kelas XII.</p>
                    <Link to="/login" className="btn-chunky mt-6 inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-game text-2xl bg-gradient-to-b from-amber-300 to-banten-copper text-banten-night border-4 border-banten-night">
                        <Play className="w-6 h-6 fill-banten-night" /> Mulai Petualangan
                    </Link>
                </div>
            </section>

            <footer className="bg-banten-night text-amber-100/80 border-t-4 border-banten-gold">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-xs space-y-1">
                    <p>
                        BAHASA PLAY.AI dibuat dengan <Heart className="inline w-3.5 h-3.5 fill-rose-400 text-rose-400 -mt-0.5" /> oleh {P.name}, {P.title}
                    </p>
                    <p className="text-amber-200/70">♪ Lagu latar: Donkgedank - SAMAPTA (No Copyright music)</p>
                </div>
            </footer>
        </div>
    );
}
