import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, BookOpen, HelpCircle, FileSpreadsheet, Sparkles, Users, Settings, Trophy, MapPin, Gamepad2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import BlockyAvatar from '../game/BlockyAvatar';
import { BlockCloud, MasjidAgung, MenaraBanten } from '../game/BantenArt';

/*
 * Kerangka halaman dalam (siswa, guru, admin) bergaya menu game ala Roblox
 * berpadu budaya Banten: latar batik, ubin menu tebal, kartu pemain dengan avatar blok.
 */

const navByRole = {
    student: [
        { to: '/student', label: 'Beranda & BAB', short: 'Beranda', icon: LayoutDashboard, end: true, color: 'bg-sky-400' },
        { to: '/student/achievements', label: 'Penghargaan', short: 'Lencana', icon: Trophy, color: 'bg-banten-gold' },
    ],
    teacher: [
        { to: '/teacher', label: 'Ringkasan', short: 'Ringkas', icon: LayoutDashboard, end: true, color: 'bg-sky-400' },
        { to: '/teacher/students', label: 'Siswa, Progres & Rekap', short: 'Siswa', icon: Users, color: 'bg-lime-400' },
        { to: '/teacher/chapters', label: 'BAB & Materi', short: 'BAB', icon: BookOpen, color: 'bg-banten-gold' },
        { to: '/teacher/game-editor', label: 'Zona & NPC 3D', short: 'Zona 3D', icon: MapPin, color: 'bg-teal-400' },
        { to: '/teacher/questions', label: 'Bank Soal & Latihan', short: 'Soal', icon: HelpCircle, color: 'bg-orange-400' },
        { to: '/teacher/exams', label: 'Zona Ujian', short: 'Ujian', icon: FileSpreadsheet, color: 'bg-emerald-400' },
        { to: '/teacher/ai-generator', label: 'AI Generator', short: 'AI', icon: Sparkles, color: 'bg-violet-400' },
    ],
    admin: [
        { to: '/admin', label: 'Dashboard Admin', short: 'Admin', icon: LayoutDashboard, end: true, color: 'bg-sky-400' },
        { to: '/teacher/students', label: 'Siswa, Progres & Rekap', short: 'Siswa', icon: Users, color: 'bg-lime-400' },
        { to: '/teacher', label: 'Panel LMS Guru', short: 'LMS', icon: BookOpen, color: 'bg-banten-gold', end: true },
        { to: '/admin/settings', label: 'Pengaturan Sistem', short: 'Atur', icon: Settings, color: 'bg-violet-400' },
    ],
};

const ROLE_INFO = {
    admin: { label: 'Administrator', preset: 'budayawan', hair: 'iket' },
    teacher: { label: 'Guru Bahasa Indonesia', preset: 'guru', hair: 'peci' },
    student: { label: 'Siswa Kelas XII', preset: 'siswa', hair: 'short' },
};

function Logo() {
    return (
        <span className="font-game leading-none tracking-wide inline-flex items-baseline gap-1 text-xl">
            <span className="text-white">BAHASA</span>
            <span className="text-banten-gold">PLAY</span>
            <span className="text-[10px] px-1 rounded-md bg-banten-teal text-white border-2 border-banten-night -rotate-6">.AI</span>
        </span>
    );
}

export default function AppShell({ children, title, subtitle, actions }) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const role = user?.role || 'student';
    const navItems = navByRole[role] || navByRole.student;
    const info = ROLE_INFO[role] || ROLE_INFO.student;
    const className = user?.school_classes?.[0]?.name;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-sky-500 via-sky-300 to-sky-200 text-slate-100 flex flex-col lg:flex-row">
            {/* Latar dunia game: langit, awan blok, matahari, lanskap Banten & rumput */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
                <div className="absolute -top-24 right-[18%] w-56 h-56 rounded-full bg-amber-200/70 blur-2xl" />
                <BlockCloud className="absolute top-1 left-[42%] w-28 sm:w-40 animate-float opacity-80" />
                <BlockCloud className="absolute top-44 right-[8%] w-24 sm:w-36 animate-float hidden sm:block" style={{ animationDelay: '1.2s' }} />
                <BlockCloud className="absolute top-[58%] left-[8%] w-24 animate-float hidden xl:block opacity-70" style={{ animationDelay: '2s' }} />
            </div>

            {/* Sidebar desktop: menu game */}
            <aside className="hidden lg:flex lg:w-[17rem] lg:flex-col lg:fixed lg:left-3 lg:top-3 lg:bottom-4 z-20 bg-banten-night border-4 border-white rounded-[2rem] shadow-[0_7px_0_0_#10213a] overflow-hidden">
                <div className="h-16 px-5 flex items-center gap-3 border-b-2 border-white/5">
                    <Link to="/" className="flex items-center gap-2.5">
                        <span className="w-10 h-10 rounded-xl bg-banten-gold border-2 border-white/80 flex items-center justify-center -rotate-6 btn-chunky">
                            <Gamepad2 className="w-5 h-5 text-banten-night" />
                        </span>
                        <span>
                            <Logo />
                            <span className="block text-[10px] font-bold text-amber-100/70 mt-0.5">SMAN 1 Ciruas</span>
                        </span>
                    </Link>
                </div>

                {/* Kartu pemain */}
                <div className="mx-4 mt-4 rounded-3xl bg-gradient-to-br from-banten-teal/40 to-slate-900 border-2 border-white/10 p-3 flex items-center gap-3 shadow-[0_5px_0_0_rgba(2,6,23,0.6)]">
                    <BlockyAvatar preset={info.preset} hair={info.hair} size={46} skin={user?.avatar_config?.skinColor || '#fde68a'} />
                    <div className="min-w-0">
                        <p className="font-game text-base text-white leading-tight truncate">{user?.name}</p>
                        <p className="text-[11px] font-bold text-amber-200/90 truncate">{role === 'student' && className ? `Kelas ${className}` : info.label}</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to + item.label}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-extrabold border-2 transition ${
                                        isActive
                                            ? 'bg-gradient-to-b from-amber-200 to-banten-gold text-banten-night border-banten-night shadow-[0_4px_0_0_rgba(0,0,0,0.45)]'
                                            : 'text-slate-300 border-transparent hover:bg-white/5 hover:border-white/10'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center border-2 border-banten-night/60 ${isActive ? 'bg-white/70' : item.color} text-banten-night`}>
                                            <Icon className="w-4 h-4" />
                                        </span>
                                        <span className="truncate">{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-4 border-t-2 border-white/5">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="btn-chunky w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-sm font-extrabold bg-gradient-to-b from-rose-400 to-rose-600 border-2 border-rose-900/60 text-white cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" /> Keluar
                    </button>
                </div>
            </aside>

            {/* Konten utama */}
            <div className="relative z-10 flex-1 min-w-0 lg:pl-72 flex flex-col min-h-screen pb-20 lg:pb-0">
                <header className="sticky top-2 z-20 mx-3 sm:mx-6 lg:mx-8 mt-3 rounded-2xl bg-banten-night border-4 border-white shadow-[0_6px_0_0_#10213a]">
                    <div className="h-14 px-4 sm:px-5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="lg:hidden w-9 h-9 shrink-0 rounded-xl bg-banten-gold border-2 border-white/80 flex items-center justify-center -rotate-6">
                                <Gamepad2 className="w-4 h-4 text-banten-night" />
                            </span>
                            <div className="min-w-0">
                                <h1 className="font-game text-base sm:text-xl text-white tracking-wide truncate leading-tight">{title || 'BAHASA PLAY.AI'}</h1>
                                {subtitle && <p className="text-[11px] text-slate-400 truncate hidden sm:block">{subtitle}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {actions}
                            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-banten-gold text-banten-night text-[11px] font-extrabold border-2 border-banten-night/40">
                                {info.label}
                            </span>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="lg:hidden p-2 rounded-xl bg-rose-500 border-2 border-rose-900/60 text-white btn-chunky"
                                aria-label="Keluar"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="relative flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">{children}</main>

                {/* Lanskap Banten di akhir halaman */}
                <div className="relative mt-10 h-36 sm:h-44 overflow-hidden pointer-events-none" aria-hidden="true">
                    <MasjidAgung className="absolute bottom-12 left-[6%] w-36 sm:w-52" />
                    <MenaraBanten className="absolute bottom-12 left-[38%] w-12 sm:w-20" />
                    <MasjidAgung className="absolute bottom-12 right-[4%] w-28 sm:w-40 hidden md:block" />
                    <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-b from-lime-400 to-green-600 border-t-4 border-banten-night">
                        <div
                            className="absolute inset-0 opacity-40"
                            style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.7) 0 3px, transparent 4px)', backgroundSize: '22px 16px' }}
                        />
                    </div>
                </div>
            </div>

            {/* Navigasi bawah HP: ubin game, bisa digeser bila menu banyak */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-banten-night border-t-4 border-white">
                <div className="flex gap-1.5 overflow-x-auto px-2 py-2 [scrollbar-width:none]">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to + item.label}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex-1 shrink-0 min-w-[64px] flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-2xl text-[10px] font-extrabold border-2 ${
                                        isActive ? 'bg-banten-gold text-banten-night border-banten-night' : 'text-slate-400 border-transparent'
                                    }`
                                }
                            >
                                <Icon className="w-5 h-5" />
                                <span className="whitespace-nowrap">{item.short}</span>
                            </NavLink>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
