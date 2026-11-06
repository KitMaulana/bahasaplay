import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Gamepad2, KeyRound, Play, UserRound } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import BlockyAvatar from '../components/game/BlockyAvatar';
import { BlockCloud, MasjidAgung, MenaraBanten } from '../components/game/BantenArt';

/*
 * Halaman masuk bernuansa game (senada dengan halaman utama BAHASA PLAY.AI):
 * pilih peran seperti memilih karakter, lalu masuk dengan NISN / Email / Username.
 */

const ROLES = [
    { key: 'student', label: 'Siswa', field: 'NISN', placeholder: 'Contoh: 0081234501', preset: 'siswa', hair: 'short', hint: 'Kata sandi awal = NISN kamu.' },
    { key: 'teacher', label: 'Guru', field: 'Email / Username', placeholder: 'guru@smancir1.sch.id', preset: 'guru', hair: 'peci', hint: 'Gunakan email atau username guru.' },
    { key: 'admin', label: 'Admin', field: 'Username', placeholder: 'admin', preset: 'budayawan', hair: 'iket', hint: 'Khusus pengelola sistem.' },
];

const DEMO = {
    student: ['0081234501', '0081234501'],
    teacher: ['guru@smancir1.sch.id', 'smancir123'],
    admin: ['admin', 'admin123'],
};

export default function LoginPage() {
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.login);
    const isLoading = useAuthStore((s) => s.isLoading);

    const [role, setRole] = useState('student');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const r = ROLES.find((x) => x.key === role);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { redirect_to } = await login(identifier, password, role);
            navigate(redirect_to || '/student');
        } catch (err) {
            setError(
                err?.response?.data?.errors?.identifier?.[0] ||
                    err?.response?.data?.message ||
                    'Gagal masuk. Periksa kembali NISN/Email/Username dan kata sandi.'
            );
        }
    };

    const fillDemo = () => {
        const [id, pass] = DEMO[role];
        setIdentifier(id);
        setPassword(pass);
        setError('');
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200 text-banten-night flex flex-col">
            <BlockCloud className="absolute top-16 left-[5%] w-24 sm:w-40 animate-float opacity-70 sm:opacity-100" />
            <BlockCloud className="absolute top-32 right-[6%] w-24 sm:w-36 animate-float hidden sm:block" style={{ animationDelay: '1s' }} />
            <div className="absolute -top-20 right-[25%] w-48 h-48 rounded-full bg-amber-200/70 blur-2xl" />

            {/* Lanskap Banten di bawah */}
            <div className="absolute bottom-0 inset-x-0 h-40 sm:h-48 pointer-events-none">
                <MasjidAgung className="absolute bottom-16 left-[2%] sm:left-[8%] w-32 sm:w-48 opacity-95" />
                <MenaraBanten className="absolute bottom-16 right-[4%] sm:right-[10%] w-12 sm:w-20" />
                <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-lime-400 to-green-600 border-t-4 border-banten-night">
                    <div
                        className="absolute inset-0 opacity-40"
                        style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.7) 0 3px, transparent 4px)', backgroundSize: '22px 16px' }}
                    />
                </div>
            </div>

            {/* Header */}
            <div className="relative z-10 px-4 sm:px-6 pt-4 flex items-center justify-between">
                <Link to="/" className="btn-chunky inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border-2 border-banten-night font-game text-sm">
                    <ArrowLeft className="w-4 h-4" /> Beranda
                </Link>
                <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-banten-night text-amber-100 text-xs font-extrabold border-2 border-banten-gold">
                    SMAN 1 Ciruas · Bahasa Indonesia Kelas XII
                </span>
            </div>

            <main className="relative z-10 flex-1 flex items-start sm:items-center justify-center px-4 pt-6 pb-44 sm:pb-52">
                <div className="w-full max-w-md">
                    <div className="text-center mb-4 animate-pop">
                        <Link to="/" className="inline-flex items-center gap-2">
                            <span className="hidden sm:flex w-12 h-12 rounded-2xl bg-banten-gold border-4 border-white items-center justify-center -rotate-6 btn-chunky">
                                <Gamepad2 className="w-6 h-6 text-banten-night" />
                            </span>
                            <span className="font-game text-[2.1rem] sm:text-5xl leading-none tracking-wide inline-flex items-baseline gap-1">
                                <span className="text-white text-stroke-game" style={{ WebkitTextStrokeWidth: 4 }}>BAHASA</span>
                                <span className="text-banten-gold text-stroke-game" style={{ WebkitTextStrokeWidth: 4 }}>PLAY</span>
                                <span className="text-base px-1.5 rounded-lg bg-banten-teal text-white border-2 border-banten-night -rotate-6">.AI</span>
                            </span>
                        </Link>
                        <p className="font-game text-sm sm:text-base text-banten-night/80 mt-1">Mainkan gamenya, pelajari bahasanya.</p>
                    </div>

                    <div className="rounded-[2rem] bg-white border-4 border-banten-night shadow-[0_10px_0_0_#10213a] overflow-hidden">
                        <div className="relative bg-banten-night px-5 py-3 text-center">
                            <div className="absolute inset-0 bg-batik-banten opacity-20" />
                            <h1 className="relative font-game text-2xl text-white tracking-wide">Masuk ke Dunia</h1>
                            <p className="relative text-[11px] font-bold text-amber-200/90">Pilih peranmu dulu, ya!</p>
                        </div>

                        <div className="p-5 sm:p-6 space-y-4">
                            {/* Pilih peran seperti memilih karakter */}
                            <div className="grid grid-cols-3 gap-2">
                                {ROLES.map((x) => {
                                    const active = role === x.key;
                                    return (
                                        <button
                                            key={x.key}
                                            type="button"
                                            onClick={() => {
                                                setRole(x.key);
                                                setIdentifier('');
                                                setPassword('');
                                                setError('');
                                            }}
                                            className={`btn-chunky relative flex flex-col items-center pt-2 pb-1.5 rounded-2xl border-4 cursor-pointer transition ${
                                                active ? 'bg-gradient-to-b from-amber-100 to-banten-gold border-banten-night' : 'bg-slate-100 border-slate-300 opacity-80 hover:opacity-100'
                                            }`}
                                            aria-pressed={active}
                                        >
                                            <BlockyAvatar preset={x.preset} hair={x.hair} size={46} />
                                            <span className="font-game text-sm mt-1">{x.label}</span>
                                            {active && <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-lime-400 border-2 border-banten-night text-xs font-black flex items-center justify-center">✓</span>}
                                        </button>
                                    );
                                })}
                            </div>

                            {error && <div className="animate-bubble-in p-3 rounded-2xl bg-rose-50 border-2 border-rose-400 text-xs text-rose-700 font-bold">{error}</div>}

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <label className="block">
                                    <span className="block text-xs font-extrabold mb-1">{r.field}</span>
                                    <span className="relative block">
                                        <UserRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            required
                                            autoComplete="username"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            placeholder={r.placeholder}
                                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-300 text-sm font-bold text-banten-night focus:outline-none focus:border-banten-teal focus:bg-white"
                                        />
                                    </span>
                                </label>
                                <label className="block">
                                    <span className="block text-xs font-extrabold mb-1">Kata Sandi</span>
                                    <span className="relative block">
                                        <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            required
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Masukkan kata sandi"
                                            className="w-full pl-11 pr-12 py-3 rounded-2xl bg-slate-50 border-2 border-slate-300 text-sm font-bold text-banten-night focus:outline-none focus:border-banten-teal focus:bg-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass((v) => !v)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-banten-night cursor-pointer"
                                            aria-label={showPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                        >
                                            {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </span>
                                    <span className="block text-[11px] text-slate-500 mt-1">{r.hint}</span>
                                </label>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-chunky w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-b from-lime-300 to-green-600 border-4 border-banten-night font-game text-2xl text-white cursor-pointer disabled:opacity-70"
                                >
                                    <Play className="w-6 h-6 fill-white" />
                                    {isLoading ? 'Memuat...' : 'MAIN!'}
                                </button>
                            </form>

                            <div className="rounded-2xl bg-amber-50 border-2 border-banten-gold p-3 space-y-2">
                                <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-800 uppercase tracking-wide">
                                    Akun Demo {r.label} · Masa Uji Coba
                                </p>
                                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                                    <dt className="font-bold text-slate-500">{r.field.split(' / ')[0]}</dt>
                                    <dd className="font-mono font-extrabold text-banten-night break-all">{DEMO[role][0]}</dd>
                                    <dt className="font-bold text-slate-500">Kata sandi</dt>
                                    <dd className="font-mono font-extrabold text-banten-night">{DEMO[role][1]}</dd>
                                </dl>
                                <button
                                    type="button"
                                    onClick={fillDemo}
                                    className="w-full py-1.5 rounded-xl bg-banten-gold text-banten-night text-xs font-extrabold border-2 border-banten-night/60 cursor-pointer hover:brightness-105"
                                >
                                    Isi otomatis akun demo ini
                                </button>
                                <p className="text-[10px] text-amber-800/80">Akun ini hanya untuk uji coba dan akan diganti saat aplikasi dipakai resmi.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
