import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Canvas } from '@react-three/fiber';
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Clock,
    Compass,
    Gamepad2,
    Gauge,
    Hand,
    HelpCircle,
    Lock,
    MapPin,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import api from '../lib/axios';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import ZoneScene from './ZoneScene';
import Joystick from './hud/Joystick';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';

export default function GameRoot() {
    const { chapterId } = useParams();
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);
    const fps = useGameStore((s) => s.fps);
    const keysRef = useRef({});

    const [viewMode, setViewMode] = useState('3d'); // '3d' | '2d' | 'practice' | 'exam'
    const [nearbyTarget, setNearbyTarget] = useState(null);
    const [activeNpc, setActiveNpc] = useState(null);
    const [activeMaterial, setActiveMaterial] = useState(null);
    const [activeAttempt, setActiveAttempt] = useState(null);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [remainingSec, setRemainingSec] = useState(0);
    const [toast, setToast] = useState(null);

    const { data: chapter, isLoading } = useQuery({
        queryKey: ['student-chapter', chapterId],
        queryFn: async () => {
            const res = await api.get(`/student/chapters/${chapterId}`);
            return res.data.data;
        },
    });

    const completeMaterialMutation = useMutation({
        mutationFn: async (materialId) => {
            const res = await api.post(`/student/materials/${materialId}/complete`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-chapter', chapterId] });
            queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
            setToast({ message: 'Materi selesai dipelajari! +15 XP', type: 'success' });
        },
    });

    const startPracticeMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post(`/student/chapters/${chapterId}/practice/start`);
            return res.data.data;
        },
        onSuccess: (attempt) => {
            setActiveAttempt(attempt);
            setCurrentQIndex(0);
            setViewMode('practice');
        },
        onError: (err) => {
            const msg =
                err?.response?.data?.errors?.chapter?.[0] ||
                err?.response?.data?.message ||
                'Gagal memulai latihan soal.';
            setToast({ message: msg, type: 'error' });
        },
    });

    const startExamMutation = useMutation({
        mutationFn: async (examId) => {
            const res = await api.post(`/student/exams/${examId}/start`);
            return res.data.data;
        },
        onSuccess: (attempt) => {
            setActiveAttempt(attempt);
            setCurrentQIndex(0);
            setRemainingSec(attempt.remaining_seconds || 2700);
            setViewMode('exam');
        },
        onError: (err) => {
            const msg =
                err?.response?.data?.errors?.exam?.[0] ||
                err?.response?.data?.message ||
                'Tidak dapat memulai ujian.';
            setToast({ message: msg, type: 'error' });
        },
    });

    const saveAnswerMutation = useMutation({
        mutationFn: async ({ attemptId, attemptQuestionId, selectedLabel }) => {
            const res = await api.put(`/student/attempts/${attemptId}/answers`, {
                attempt_question_id: attemptQuestionId,
                selected_label: selectedLabel,
            });
            return res.data;
        },
    });

    const submitAttemptMutation = useMutation({
        mutationFn: async (attemptId) => {
            const res = await api.post(`/student/attempts/${attemptId}/submit`);
            return res.data.data;
        },
        onSuccess: (gradedAttempt) => {
            setActiveAttempt(gradedAttempt);
            queryClient.invalidateQueries({ queryKey: ['student-chapter', chapterId] });
            queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
            setToast({
                message: `Selesai! Skor Anda: ${gradedAttempt.score} (${
                    gradedAttempt.passed ? 'LULUS KKM' : 'Belum Mencapai KKM 75'
                })`,
                type: gradedAttempt.passed ? 'success' : 'error',
            });
        },
    });

    // Timer ujian sinkron server + auto-submit ketika waktu habis
    useEffect(() => {
        if (viewMode !== 'exam' || !activeAttempt || activeAttempt.status !== 'in_progress') {
            return undefined;
        }
        const timer = setInterval(() => {
            setRemainingSec((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    submitAttemptMutation.mutate(activeAttempt.id);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [viewMode, activeAttempt]);

    const handleTriggerTarget = (target) => {
        if (!target || !chapter) return;

        if (target.kind === 'npc') {
            const npc = target.payload;
            setActiveNpc(npc);
            const openAction = npc.dialogues?.[0]?.nodes?.[0]?.actions?.find(
                (a) => a.type === 'open_material'
            );
            if (openAction) {
                const mat = chapter.materials.find((m) => m.id === openAction.material_id);
                if (mat) setActiveMaterial(mat);
            } else if (chapter.materials.length > 0) {
                const unread =
                    chapter.materials.find((m) => !m.is_completed) || chapter.materials[0];
                setActiveMaterial(unread);
            }
            return;
        }

        if (target.kind === 'interactable') {
            const item = target.payload;
            const mat =
                chapter.materials.find((m) => m.id === item.material_id) ||
                chapter.materials[0];
            if (mat) setActiveMaterial(mat);
            return;
        }

        if (target.kind === 'portal_practice') {
            startPracticeMutation.mutate();
            return;
        }

        if (target.kind === 'portal_exam') {
            const activeExam = chapter.exams?.[0];
            if (activeExam) {
                startExamMutation.mutate(activeExam.id);
            } else {
                setToast({ message: 'Belum ada jadwal ujian aktif pada BAB ini.', type: 'error' });
            }
        }
    };

    useEffect(() => {
        const onKeyDown = (e) => {
            keysRef.current[e.code] = true;
            if (e.code === 'KeyE' && nearbyTarget && viewMode === '3d') {
                handleTriggerTarget(nearbyTarget);
            }
        };
        const onKeyUp = (e) => {
            keysRef.current[e.code] = false;
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [nearbyTarget, viewMode, chapter]);

    if (isLoading || !chapter) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
                <p className="text-sm font-bold text-white">Memuat Dunia 3D BAHASA PLAY...</p>
            </div>
        );
    }

    const learningZone =
        chapter.zones?.find((z) => z.type === 'learning') || chapter.zones?.[0];
    const practiceReady = chapter.progress?.learning_status === 'completed';
    const examReady = chapter.progress?.practice_status === 'passed';
    const activeExam = chapter.exams?.[0];

    const handleSelectOption = (attemptQuestionId, label) => {
        if (!activeAttempt || activeAttempt.status !== 'in_progress') return;
        setActiveAttempt((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.attempt_question_id === attemptQuestionId
                    ? { ...q, selected_label: label, is_answered: true }
                    : q
            ),
        }));
        saveAnswerMutation.mutate({
            attemptId: activeAttempt.id,
            attemptQuestionId,
            selectedLabel: label,
        });
    };

    const formatTimer = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // =========================================================
    // MODE FOKUS LATIHAN SOAL & ZONA UJIAN RESMI (2D LAYAR PENUH)
    // =========================================================
    if ((viewMode === 'practice' || viewMode === 'exam') && activeAttempt) {
        const isFinished = ['submitted', 'expired'].includes(activeAttempt.status);
        const currentQ = activeAttempt.questions?.[currentQIndex];

        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
                <Toast
                    message={toast?.message}
                    type={toast?.type}
                    onClose={() => setToast(null)}
                />
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Header Ujian / Latihan */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                        <div>
                            <Badge variant={viewMode === 'exam' ? 'warning' : 'info'}>
                                {viewMode === 'exam'
                                    ? 'ZONA UJIAN RESMI (MODE FOKUS)'
                                    : 'LATIHAN SOAL (SYARAT KKM 75)'}
                            </Badge>
                            <h1 className="text-lg font-extrabold text-white mt-1">
                                BAB {chapter.number}: {chapter.title}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            {viewMode === 'exam' && !isFinished && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-extrabold text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatTimer(remainingSec)}</span>
                                </div>
                            )}
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setViewMode('3d')}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Kembali ke Zona Belajar</span>
                            </Button>
                        </div>
                    </div>

                    {/* Ringkasan Hasil setelah Submit */}
                    {isFinished && (
                        <div className="p-6 rounded-2xl bg-slate-900 border-2 border-cyan-500/40 flex flex-wrap items-center justify-between gap-6">
                            <div className="space-y-1">
                                <p className="text-xs uppercase font-bold text-cyan-400">
                                    Hasil Evaluasi Server
                                </p>
                                <h2 className="text-3xl font-extrabold text-white">
                                    Nilai Anda: {activeAttempt.score}{' '}
                                    <span className="text-base font-medium text-slate-400">
                                        ({activeAttempt.correct_count}/{activeAttempt.total_questions} Benar)
                                    </span>
                                </h2>
                                <p className="text-xs text-slate-300">
                                    {activeAttempt.passed
                                        ? 'Selamat! Nilai Anda telah melampaui KKM (75). Zona Ujian Resmi kini terbuka!'
                                        : 'Nilai belum mencapai KKM (75). Silakan pelajari pembahasan di bawah dan ulangi latihan.'}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {viewMode === 'practice' && (
                                    <Button
                                        onClick={() => startPracticeMutation.mutate()}
                                        variant="secondary"
                                    >
                                        Ulangi Latihan Soal
                                    </Button>
                                )}
                                {activeAttempt.passed && viewMode === 'practice' && activeExam && (
                                    <Button
                                        variant="success"
                                        onClick={() => startExamMutation.mutate(activeExam.id)}
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>Masuk Zona Ujian Resmi</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigasi Nomor Soal & Butir Soal Aktif */}
                    <div className="grid lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-4 space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                                <h3 className="text-xs font-bold uppercase text-slate-400">
                                    Navigasi Nomor Soal
                                </h3>
                                <div className="grid grid-cols-5 gap-2">
                                    {activeAttempt.questions.map((q, idx) => {
                                        const isCurrent = idx === currentQIndex;
                                        let btnStyle = 'bg-slate-800 text-slate-300 border-slate-700';
                                        if (isFinished) {
                                            btnStyle = q.is_correct
                                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                                : 'bg-rose-500/20 text-rose-300 border-rose-500/50';
                                        } else if (q.is_answered) {
                                            btnStyle = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
                                        }
                                        return (
                                            <button
                                                key={q.attempt_question_id}
                                                type="button"
                                                onClick={() => setCurrentQIndex(idx)}
                                                className={`h-10 rounded-xl font-bold text-xs border transition cursor-pointer ${btnStyle} ${
                                                    isCurrent ? 'ring-2 ring-cyan-400' : ''
                                                }`}
                                            >
                                                {q.order}
                                            </button>
                                        );
                                    })}
                                </div>

                                {!isFinished && (
                                    <div className="pt-3 border-t border-slate-800">
                                        <Button
                                            variant="success"
                                            className="w-full"
                                            disabled={submitAttemptMutation.isPending}
                                            onClick={() => submitAttemptMutation.mutate(activeAttempt.id)}
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>
                                                {submitAttemptMutation.isPending
                                                    ? 'Mengumpulkan...'
                                                    : 'Kumpulkan Jawaban'}
                                            </span>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-8">
                            {currentQ && (
                                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="info">
                                            Soal Nomor {currentQ.order} dari {activeAttempt.total_questions}
                                        </Badge>
                                        {currentQ.is_answered && !isFinished && (
                                            <span className="text-xs text-emerald-400 font-semibold">
                                                ✓ Tersimpan Otomatis
                                            </span>
                                        )}
                                    </div>

                                    {currentQ.stimulus && (
                                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed italic">
                                            {currentQ.stimulus}
                                        </div>
                                    )}

                                    <p className="text-base font-bold text-white leading-relaxed whitespace-pre-line">
                                        {currentQ.stem}
                                    </p>

                                    <div className="space-y-2.5">
                                        {currentQ.options.map((opt) => {
                                            const isSelected = currentQ.selected_label === opt.label;
                                            const isCorrectOpt =
                                                isFinished && currentQ.correct_label === opt.label;

                                            let optClass =
                                                'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-600';
                                            if (isFinished) {
                                                if (isCorrectOpt) {
                                                    optClass =
                                                        'bg-emerald-500/15 border-emerald-500 text-emerald-200';
                                                } else if (isSelected && !isCorrectOpt) {
                                                    optClass =
                                                        'bg-rose-500/15 border-rose-500 text-rose-200';
                                                }
                                            } else if (isSelected) {
                                                optClass =
                                                    'bg-cyan-500/15 border-cyan-400 text-cyan-200';
                                            }

                                            return (
                                                <button
                                                    key={opt.label}
                                                    type="button"
                                                    disabled={isFinished}
                                                    onClick={() =>
                                                        handleSelectOption(
                                                            currentQ.attempt_question_id,
                                                            opt.label
                                                        )
                                                    }
                                                    className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition cursor-pointer ${optClass}`}
                                                >
                                                    <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-extrabold text-xs shrink-0">
                                                        {opt.label}
                                                    </span>
                                                    <span className="text-sm whitespace-pre-line flex-1">
                                                        {opt.text}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {isFinished && currentQ.explanation && (
                                        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
                                            <p className="text-xs font-extrabold text-cyan-300">
                                                Kunci Jawaban: {currentQ.correct_label} · Pembahasan:
                                            </p>
                                            <p className="text-xs text-slate-200 leading-relaxed">
                                                {currentQ.explanation}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            disabled={currentQIndex === 0}
                                            onClick={() => setCurrentQIndex((i) => Math.max(0, i - 1))}
                                        >
                                            Soal Sebelumnya
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            disabled={currentQIndex >= activeAttempt.questions.length - 1}
                                            onClick={() =>
                                                setCurrentQIndex((i) =>
                                                    Math.min(activeAttempt.questions.length - 1, i + 1)
                                                )
                                            }
                                        >
                                            Soal Berikutnya
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // MODE DUNIA 3D & PANEL BACA MATERI 2D TERPADU
    // =========================================================
    return (
        <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

            {viewMode === '3d' ? (
                <Canvas shadows camera={{ position: [0, 7, 14], fov: 50 }} dpr={[1, 1.5]}>
                    <ZoneScene
                        zone={learningZone}
                        npcs={learningZone?.npcs || []}
                        interactables={learningZone?.interactables || []}
                        avatarConfig={user?.avatar_config}
                        keysRef={keysRef}
                        onNearbyTargetChange={setNearbyTarget}
                        practiceReady={practiceReady}
                        examReady={examReady}
                    />
                </Canvas>
            ) : (
                <div className="w-full h-full overflow-y-auto pt-24 pb-28 px-4 sm:px-8 max-w-5xl mx-auto space-y-4">
                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                        <h2 className="text-lg font-extrabold text-white">
                            Daftar Materi BAB {chapter.number}: {chapter.title}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Baca seluruh materi wajib di bawah ini untuk membuka Latihan Soal (Practice) dan Zona Ujian.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {chapter.materials.map((mat) => (
                            <div
                                key={mat.id}
                                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between gap-4"
                            >
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Badge variant={mat.is_completed ? 'success' : 'info'}>
                                            {mat.is_completed ? 'Sudah Dibaca' : `Materi #${mat.order}`}
                                        </Badge>
                                    </div>
                                    <h3 className="text-sm font-bold text-white">{mat.title}</h3>
                                    <p className="text-xs text-slate-400">{mat.summary}</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant={mat.is_completed ? 'secondary' : 'primary'}
                                    onClick={() => setActiveMaterial(mat)}
                                >
                                    <BookOpen className="w-4 h-4" />
                                    <span>Baca Materi</span>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top HUD Bar */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-20">
                <div className="flex items-center gap-2 pointer-events-auto">
                    <Link
                        to={user?.role === 'teacher' ? '/teacher/game-editor' : user?.role === 'admin' ? '/admin' : '/student'}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs font-bold shadow-lg backdrop-blur"
                    >
                        <ArrowLeft className="w-4 h-4 text-cyan-400" />
                        <span>Dashboard</span>
                    </Link>

                    <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 backdrop-blur">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold">
                            BAB {chapter.number}: {chapter.setting_location}
                        </span>
                    </div>
                </div>

                {/* Tombol Aksi Cepat: Mode 3D/2D, Materi, Latihan, Ujian */}
                <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
                    <button
                        type="button"
                        onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
                        className="px-3 py-2 rounded-2xl bg-slate-900/90 border border-slate-700 text-xs font-bold text-cyan-300 hover:border-cyan-400 cursor-pointer flex items-center gap-1.5"
                    >
                        {viewMode === '3d' ? (
                            <>
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Daftar Materi ({chapter.materials.filter((m) => m.is_completed).length}/{chapter.materials.length})</span>
                            </>
                        ) : (
                            <>
                                <Gamepad2 className="w-3.5 h-3.5" />
                                <span>Mode Dunia 3D</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => startPracticeMutation.mutate()}
                        className={`px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                            practiceReady
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                                : 'bg-slate-900/80 border-slate-800 text-slate-400'
                        }`}
                    >
                        {practiceReady ? (
                            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                            <Lock className="w-3.5 h-3.5" />
                        )}
                        <span>
                            Latihan Soal{' '}
                            {chapter.progress?.best_practice_score !== null
                                ? `(${chapter.progress.best_practice_score})`
                                : ''}
                        </span>
                    </button>

                    {activeExam && (
                        <button
                            type="button"
                            onClick={() => startExamMutation.mutate(activeExam.id)}
                            className={`px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                                examReady
                                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                            }`}
                        >
                            {examReady ? (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                                <Lock className="w-3.5 h-3.5" />
                            )}
                            <span>Zona Ujian</span>
                        </button>
                    )}

                    <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/90 border border-slate-700 text-[11px] font-bold text-emerald-300">
                        <Gauge className="w-3.5 h-3.5" />
                        <span>{fps} FPS</span>
                    </div>
                </div>
            </div>

            {/* Mission Tracker HUD (Kiri Atas) */}
            {viewMode === '3d' && (
                <div className="absolute top-16 left-3 max-w-xs p-3.5 rounded-2xl bg-slate-900/85 border border-slate-800 text-xs space-y-2 pointer-events-auto backdrop-blur z-10">
                    <div className="flex items-center gap-2 text-cyan-300 font-extrabold">
                        <Compass className="w-4 h-4" />
                        <span>Target Zona Belajar & Latihan</span>
                    </div>
                    <div className="space-y-1">
                        {chapter.materials.map((m) => (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => setActiveMaterial(m)}
                                className="w-full text-left flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-slate-800/80 transition cursor-pointer"
                            >
                                <span
                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                        m.is_completed ? 'bg-emerald-400' : 'bg-amber-400'
                                    }`}
                                />
                                <span
                                    className={`text-[11px] truncate ${
                                        m.is_completed ? 'text-slate-400 line-through' : 'text-slate-200'
                                    }`}
                                >
                                    {m.title}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Kontrol Mobile (Joystick + Tombol Interaksi) */}
            {viewMode === '3d' && (
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between pointer-events-none z-20">
                    <div className="pointer-events-auto">
                        <Joystick />
                    </div>

                    <div className="flex flex-col items-end gap-2 pointer-events-auto">
                        <button
                            type="button"
                            disabled={!nearbyTarget}
                            onClick={() => handleTriggerTarget(nearbyTarget)}
                            className={`min-w-[148px] min-h-[52px] px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl cursor-pointer ${
                                nearbyTarget
                                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 animate-bounce'
                                    : 'bg-slate-900/75 border border-slate-700 text-slate-500'
                            }`}
                        >
                            <Hand className="w-5 h-5" />
                            <span>
                                {nearbyTarget ? `Interaksi: ${nearbyTarget.title.slice(0, 18)} [E]` : 'Dekati NPC / Objek'}
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Panel Materi & Dialog NPC */}
            <Modal
                isOpen={Boolean(activeMaterial)}
                onClose={() => {
                    setActiveMaterial(null);
                    setActiveNpc(null);
                }}
                title={activeMaterial?.title || 'Materi Pembelajaran'}
                maxWidth="max-w-3xl"
            >
                {activeMaterial && (
                    <div className="space-y-5">
                        {activeNpc && (
                            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-extrabold text-cyan-300">
                                        {activeNpc.name} · {activeNpc.role_label}
                                    </p>
                                    <p className="text-xs text-slate-200 mt-1">{activeNpc.greeting}</p>
                                </div>
                            </div>
                        )}

                        <div
                            className="prose prose-invert max-w-none text-sm text-slate-200 leading-relaxed space-y-3"
                            dangerouslySetInnerHTML={{ __html: activeMaterial.content }}
                        />

                        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                            <Badge variant={activeMaterial.is_completed ? 'success' : 'warning'}>
                                {activeMaterial.is_completed
                                    ? '✓ Materi Ini Sudah Dipelajari'
                                    : 'Belum Ditandai Selesai'}
                            </Badge>
                            <Button
                                variant="success"
                                disabled={completeMaterialMutation.isPending}
                                onClick={async () => {
                                    await completeMaterialMutation.mutateAsync(activeMaterial.id);
                                    setActiveMaterial(null);
                                }}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Saya Sudah Paham & Tandai Selesai (+15 XP)</span>
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
