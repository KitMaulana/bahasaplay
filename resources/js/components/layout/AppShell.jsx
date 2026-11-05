import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
    Gamepad2,
    LogOut,
    User,
    LayoutDashboard,
    BookOpen,
    HelpCircle,
    FileSpreadsheet,
    Sparkles,
    Users,
    Settings,
    Trophy,
    MapPin,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Badge from '../ui/Badge';

const navByRole = {
    student: [
        { to: '/student', label: 'Beranda & BAB', icon: LayoutDashboard, end: true },
        { to: '/student/achievements', label: 'Penghargaan', icon: Trophy },
        { to: '/lab', label: 'Lab 3D', icon: Gamepad2 },
    ],
    teacher: [
        { to: '/teacher', label: 'Ringkasan', icon: LayoutDashboard, end: true },
        { to: '/teacher/chapters', label: 'BAB & Materi', icon: BookOpen },
        { to: '/teacher/game-editor', label: 'Zona & NPC 3D', icon: MapPin },
        { to: '/teacher/questions', label: 'Bank Soal & Latihan', icon: HelpCircle },
        { to: '/teacher/exams', label: 'Zona Ujian', icon: FileSpreadsheet },
        { to: '/teacher/ai-generator', label: 'AI Generator', icon: Sparkles },
        { to: '/teacher/students', label: 'Siswa & Laporan', icon: Users },
    ],
    admin: [
        { to: '/admin', label: 'Dashboard Admin', icon: LayoutDashboard, end: true },
        { to: '/teacher', label: 'Panel LMS Guru', icon: BookOpen },
        { to: '/admin/settings', label: 'Pengaturan Sistem', icon: Settings },
    ],
};

export default function AppShell({ children, title, subtitle, actions }) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const role = user?.role || 'student';
    const navItems = navByRole[role] || navByRole.student;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const roleLabel =
        role === 'admin' ? 'Administrator' : role === 'teacher' ? 'Guru Bahasa Indonesia' : 'Siswa Kelas XII';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur">
                <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800/80">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Gamepad2 className="w-5 h-5 text-slate-950" />
                        </div>
                        <div>
                            <span className="font-extrabold tracking-tight text-base text-white">
                                BAHASA <span className="text-cyan-400">PLAY</span>
                            </span>
                            <p className="text-[10px] text-slate-400">SMAN 1 Ciruas</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                                        isActive
                                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30'
                                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                                    }`
                                }
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-sm">
                            {user?.name?.charAt(0) || <User className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{user?.username}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar Aplikasi</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen pb-20 lg:pb-8">
                <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur sticky top-0 z-20 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="lg:hidden w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                            <Gamepad2 className="w-4 h-4 text-slate-950" />
                        </div>
                        <div>
                            <h1 className="text-sm sm:text-lg font-extrabold text-white truncate">
                                {title || 'Dashboard BAHASA PLAY'}
                            </h1>
                            {subtitle && (
                                <p className="text-[11px] text-slate-400 hidden sm:block">{subtitle}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {actions}
                        <Badge variant={role === 'admin' ? 'warning' : role === 'teacher' ? 'info' : 'success'}>
                            {roleLabel}
                        </Badge>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="lg:hidden p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300"
                            aria-label="Keluar"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-900/95 border-t border-slate-800 backdrop-blur px-2 py-1.5 flex items-center justify-around">
                {navItems.slice(0, 5).map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold min-w-[56px] min-h-[44px] ${
                                    isActive ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400'
                                }`
                            }
                        >
                            <Icon className="w-4 h-4" />
                            <span className="truncate max-w-[68px]">{item.label.split(' ')[0]}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
}
