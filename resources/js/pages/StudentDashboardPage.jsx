import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Gamepad2,
    BookOpen,
    HelpCircle,
    FileCheck2,
    Trophy,
    MapPin,
    Lock,
    CheckCircle2,
    Sparkles,
    History,
    User,
    Eye,
    Clock,
    Award,
} from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import BlockyAvatar from '../components/game/BlockyAvatar';
import AppShell from '../components/layout/AppShell';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';

export default function StudentDashboardPage() {
    const location = useLocation();
    const queryClient = useQueryClient();
    const { setUser } = useAuthStore();
    const isAchievementsTab = location.pathname.includes('/achievements');

    const [toast, setToast] = useState(null);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [reviewAttempt, setReviewAttempt] = useState(null);
    const [shirtColor, setShirtColor] = useState('#06b6d4');
    const [skinColor, setSkinColor] = useState('#fde68a');
    const [newPassword, setNewPassword] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['student-dashboard'],
        queryFn: async () => {
            const res = await api.get('/student/dashboard');
            return res.data.data;
        },
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (payload) => {
            const res = await api.put('/me', payload);
            return res.data;
        },
        onSuccess: (res) => {
            setUser(res.data);
            queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
            setProfileModalOpen(false);
            setNewPassword('');
            setToast({ message: res.message || 'Profil & Avatar 3D diperbarui.', type: 'success' });
        },
        onError: (err) => {
            setToast({
                message: err?.response?.data?.message || 'Gagal memperbarui profil.',
                type: 'error',
            });
        },
    });

    const openReviewModal = async (attemptId) => {
        try {
            const res = await api.get(`/student/attempts/${attemptId}`);
            setReviewAttempt(res.data.data);
        } catch (err) {
            setToast({
                message: err?.response?.data?.message || 'Gagal memuat detail percobaan.',
                type: 'error',
            });
        }
    };

    if (isLoading || !data) {
        return (
            <AppShell title="Dashboard Siswa" subtitle="Memuat progres belajar dan zona 3D...">
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
                    <p className="text-sm text-slate-400">Memuat data pembelajaran...</p>
                </div>
            </AppShell>
        );
    }

    const {
        student,
        total_progress_percent,
        kkm_default,
        chapters = [],
        achievements = [],
        practice_history = [],
        exam_history = [],
        activity_logs = [],
    } = data;

    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    const openAvatarModal = () => {
        setShirtColor(student?.avatar_config?.shirtColor || '#06b6d4');
        setSkinColor(student?.avatar_config?.skinColor || '#fde68a');
        setNewPassword('');
        setProfileModalOpen(true);
    };

    return (
        <AppShell
            title={`Halo, ${student.name}!`}
            subtitle={`NISN: ${student.nisn} · Kelas ${student.class_name}`}
            actions={
                <Button variant="secondary" size="sm" onClick={openAvatarModal}>
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Avatar 3D & Sandi</span>
                </Button>
            }
        >
            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

            {/* Kartu Profil, Level XP & Progres Total */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-banten-teal/30 border-banten-gold/40">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="shrink-0 rounded-2xl bg-gradient-to-b from-sky-300 to-banten-teal border-2 border-white/30 p-1.5 animate-float">
                                <BlockyAvatar preset="siswa" hair="short" size={64} skin={student?.avatar_config?.skinColor || '#fde68a'} />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="info">Kelas {student.class_name}</Badge>
                                    <Badge variant="success">Level {student.level}</Badge>
                                    <Badge variant="warning">{student.xp} XP</Badge>
                                </div>
                                <h2 className="font-game text-2xl sm:text-3xl text-white mt-1 tracking-wide">
                                    {student.name}
                                </h2>
                                <p className="text-xs text-slate-400">
                                    NISN: <span className="font-mono text-slate-200">{student.nisn}</span> · KKM Bahasa Indonesia: <span className="font-bold text-cyan-300">{kkm_default}</span>
                                </p>
                            </div>
                        </div>

                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800/80">
                        <ProgressBar
                            value={total_progress_percent}
                            label="Total Progres Ketuntasan Bahasa Indonesia Kelas XII"
                        />
                    </div>
                </Card>

                <Card className="flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                                Penghargaan & Lencana
                            </p>
                            <h3 className="text-2xl font-extrabold text-white mt-1">
                                {unlockedCount} / {achievements.length}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
                            <Trophy className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        Jelajahi dunia 3D, selesaikan materi, raih nilai ≥ {kkm_default} pada latihan dan ujian untuk membuka semua penghargaan!
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                        {achievements.map((ach) => (
                            <span
                                key={ach.key}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                                    ach.unlocked
                                        ? 'bg-amber-500/15 border-amber-400/40 text-amber-300'
                                        : 'bg-slate-800/60 border-slate-800 text-slate-500'
                                }`}
                            >
                                {ach.unlocked ? '★ ' : '🔒 '}
                                {ach.name}
                            </span>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Galeri Penghargaan (halaman tersendiri: /student/achievements) */}
            {isAchievementsTab && (
                <div className="space-y-4">
                    <Card
                        icon={Trophy}
                        title="Galeri Penghargaan"
                        subtitle={`${unlockedCount} dari ${achievements.length} lencana sudah kamu raih. Kumpulkan semuanya!`}
                        action={
                            <Link to="/student" className="btn-chunky px-4 py-2 rounded-2xl bg-gradient-to-b from-cyan-300 to-blue-600 border-2 border-blue-900/60 text-white text-sm font-extrabold">
                                Kembali ke Beranda
                            </Link>
                        }
                    >
                        <ProgressBar value={achievements.length ? (unlockedCount / achievements.length) * 100 : 0} color="gold" size="lg" label="Lencana terkumpul" />
                    </Card>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {achievements.map((ach) => (
                            <div
                                key={ach.id}
                                className={`rounded-3xl border-2 p-4 shadow-[0_5px_0_0_rgba(2,6,23,0.6)] ${
                                    ach.unlocked ? 'bg-gradient-to-br from-amber-300/25 to-slate-900 border-banten-gold' : 'bg-slate-900/60 border-white/10'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-banten-night/60 -rotate-3 ${ach.unlocked ? 'bg-banten-gold text-banten-night animate-float' : 'bg-slate-800 text-slate-500'}`}>
                                        <Award className="w-7 h-7" />
                                    </div>
                                    <Badge variant={ach.unlocked ? 'gold' : 'neutral'}>{ach.unlocked ? 'TERBUKA' : 'TERKUNCI'} · +{ach.xp} XP</Badge>
                                </div>
                                <h4 className={`font-game text-xl mt-3 ${ach.unlocked ? 'text-white' : 'text-slate-400'}`}>{ach.name}</h4>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ach.description}</p>
                                {ach.unlocked && ach.earned_at && (
                                    <p className="text-[11px] font-bold text-amber-200 mt-2">
                                        Diraih {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'Asia/Jakarta' }).format(new Date(ach.earned_at))}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isAchievementsTab && (
                <>
            {/* Daftar 6 BAB Pembelajaran & Dunia Game 3D */}
            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="rounded-2xl bg-banten-night border-4 border-white shadow-[0_5px_0_0_#10213a] px-4 py-2.5">
                        <h2 className="font-game text-xl text-white tracking-wide">
                            Peta BAB & Zona Dunia Game 3D (BAB 1 – BAB 6)
                        </h2>
                        <p className="text-xs text-slate-300">
                            Setiap BAB memiliki Zona Belajar & Latihan terpadu serta Zona Ujian resmi yang terbuka setelah nilai latihan mencapai KKM ({kkm_default}).
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {chapters.map((ch) => {
                        const isPublished = ch.status === 'published';
                        const learningDone = ch.learning_status === 'completed';
                        const practicePassed = ch.practice_status === 'passed';
                        const examUnlocked =
                            ch.exam_status === 'unlocked' || ch.exam_status === 'completed';
                        const examPassed =
                            ch.exam_score !== null && ch.exam_score >= (ch.kkm || kkm_default);

                        return (
                            <div
                                key={ch.id}
                                className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition ${
                                    isPublished
                                        ? 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40 shadow-lg'
                                        : 'bg-slate-900/40 border-slate-800/60 opacity-75'
                                }`}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                                            BAB {ch.number}
                                        </span>
                                        <Badge variant={isPublished ? (examPassed ? 'success' : 'info') : 'warning'}>
                                            {!isPublished
                                                ? 'Dikonfigurasi Guru'
                                                : examPassed
                                                ? 'Tuntas KKM'
                                                : `${ch.progress_percent}% Selesai`}
                                        </Badge>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-extrabold text-white leading-snug">
                                            {ch.title}
                                        </h3>
                                        <p className="text-xs text-cyan-400 font-semibold flex items-center gap-1.5 mt-1">
                                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                                            <span>Latar 3D: {ch.setting_location || 'Ditentukan Guru'}</span>
                                        </p>
                                    </div>

                                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                        {ch.description}
                                    </p>

                                    {/* Status 3 Tahap dalam 2 Zona Terpadu */}
                                    <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 flex items-center gap-1.5">
                                                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                                                <span>1. Zona Belajar ({ch.materials_completed}/{ch.materials_total} materi)</span>
                                            </span>
                                            <span
                                                className={`font-bold ${
                                                    learningDone ? 'text-emerald-400' : 'text-slate-300'
                                                }`}
                                            >
                                                {learningDone ? 'Selesai ✓' : 'Eksplorasi'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 flex items-center gap-1.5">
                                                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                                                <span>2. Latihan Soal (KKM {ch.kkm})</span>
                                            </span>
                                            <span
                                                className={`font-bold ${
                                                    practicePassed
                                                        ? 'text-emerald-400'
                                                        : ch.best_practice_score !== null
                                                        ? 'text-amber-300'
                                                        : 'text-slate-500'
                                                }`}
                                            >
                                                {ch.best_practice_score !== null
                                                    ? `Skor: ${ch.best_practice_score}`
                                                    : learningDone
                                                    ? 'Siap Mulai'
                                                    : 'Baca Materi'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 flex items-center gap-1.5">
                                                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                                                <span>3. Zona Ujian Resmi</span>
                                            </span>
                                            <span
                                                className={`font-bold ${
                                                    examPassed
                                                        ? 'text-emerald-400'
                                                        : examUnlocked
                                                        ? 'text-cyan-300'
                                                        : 'text-slate-500'
                                                }`}
                                            >
                                                {ch.exam_score !== null
                                                    ? `Nilai: ${ch.exam_score}`
                                                    : examUnlocked
                                                    ? 'Terbuka'
                                                    : 'Terkunci 🔒'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    {isPublished ? (
                                        <Link
                                            to={`/student/chapters/${ch.id}/play`}
                                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition"
                                        >
                                            <Gamepad2 className="w-4 h-4" />
                                            <span>Masuk Dunia 3D & Zona Belajar</span>
                                        </Link>
                                    ) : (
                                        <div className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 font-semibold text-xs flex items-center justify-center gap-2">
                                            <Lock className="w-3.5 h-3.5" />
                                            <span>Menunggu Publikasi Guru</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Riwayat Latihan Soal & Riwayat Ujian Resmi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card
                    title="Riwayat Latihan Soal (Practice Zone)"
                    subtitle="Latihan dapat diulang untuk mencapai KKM 75 dan membuka Zona Ujian"
                >
                    {practice_history.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center">
                            Belum ada riwayat latihan soal. Masuk ke BAB 1 untuk memulai eksplorasi dan latihan!
                        </p>
                    ) : (
                        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                            {practice_history.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-white truncate">
                                            {item.chapter_title}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            Benar {item.correct_count}/{item.total_questions} soal ·{' '}
                                            {item.submitted_at
                                                ? new Date(item.submitted_at).toLocaleString('id-ID')
                                                : '-'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge variant={item.passed ? 'success' : 'warning'}>
                                            Skor {item.score}
                                        </Badge>
                                        <button
                                            type="button"
                                            onClick={() => openReviewModal(item.id)}
                                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 cursor-pointer"
                                            title="Lihat Pembahasan"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card
                    title="Riwayat Ujian Resmi (Examination Zone)"
                    subtitle="Nilai resmi menggunakan skor tertinggi dari kesempatan ujian yang diizinkan"
                >
                    {exam_history.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center">
                            Belum ada riwayat ujian resmi yang diselesaikan.
                        </p>
                    ) : (
                        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                            {exam_history.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-white truncate">
                                            {item.exam_title || item.chapter_title}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            Benar {item.correct_count}/{item.total_questions} soal ·{' '}
                                            {item.submitted_at
                                                ? new Date(item.submitted_at).toLocaleString('id-ID')
                                                : '-'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge variant={item.passed ? 'success' : 'danger'}>
                                            Nilai {item.score}
                                        </Badge>
                                        <button
                                            type="button"
                                            onClick={() => openReviewModal(item.id)}
                                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 cursor-pointer"
                                            title="Lihat Pembahasan"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Riwayat Aktivitas Siswa */}
            <Card title="Aktivitas Pembelajaran Terbaru" subtitle="Catatan otomatis progres belajar dan kuis Anda">
                {activity_logs.length === 0 ? (
                    <p className="text-xs text-slate-400">Belum ada aktivitas tercatat.</p>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {activity_logs.slice(0, 6).map((log) => (
                            <div
                                key={log.id}
                                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3 text-xs"
                            >
                                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-200 truncate">{log.action}</p>
                                    <p className="text-[10px] text-slate-500">
                                        {log.created_at
                                            ? new Date(log.created_at).toLocaleString('id-ID')
                                            : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

                </>
            )}

            {/* Modal Pembahasan Soal */}
            <Modal
                open={!!reviewAttempt}
                onClose={() => setReviewAttempt(null)}
                title={
                    reviewAttempt
                        ? `Pembahasan ${reviewAttempt.type === 'exam' ? 'Ujian' : 'Latihan'} — Skor: ${reviewAttempt.score}`
                        : 'Pembahasan'
                }
                size="lg"
            >
                {reviewAttempt && (
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                        <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-between text-xs">
                            <span>
                                Jawaban Benar:{' '}
                                <b className="text-white">
                                    {reviewAttempt.correct_count} dari {reviewAttempt.total_questions} soal
                                </b>
                            </span>
                            <Badge variant={reviewAttempt.passed ? 'success' : 'warning'}>
                                {reviewAttempt.passed ? 'TUNTAS KKM' : 'BELUM TUNTAS'}
                            </Badge>
                        </div>

                        {reviewAttempt.questions?.map((q) => (
                            <div
                                key={q.attempt_question_id}
                                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-cyan-400">
                                        Soal #{q.order}
                                    </span>
                                    <Badge variant={q.is_correct ? 'success' : 'danger'}>
                                        {q.is_correct
                                            ? `Benar (${q.selected_label})`
                                            : `Jawaban Anda: ${q.selected_label || '-'} | Kunci: ${q.correct_label}`}
                                    </Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-white font-medium">{q.stem}</p>
                                {q.explanation && (
                                    <p className="text-xs text-slate-300 bg-cyan-500/10 border border-cyan-500/20 p-2.5 rounded-lg">
                                        <b className="text-cyan-300">Pembahasan:</b> {q.explanation}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Modal>

            {/* Modal Kustomisasi Avatar 3D & Ganti Kata Sandi */}
            <Modal
                open={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
                title="Kustomisasi Karakter 3D & Kata Sandi"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const payload = {
                            avatar_config: { shirtColor, skinColor },
                        };
                        if (newPassword.trim()) {
                            payload.password = newPassword.trim();
                        }
                        updateProfileMutation.mutate(payload);
                    }}
                    className="space-y-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1.5">
                                Warna Baju Avatar 3D
                            </label>
                            <input
                                type="color"
                                value={shirtColor}
                                onChange={(e) => setShirtColor(e.target.value)}
                                className="w-full h-10 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1.5">
                                Warna Kulit Avatar 3D
                            </label>
                            <input
                                type="color"
                                value={skinColor}
                                onChange={(e) => setSkinColor(e.target.value)}
                                className="w-full h-10 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Ganti Kata Sandi Baru (Kosongkan jika tetap menggunakan NISN/sandi lama)
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimal 4 karakter..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setProfileModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </Modal>
        </AppShell>
    );
}
