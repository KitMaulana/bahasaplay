import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, Lock, UserCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/ui/Button';

export default function LoginPage() {
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.login);
    const isLoading = useAuthStore((s) => s.isLoading);

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { redirect_to } = await login(identifier, password);
            navigate(redirect_to || '/student');
        } catch (err) {
            const msg =
                err?.response?.data?.errors?.identifier?.[0] ||
                err?.response?.data?.message ||
                'Gagal masuk. Periksa kembali NISN/Email/Username dan kata sandi Anda.';
            setError(msg);
        }
    };

    const fillDemo = (idVal, passVal) => {
        setIdentifier(idVal);
        setPassword(passVal);
        setError('');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <Link to="/" className="inline-flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/25">
                            <Gamepad2 className="w-7 h-7 text-slate-950" />
                        </div>
                        <div className="text-left">
                            <h1 className="text-2xl font-extrabold tracking-tight text-white">
                                BAHASA <span className="text-cyan-400">PLAY</span>
                            </h1>
                            <p className="text-xs text-slate-400">Mainkan gamenya, pelajari bahasanya.</p>
                        </div>
                    </Link>
                </div>

                <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5">
                    <div>
                        <h2 className="text-lg font-bold text-white">Masuk ke Akun Anda</h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Siswa menggunakan <b>NISN</b>, Guru menggunakan <b>Email</b>, Admin menggunakan{' '}
                            <b>Username</b>.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-300">
                                NISN / Email / Username
                            </label>
                            <div className="relative">
                                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="text"
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="Contoh: 0081234501 atau guru@smancir1.sch.id"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-300">Kata Sandi</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan kata sandi"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400"
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                            <span>{isLoading ? 'Memproses...' : 'Masuk Aplikasi'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </form>

                    <div className="pt-4 border-t border-slate-800 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Akses Cepat Akun Demo (Klik untuk mengisi):</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => fillDemo('0081234501', '0081234501')}
                                className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-400/50 text-left transition cursor-pointer"
                            >
                                <p className="text-[11px] font-bold text-emerald-300">Siswa XII-1</p>
                                <p className="text-[10px] text-slate-400 truncate">0081234501</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemo('guru@smancir1.sch.id', 'smancir123')}
                                className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400/50 text-left transition cursor-pointer"
                            >
                                <p className="text-[11px] font-bold text-cyan-300">Guru Mapel</p>
                                <p className="text-[10px] text-slate-400 truncate">smancir123</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemo('admin', 'admin123')}
                                className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400/50 text-left transition cursor-pointer"
                            >
                                <p className="text-[11px] font-bold text-amber-300">Admin</p>
                                <p className="text-[10px] text-slate-400 truncate">admin123</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
