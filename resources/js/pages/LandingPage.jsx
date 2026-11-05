import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Gamepad2, BookOpen, ShieldCheck, Sparkles, ArrowRight, Activity } from 'lucide-react';
import api from '../lib/axios';

export default function LandingPage() {
    const { data: health, isLoading } = useQuery({
        queryKey: ['health'],
        queryFn: async () => {
            const response = await api.get('/health');
            return response.data;
        },
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                            <Gamepad2 className="w-6 h-6 text-slate-950" />
                        </div>
                        <div>
                            <span className="font-extrabold tracking-tight text-lg text-white">
                                BAHASA <span className="text-cyan-400">PLAY</span>
                            </span>
                            <p className="text-[11px] text-slate-400 hidden sm:block">
                                SMAN 1 Ciruas · Bahasa Indonesia Kelas XII
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/lab"
                            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-700 hover:border-cyan-400/60 text-slate-200 hover:text-cyan-300 transition"
                        >
                            Uji Lab 3D
                        </Link>
                        <Link
                            to="/login"
                            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 transition shadow-lg shadow-cyan-500/20"
                        >
                            Masuk Aplikasi
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid lg:grid-cols-12 gap-10 items-center">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                            <Sparkles className="w-4 h-4" />
                            <span>Hello BAHASA PLAY · Game-Based LMS Kelas XII</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                            Mainkan gamenya,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400">
                                pelajari bahasanya.
                            </span>
                        </h1>
                        <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                            Platform Learning Management System (LMS) berbasis dunia eksplorasi 3D
                            interaktif untuk Pembelajaran Bahasa Indonesia SMA Kelas XII di SMAN 1 Ciruas.
                        </p>

                        <div className="flex flex-wrap gap-3 pt-2">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-xl shadow-cyan-500/25 hover:brightness-110 transition"
                            >
                                <span>Mulai Petualangan Belajar</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/lab"
                                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold bg-slate-900 border border-slate-700 text-slate-200 hover:border-cyan-400/60 transition"
                            >
                                <Gamepad2 className="w-4 h-4 text-cyan-400" />
                                <span>Coba Dunia 3D (/lab)</span>
                            </Link>
                        </div>

                        <div className="pt-4 flex items-center gap-3 text-xs text-slate-400">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            <span>
                                Status Server API:{' '}
                                {isLoading
                                    ? 'Memeriksa...'
                                    : health?.data?.status === 'ok'
                                      ? 'Terhubung (Laravel 12 + Sanctum SPA)'
                                      : 'Siap'}
                            </span>
                        </div>
                    </div>

                    <div className="lg:col-span-5 grid sm:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                            <BookOpen className="w-7 h-7 text-cyan-400" />
                            <h3 className="font-bold text-white">6 BAB Kurikulum Merdeka</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                CV & Lamaran Kerja, Teks Prosedur, AI & Eksplanasi, Kearifan Lokal Baduy, BAB Dinamis Guru, dan Novel.
                            </p>
                        </div>
                        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                            <Gamepad2 className="w-7 h-7 text-indigo-400" />
                            <h3 className="font-bold text-white">Dunia 3D Interaktif</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Jelajahi Kota Cilegon, Banten Lama, Gading Serpong, Baduy, hingga SMAN 1 Ciruas bersama NPC pemateri.
                            </p>
                        </div>
                        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                            <ShieldCheck className="w-7 h-7 text-emerald-400" />
                            <h3 className="font-bold text-white">Latihan & Ujian Resmi</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Latihan soal dengan syarat KKM 75 dan Zona Ujian resmi ber-timer server yang aman dari kecurangan.
                            </p>
                        </div>
                        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                            <Sparkles className="w-7 h-7 text-amber-400" />
                            <h3 className="font-bold text-white">AI Question Generator</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Terintegrasi dengan Google Gemini API untuk membantu guru menyusun soal pilihan ganda A–E berkualitas.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
