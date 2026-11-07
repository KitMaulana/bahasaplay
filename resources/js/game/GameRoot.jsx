import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Canvas } from '@react-three/fiber';
import {
    ArrowLeft,
    ArrowUp,
    BookOpen,
    CheckCircle2,
    Compass,
    Move3d,
    Gamepad2,
    Gauge,
    Hand,
    HelpCircle,
    Lock,
    MapPin,
    ShieldCheck,
} from 'lucide-react';
import api from '../lib/axios';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import ZoneScene from './ZoneScene';
import Joystick from './hud/Joystick';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Toast from '../components/ui/Toast';
import MaterialDialogue from './hud/MaterialDialogue';
import ElbiraChat, { elbiraGreeting } from './hud/ElbiraChat';
import CatAvatar from '../components/game/CatAvatar';
import QuizArena from './hud/QuizArena';
import { MiniMap, FullMap } from './hud/MiniMap';
import { playerState } from './lib/playerState';
import { MusicToggle } from '../components/audio/MusicPlayer';
import { useMusic } from '../lib/music';

export default function GameRoot() {
    const { chapterId } = useParams();
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);
    const setMusicHud = useMusic((s) => s.setHudEmbedded);
    useEffect(() => {
        setMusicHud(true);
        return () => setMusicHud(false);
    }, [setMusicHud]);
    const fps = useGameStore((s) => s.fps);
    const keysRef = useRef({});

    const [viewMode, setViewMode] = useState('3d'); // '3d' | '2d' | 'practice' | 'exam'
    const [nearbyTarget, setNearbyTarget] = useState(null);
    const [activeNpc, setActiveNpc] = useState(null);
    const [activeMaterial, setActiveMaterial] = useState(null);
    const [activeAttempt, setActiveAttempt] = useState(null);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [remainingSec, setRemainingSec] = useState(0);
    const [examInterrupted, setExamInterrupted] = useState(false); // ujian dibatalkan karena siswa meninggalkan halaman
    const examEndsAtRef = useRef(0); // waktu akhir ujian (ms epoch), dihitung dari sisa waktu server
    const [toast, setToast] = useState(null);
    const [playerPos, setPlayerPos] = useState({ x: 0, z: 12 });
    const [fullMapOpen, setFullMapOpen] = useState(false);
    const [elbiraOpen, setElbiraOpen] = useState(false);
    const [elbiraMessages, setElbiraMessages] = useState([]);
    const [showControlsHint, setShowControlsHint] = useState(() => {
        try {
            return localStorage.getItem('bp_controls_hint_seen') !== '1';
        } catch {
            return true;
        }
    });
    const dismissControlsHint = () => {
        setShowControlsHint(false);
        try {
            localStorage.setItem('bp_controls_hint_seen', '1');
        } catch {
            /* abaikan */
        }
    };

    const playerName = user?.name || 'Siswa';

    // Elbira: buka chat (riwayat dipertahankan selama berada di dunia BAB ini)
    const openElbira = () => {
        keysRef.current = {};
        setElbiraMessages((prev) => (prev.length ? prev : [elbiraGreeting(playerName, chapter)]));
        setElbiraOpen(true);
    };
    const closeElbira = () => {
        keysRef.current = {};
        setElbiraOpen(false);
    };
    const playerClass = user?.school_classes?.[0]?.name ? `Kelas ${user.school_classes[0].name}` : 'Kelas XII';

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
            const secs = Math.max(0, Math.floor(Number(attempt.remaining_seconds) || 0)) || 2700;
            examEndsAtRef.current = Date.now() + secs * 1000;
            setRemainingSec(secs);
            setExamInterrupted(false);
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

    // Konfirmasi aturan ujian sebelum dimulai
    const requestExamStart = (examId) => {
        const ok = window.confirm(
            'ATURAN UJIAN RESMI\n\n' +
                '• Waktu berjalan sejak ujian dimulai.\n' +
                '• Jangan menutup jendela, memuat ulang, atau pindah tab/aplikasi.\n' +
                '• Jika kamu keluar, ujian DIBATALKAN dan harus diulang dari awal (jawaban & waktu direset, soal diacak ulang).\n\n' +
                'Mulai ujian sekarang?'
        );
        if (ok) startExamMutation.mutate(examId);
    };

    const saveAnswerMutation = useMutation({
        mutationFn: async ({ attemptId, attemptQuestionId, selectedLabel }) => {
            const res = await api.put(`/student/attempts/${attemptId}/answers`, {
                attempt_question_id: attemptQuestionId,
                selected_label: selectedLabel,
            });
            return res.data;
        },
        onError: (err) => {
            // 422 = sesi ujian sudah dibatalkan/ditutup server (mis. dimulai ulang di perangkat lain)
            if (err?.response?.status === 422 && viewMode === 'exam') {
                setActiveAttempt(null);
                setExamInterrupted(true);
                setViewMode('3d');
            }
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
        let submitted = false;
        const tick = () => {
            const left = Math.max(0, Math.ceil((examEndsAtRef.current - Date.now()) / 1000));
            setRemainingSec(left);
            if (left <= 0 && !submitted) {
                submitted = true;
                clearInterval(timer);
                submitAttemptMutation.mutate(activeAttempt.id);
            }
        };
        const timer = setInterval(tick, 1000);
        // Saat tab/tablet aktif kembali, segera sinkronkan (interval ditahan browser saat tidur)
        const onVisible = () => !document.hidden && tick();
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [viewMode, activeAttempt]);

    // Pengawas ujian: siswa yang meninggalkan halaman (pindah tab/aplikasi, tutup/muat ulang jendela)
    // membatalkan percobaannya. Server juga memantau lewat detak koneksi tiap 10 detik.
    useEffect(() => {
        if (viewMode !== 'exam' || !activeAttempt || activeAttempt.status !== 'in_progress') {
            return undefined;
        }
        const attemptId = activeAttempt.id;
        const LEAVE_GRACE_MS = 3000; // toleransi kedipan singkat (mis. notifikasi sistem)
        let finished = false;
        let hiddenAt = 0;

        const interrupt = (reason, notifyServer = true) => {
            if (finished) return;
            finished = true;
            if (notifyServer) api.post(`/student/attempts/${attemptId}/abandon`, { reason }).catch(() => {});
            setActiveAttempt(null);
            setExamInterrupted(true);
            setViewMode('3d');
        };

        const beat = () => {
            api.post(`/student/attempts/${attemptId}/heartbeat`)
                .then((res) => {
                    if (res.data?.data?.status === 'abandoned') interrupt('left_page', false);
                })
                .catch(() => {});
        };
        beat();
        const beatTimer = setInterval(beat, 10000);

        const onVisibility = () => {
            if (document.hidden) {
                hiddenAt = Date.now();
            } else if (hiddenAt && Date.now() - hiddenAt >= LEAVE_GRACE_MS) {
                interrupt('left_page');
            } else {
                hiddenAt = 0;
            }
        };
        document.addEventListener('visibilitychange', onVisibility);

        // Jendela/tab ditutup atau dimuat ulang: kirim pembatalan semampunya (keepalive).
        const onPageHide = () => {
            try {
                const xsrf = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || '');
                fetch(`/api/v1/student/attempts/${attemptId}/abandon`, {
                    method: 'POST',
                    keepalive: true,
                    credentials: 'include',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-XSRF-TOKEN': xsrf,
                        Authorization: `Bearer ${localStorage.getItem('bahasa_play_token') || ''}`,
                    },
                    body: JSON.stringify({ reason: 'closed' }),
                });
            } catch {
                /* server tetap membatalkan lewat pemantauan detak */
            }
        };
        window.addEventListener('pagehide', onPageHide);

        return () => {
            finished = true;
            clearInterval(beatTimer);
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('pagehide', onPageHide);
        };
    }, [viewMode, activeAttempt?.id, activeAttempt?.status]);

    const totalMaterials = chapter?.materials?.length || 0;
    const completedMaterials = chapter?.materials?.filter((m) => m.is_completed).length || 0;
    const materialPercent = totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0;
    const practicePassed = (chapter?.progress?.best_practice_score !== null && chapter?.progress?.best_practice_score !== undefined)
        ? chapter.progress.best_practice_score >= (chapter.kkm || 75)
        : chapter?.progress?.practice_status === 'passed';
    const practiceReady = materialPercent >= 100 || chapter?.progress?.learning_status === 'completed';
    const examReady = practicePassed;
    const activeExam = chapter?.exams?.[0];

    // Tentukan objective navigasi aktif
    const nextUnreadMaterial = chapter?.materials?.find((m) => !m.is_completed) || null;
    let currentObjective = null;

    if (nextUnreadMaterial) {
        const order = nextUnreadMaterial.order || 1;
        const targetPos = order === 1 ? [-18, 0, -10] : order === 2 ? [0, 0, -22] : [18, 0, -10];
        currentObjective = {
            kind: 'material',
            materialId: nextUnreadMaterial.id,
            title: `Materi #${order}: ${nextUnreadMaterial.title}`,
            shortTitle: `Pos Materi #${order}`,
            targetPos,
            color: '#38bdf8',
            hint: `Pelajari ${nextUnreadMaterial.title} di Pos Belajar`,
        };
    } else if (!practicePassed) {
        currentObjective = {
            kind: 'portal_practice',
            id: 'portal-practice',
            title: 'Terminal Latihan Soal (Sayap Barat)',
            shortTitle: 'Terminal Latihan',
            targetPos: [-34, 0, 10],
            color: '#f59e0b',
            hint: 'Materi 100% Selesai! Kerjakan Latihan Soal (Capai KKM 75)',
        };
    } else {
        currentObjective = {
            kind: 'portal_exam',
            id: 'portal-exam',
            title: 'Gerbang Zona Ujian Resmi (Sayap Timur)',
            shortTitle: 'Gerbang Ujian Resmi',
            targetPos: [34, 0, 10],
            color: '#10b981',
            hint: 'Latihan Lulus! Menuju Gerbang Ujian untuk Ujian Resmi',
        };
    }

    // Jarak & arah tujuan relatif terhadap arah pandang kamera (panah berputar, bukan mata angin).
    let targetDist = 0;
    let relArrowDeg = 0;
    let relWord = 'di depan';
    if (currentObjective && currentObjective.targetPos) {
        const dx = currentObjective.targetPos[0] - playerPos.x;
        const dz = currentObjective.targetPos[2] - playerPos.z;
        targetDist = Math.round(Math.hypot(dx, dz));
        const worldAng = Math.atan2(dx, -dz); // 0 = utara
        const camAng = Math.atan2(-Math.sin(playerState.camYaw), -Math.cos(playerState.camYaw));
        let rel = ((worldAng - camAng) * 180) / Math.PI;
        rel = ((rel + 540) % 360) - 180;
        relArrowDeg = rel;
        const a = Math.abs(rel);
        if (a < 30) relWord = 'di depan';
        else if (a > 150) relWord = 'di belakang';
        else relWord = rel > 0 ? (a < 70 ? 'serong kanan' : 'di kanan') : a < 70 ? 'serong kiri' : 'di kiri';
    }

    /** Cari NPC yang dialognya membuka materi tertentu (agar papan materi juga "dibawakan" NPC). */
    const npcForMaterial = (materialId) => {
        const zoneNpcs = (chapter?.zones || []).flatMap((z) => z.npcs || []);
        return (
            zoneNpcs.find((n) =>
                (n.dialogues || []).some((d) => (d.nodes || []).some((nd) => (nd.actions || []).some((ac) => ac.type === 'open_material' && ac.material_id === materialId)))
            ) || null
        );
    };
    const openMaterial = (mat, npc) => {
        if (!mat) return;
        setActiveNpc(npc || npcForMaterial(mat.id));
        setActiveMaterial(mat);
    };

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
            openMaterial(mat);
            return;
        }

        if (target.kind === 'portal_practice') {
            if (!practiceReady) {
                setToast({
                    message: `Selesaikan membaca seluruh materi wajib di Zona Belajar (saat ini ${materialPercent}%) sebelum memulai Latihan Soal.`,
                    type: 'error',
                });
                return;
            }
            startPracticeMutation.mutate();
            return;
        }

        if (target.kind === 'portal_exam') {
            if (!examReady) {
                setToast({
                    message: `Gerbang Ujian Terkunci! Capai nilai minimal KKM ${chapter.kkm || 75} pada Latihan Soal terlebih dahulu untuk membuka Ujian Resmi.`,
                    type: 'error',
                });
                return;
            }
            const exam = chapter.exams?.[0];
            if (exam) {
                requestExamStart(exam.id);
            } else {
                setToast({ message: 'Belum ada jadwal ujian aktif pada BAB ini.', type: 'error' });
            }
        }
    };

    useEffect(() => {
        const onKeyDown = (e) => {
            const tag = e.target?.tagName;
            if (elbiraOpen || examInterrupted || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            keysRef.current[e.code] = true;
            if (activeMaterial) return;
            if (e.code === 'KeyC' && viewMode === '3d' && !fullMapOpen) {
                e.preventDefault();
                openElbira();
                return;
            }
            if (e.code === 'KeyE' && nearbyTarget && viewMode === '3d' && !fullMapOpen) {
                handleTriggerTarget(nearbyTarget);
            }
            if (e.code === 'KeyM' && viewMode === '3d') setFullMapOpen((v) => !v);
            if (e.code === 'Escape') setFullMapOpen(false);
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
    }, [nearbyTarget, viewMode, chapter, practiceReady, examReady, materialPercent, activeMaterial, fullMapOpen, elbiraOpen, examInterrupted]);

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

    // Penanda minimap: papan materi, NPC, terminal latihan, gerbang ujian (posisi sama dengan ZoneScene).
    const mapMarkers = [];
    (learningZone?.npcs || []).forEach((npc, idx) => {
        const pos = Array.isArray(npc.position) && npc.position.length >= 3 ? npc.position : idx === 0 ? [-15, 0, -10] : idx === 1 ? [-3, 0, -22] : [15, 0, -10];
        mapMarkers.push({ id: `npc-${npc.id}`, kind: 'npc', x: pos[0], z: pos[2], color: '#e2e8f0', label: npc.name });
    });
    (learningZone?.interactables || []).forEach((item, idx) => {
        const pos = Array.isArray(item.position) && item.position.length >= 3 ? item.position : idx === 0 ? [-18, 0, -10] : idx === 1 ? [0, 0, -22] : [18, 0, -10];
        const mat = chapter.materials.find((m) => m.id === item.material_id);
        const order = mat?.order || idx + 1;
        const done = Boolean(mat?.is_completed);
        mapMarkers.push({
            id: `obj-${item.id}`,
            kind: 'material',
            x: pos[0],
            z: pos[2],
            color: done ? '#10b981' : '#0ea5e9',
            glyph: done ? '✓' : String(order),
            short: `Materi ${order}`,
            label: mat?.title || item.label,
            status: done ? 'Sudah dipelajari' : 'Belum dipelajari',
            pulse: currentObjective?.materialId === mat?.id,
        });
    });
    mapMarkers.push({
        id: 'portal-practice',
        kind: 'practice',
        x: -34,
        z: 10,
        color: '#f59e0b',
        glyph: '?',
        short: 'Latihan Soal',
        label: 'Terminal Latihan Soal',
        status: practicePassed ? 'Lulus KKM' : practiceReady ? 'Terbuka · capai KKM ' + (chapter.kkm || 75) : 'Terkunci · selesaikan materi',
        locked: !practiceReady,
        pulse: currentObjective?.kind === 'portal_practice',
    });
    mapMarkers.push({
        id: 'portal-exam',
        kind: 'exam',
        x: 34,
        z: 10,
        color: '#10b981',
        glyph: '★',
        short: 'Zona Ujian',
        label: 'Gerbang Zona Ujian Resmi',
        status: examReady ? 'Terbuka' : 'Terkunci · lulus latihan dulu',
        locked: !examReady,
        pulse: currentObjective?.kind === 'portal_exam',
    });
    const mapObjective = currentObjective?.targetPos ? { x: currentObjective.targetPos[0], z: currentObjective.targetPos[2], color: currentObjective.color || '#38bdf8' } : null;
    const overlayOpen = Boolean(activeMaterial) || fullMapOpen || elbiraOpen || examInterrupted;

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

    // =========================================================
    // ARENA LATIHAN SOAL & ZONA UJIAN RESMI (LAYAR PENUH BERGAYA GAME)
    // =========================================================
    if ((viewMode === 'practice' || viewMode === 'exam') && activeAttempt) {
        return (
            <>
                <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
                <QuizArena
                    mode={viewMode}
                    chapter={chapter}
                    attempt={activeAttempt}
                    index={currentQIndex}
                    setIndex={setCurrentQIndex}
                    onSelect={handleSelectOption}
                    onSubmit={() => submitAttemptMutation.mutate(activeAttempt.id)}
                    submitting={submitAttemptMutation.isPending}
                    remainingSec={remainingSec}
                    onBack={() => {
                        // Keluar dari ujian yang sedang berjalan = membatalkan percobaan (diulang dari awal)
                        if (viewMode === 'exam' && activeAttempt.status === 'in_progress') {
                            api.post(`/student/attempts/${activeAttempt.id}/abandon`, { reason: 'left_page' }).catch(() => {});
                            setActiveAttempt(null);
                        }
                        setViewMode('3d');
                    }}
                    onRetry={() => startPracticeMutation.mutate()}
                    onStartExam={() => activeExam && requestExamStart(activeExam.id)}
                    canStartExam={Boolean(activeExam)}
                />
            </>
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
                        onPlayerMove={setPlayerPos}
                        practiceReady={practiceReady}
                        examReady={examReady}
                        currentObjective={currentObjective}
                        inputLocked={overlayOpen}
                        playerName={playerName}
                        playerClass={playerClass}
                        onElbiraOpen={openElbira}
                        elbiraOpen={elbiraOpen}
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
                                    onClick={() => openMaterial(mat)}
                                >
                                    <BookOpen className="w-4 h-4" />
                                    <span>Mulai Percakapan Materi</span>
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

                    <MusicToggle compact />

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
                            onClick={() => requestExamStart(activeExam.id)}
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

            {/* Roblox Style Slim Quest & Wayfinder Banner (Tengah Atas - Bebas Hambatan) */}
            {viewMode === '3d' && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 max-w-xl w-[94%] sm:w-auto px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md z-20 pointer-events-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 text-xs">
                        <span className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-lg">
                            <ArrowUp className="w-5 h-5 transition-transform duration-200" strokeWidth={3} style={{ transform: `rotate(${relArrowDeg}deg)` }} />
                        </span>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-white text-xs">
                                    {currentObjective?.shortTitle}
                                </span>
                                <span className="text-[10px] font-bold text-amber-300 px-1.5 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40">
                                    {targetDist}m · {relWord}
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-300 line-clamp-1">
                                {currentObjective?.hint}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 border-l border-slate-800 pl-3 shrink-0">
                        <div className="text-right">
                            <p className="text-[10px] font-extrabold text-cyan-300 leading-tight">
                                {materialPercent}% Materi
                            </p>
                            <p className="text-[9px] text-slate-400 font-medium">
                                {completedMaterials}/{totalMaterials} Selesai
                            </p>
                        </div>
                        <div className="w-12 h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 transition-all duration-300"
                                style={{ width: `${materialPercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Mission Tracker HUD (Kiri Samping) */}
            {viewMode === '3d' && (
                <div className="absolute top-28 left-3 max-w-[260px] p-3 rounded-2xl bg-slate-900/85 border border-slate-800 text-xs space-y-2 pointer-events-auto backdrop-blur z-10 shadow-lg hidden md:block">
                    <div className="flex items-center justify-between text-cyan-300 font-extrabold">
                        <div className="flex items-center gap-1.5">
                            <Compass className="w-4 h-4" />
                            <span>Target Materi ({completedMaterials}/{totalMaterials})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{materialPercent}%</span>
                    </div>
                    <div className="space-y-1">
                        {chapter.materials.map((m) => (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => openMaterial(m)}
                                className={`w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-xl transition cursor-pointer ${
                                    m.is_completed ? 'bg-slate-950/40 hover:bg-slate-800/50' : 'bg-slate-800/80 hover:bg-slate-700/80'
                                }`}
                            >
                                <span
                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                        m.is_completed ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                                    }`}
                                />
                                <span
                                    className={`text-[11px] truncate flex-1 ${
                                        m.is_completed ? 'text-slate-400 line-through' : 'text-slate-200 font-medium'
                                    }`}
                                >
                                    {m.title}
                                </span>
                                {m.is_completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Minimap gaya GTA: desktop di kanan atas, HP di atas tombol interaksi */}
            {viewMode === '3d' && (
                <>
                    <div className="absolute top-16 right-3 z-20 hidden md:block">
                        <MiniMap mapKey={learningZone?.map_key} markers={mapMarkers} objective={mapObjective} onOpen={() => setFullMapOpen(true)} size={176} />
                    </div>
                    <div className="absolute bottom-[92px] right-4 z-20 md:hidden">
                        <MiniMap mapKey={learningZone?.map_key} markers={mapMarkers} objective={mapObjective} onOpen={() => setFullMapOpen(true)} size={118} rangeM={40} />
                    </div>
                </>
            )}
            {fullMapOpen && viewMode === '3d' && (
                <FullMap
                    mapKey={learningZone?.map_key}
                    markers={mapMarkers}
                    objective={mapObjective}
                    title={`Peta ${chapter.setting_location || 'Kawasan'}`}
                    onClose={() => setFullMapOpen(false)}
                />
            )}

            {/* Petunjuk kontrol kamera (sekali tampil) */}
            {viewMode === '3d' && showControlsHint && !activeMaterial && (
                <div className="absolute inset-x-0 top-1/3 z-30 flex justify-center px-4 pointer-events-none">
                    <div className="pointer-events-auto animate-pop max-w-sm rounded-3xl bg-slate-950/90 border-2 border-banten-gold/70 p-4 text-center shadow-2xl">
                        <Move3d className="w-9 h-9 mx-auto text-amber-300 animate-wiggle" />
                        <p className="font-game text-xl text-white mt-1">Kamera 360°</p>
                        <p className="text-xs text-slate-300 mt-1 hidden md:block">
                            Klik kiri lalu geser mouse/touchpad untuk memutar kamera. Scroll untuk zoom. WASD untuk berjalan, E untuk interaksi, M untuk peta, C untuk bertanya ke Elbira si kucing.
                        </p>
                        <p className="text-xs text-slate-300 mt-1 md:hidden">
                            Joystick kiri untuk berjalan. Geser layar bagian kanan untuk memutar kamera dan arah jalan. Cubit dua jari untuk zoom. Ketuk Elbira si kucing untuk bertanya.
                        </p>
                        <button type="button" onClick={dismissControlsHint} className="btn-chunky mt-3 px-5 py-2 rounded-2xl bg-gradient-to-b from-amber-300 to-orange-500 text-slate-950 font-game text-base cursor-pointer">
                            Siap, Main!
                        </button>
                    </div>
                </div>
            )}

            {/* Kontrol Mobile (Joystick + Tombol Interaksi) */}
            {viewMode === '3d' && (
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between pointer-events-none z-20">
                    <div className="pointer-events-auto relative">
                        {/* HP: tombol Elbira di atas joystick agar tidak menutupi minimap */}
                        <button
                            type="button"
                            onClick={openElbira}
                            className="md:hidden btn-chunky absolute -top-[78px] left-1 w-16 h-16 rounded-2xl bg-gradient-to-b from-amber-200 to-orange-400 border-2 border-banten-night flex flex-col items-center justify-center cursor-pointer"
                            aria-label="Tanya Elbira, kucing asisten belajar"
                        >
                            <CatAvatar size={36} />
                            <span className="font-game text-[10px] text-banten-night leading-none">Elbira</span>
                        </button>
                        <Joystick />
                    </div>

                    <div className="flex flex-col items-end gap-2 pointer-events-auto">
                        <button
                            type="button"
                            onClick={openElbira}
                            className="btn-chunky hidden md:flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-2xl bg-gradient-to-b from-amber-200 to-orange-400 border-2 border-banten-night text-banten-night font-game text-sm cursor-pointer"
                            aria-label="Tanya Elbira, kucing asisten belajar"
                        >
                            <span className="w-9 h-9 rounded-xl bg-white/70 border-2 border-banten-night/40 flex items-center justify-center overflow-hidden">
                                <CatAvatar size={32} />
                            </span>
                            <span className="leading-tight text-left">
                                Tanya Elbira
                                <span className="hidden sm:block text-[9px] font-sans font-extrabold opacity-70">Asisten belajar · [C]</span>
                            </span>
                        </button>
                        <button
                            type="button"
                            disabled={!nearbyTarget}
                            onClick={() => handleTriggerTarget(nearbyTarget)}
                            className={`min-w-[160px] min-h-[52px] px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl cursor-pointer ${
                                nearbyTarget
                                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 animate-bounce ring-4 ring-amber-400/30'
                                    : 'bg-slate-900/75 border border-slate-700 text-slate-500'
                            }`}
                        >
                            <Hand className="w-5 h-5" />
                            <span>
                                {nearbyTarget ? `Interaksi: ${nearbyTarget.title.slice(0, 20)} [E]` : 'Dekati NPC / Objek / Portal'}
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* Ujian dibatalkan karena siswa meninggalkan halaman */}
            {examInterrupted && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
                    <div className="animate-pop w-full max-w-md rounded-[2rem] bg-white text-banten-night border-4 border-banten-night shadow-[0_10px_0_0_#10213a] overflow-hidden">
                        <div className="bg-rose-600 px-5 py-3 text-center">
                            <p className="font-game text-2xl text-white tracking-wide">Ujian Dibatalkan</p>
                        </div>
                        <div className="p-5 space-y-3 text-sm">
                            <p className="font-bold">Kamu meninggalkan halaman ujian (pindah tab/aplikasi, menutup atau memuat ulang jendela).</p>
                            <ul className="space-y-1.5 text-slate-700">
                                <li>• Semua jawaban dan sisa waktu <strong>direset</strong>.</li>
                                <li>• Ujian harus diulang dari awal, soal diacak ulang.</li>
                                <li>• Percobaan ini tidak mengurangi kesempatan ujianmu.</li>
                                <li>• Kejadian ini tercatat dan dapat dilihat guru.</li>
                            </ul>
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                {activeExam && (
                                    <button
                                        type="button"
                                        onClick={() => startExamMutation.mutate(activeExam.id)}
                                        disabled={startExamMutation.isPending}
                                        className="btn-chunky flex-1 px-4 py-3 rounded-2xl bg-gradient-to-b from-lime-300 to-green-600 border-4 border-banten-night font-game text-lg text-white cursor-pointer disabled:opacity-60"
                                    >
                                        {startExamMutation.isPending ? 'Memulai...' : 'Mulai Ulang Ujian'}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setExamInterrupted(false)}
                                    className="btn-chunky flex-1 px-4 py-3 rounded-2xl bg-slate-100 border-4 border-banten-night font-game text-lg cursor-pointer"
                                >
                                    Kembali Menjelajah
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Elbira — kucing asisten belajar AI */}
            {elbiraOpen && (
                <ElbiraChat
                    chapter={chapter}
                    playerName={playerName}
                    messages={elbiraMessages}
                    setMessages={setElbiraMessages}
                    onClose={closeElbira}
                />
            )}

            {/* Materi disampaikan NPC sebagai percakapan bertahap */}
            {activeMaterial && (
                <MaterialDialogue
                    key={activeMaterial.id}
                    material={activeMaterial}
                    npc={activeNpc}
                    playerName={playerName}
                    completing={completeMaterialMutation.isPending}
                    onClose={() => {
                        setActiveMaterial(null);
                        setActiveNpc(null);
                    }}
                    onComplete={async () => {
                        await completeMaterialMutation.mutateAsync(activeMaterial.id);
                        setActiveMaterial(null);
                        setActiveNpc(null);
                    }}
                />
            )}
        </div>
    );
}
