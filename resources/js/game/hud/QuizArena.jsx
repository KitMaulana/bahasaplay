import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Clock, Flag, Gamepad2, RotateCcw, ShieldCheck, Star, X } from 'lucide-react';
import BlockyAvatar from '../../components/game/BlockyAvatar';

/*
 * QuizArena — tampilan Latihan Soal & Zona Ujian bergaya game.
 * Catatan keamanan: kunci jawaban (correct_label) & pembahasan hanya ada setelah attempt
 * dikumpulkan — komponen ini hanya menampilkan apa yang dikirim server.
 */

const OPTION_STYLES = [
    { bg: 'from-rose-400 to-rose-600', border: 'border-rose-800', shape: '▲' },
    { bg: 'from-sky-400 to-blue-600', border: 'border-blue-800', shape: '◆' },
    { bg: 'from-amber-300 to-amber-500', border: 'border-amber-700', shape: '●', dark: true },
    { bg: 'from-emerald-400 to-emerald-600', border: 'border-emerald-800', shape: '■' },
    { bg: 'from-violet-400 to-violet-600', border: 'border-violet-800', shape: '★' },
];

const PRACTICE_TIPS = [
    'Baca pertanyaannya pelan-pelan, lalu cari kata kuncinya!',
    'Kalau ada teks bacaan, pahami dulu gagasan utamanya.',
    'Hati-hati dengan pilihan yang mirip. Bandingkan dengan teliti!',
    'Ingat kaidah kebahasaan yang dijelaskan NPC tadi.',
    'Jawabanmu tersimpan otomatis. Tenang saja!',
    'Sedikit lagi! Tetap fokus, ya.',
];

function formatTimer(sec) {
    const total = Math.max(0, Math.ceil(Number(sec) || 0));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function ScoreRing({ score, passed }) {
    const r = 54;
    const c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(100, Number(score) || 0));
    return (
        <svg viewBox="0 0 128 128" className="w-36 h-36 sm:w-44 sm:h-44 -rotate-90">
            <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12" />
            <circle
                cx="64"
                cy="64"
                r={r}
                fill="none"
                stroke={passed ? '#34d399' : '#fb7185'}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={c * (1 - pct / 100)}
                style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
            />
        </svg>
    );
}

function Confetti() {
    const pieces = useMemo(
        () =>
            Array.from({ length: 40 }).map((_, i) => ({
                left: (i * 37) % 100,
                delay: (i % 10) * 0.25,
                dur: 2.2 + (i % 5) * 0.4,
                color: ['#f2b43a', '#0f8b8d', '#fb7185', '#38bdf8', '#a78bfa', '#34d399'][i % 6],
                size: 6 + (i % 4) * 2,
            })),
        []
    );
    return (
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-[60]">
            {pieces.map((p, i) => (
                <span
                    key={i}
                    className="absolute top-0 animate-confetti rounded-sm"
                    style={{ left: `${p.left}%`, width: p.size, height: p.size * 1.6, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
                />
            ))}
        </div>
    );
}

export default function QuizArena({
    mode,
    chapter,
    attempt,
    index,
    setIndex,
    onSelect,
    onSubmit,
    submitting,
    remainingSec,
    onBack,
    onRetry,
    onStartExam,
    canStartExam,
}) {
    const isExam = mode === 'exam';
    const kkm = chapter?.kkm || 75;
    const isFinished = ['submitted', 'expired'].includes(attempt.status);
    const questions = attempt.questions || [];
    const q = questions[index];
    const answered = questions.filter((x) => x.is_answered).length;
    const unanswered = questions.filter((x) => !x.is_answered).map((x) => x.order);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [leaveOpen, setLeaveOpen] = useState(false);
    const [showResult, setShowResult] = useState(isFinished);
    const wasFinished = useRef(isFinished);
    const navRef = useRef();

    useEffect(() => {
        if (isFinished && !wasFinished.current) setShowResult(true);
        wasFinished.current = isFinished;
    }, [isFinished]);

    // Gulirkan nomor aktif agar terlihat
    useEffect(() => {
        const el = navRef.current?.querySelector(`[data-idx="${index}"]`);
        el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, [index]);

    // Pintasan keyboard: 1–5 / A–E memilih, panah kiri/kanan berpindah soal
    useEffect(() => {
        const onKey = (e) => {
            if (confirmOpen || leaveOpen || showResult || !q) return;
            const k = e.key.toUpperCase();
            const byNum = ['1', '2', '3', '4', '5'].indexOf(k);
            const byLetter = ['A', 'B', 'C', 'D', 'E'].indexOf(k);
            const optIdx = byNum >= 0 ? byNum : byLetter;
            if (optIdx >= 0 && q.options[optIdx] && !isFinished) onSelect(q.attempt_question_id, q.options[optIdx].label);
            if (e.key === 'ArrowRight') setIndex((i) => Math.min(questions.length - 1, i + 1));
            if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    const stars = attempt.score >= 90 ? 3 : attempt.score >= kkm ? 2 : attempt.score >= 50 ? 1 : 0;
    const longOptions = q?.options?.some((o) => (o.text || '').length > 70);
    const lowTime = isExam && !isFinished && remainingSec <= 300;

    let hostLine;
    if (isFinished) {
        hostLine = q?.is_correct ? 'Jawabanmu benar! Simak pembahasannya untuk memperkuat pemahaman.' : 'Belum tepat. Yuk, pelajari pembahasannya supaya lain kali benar!';
    } else if (isExam) {
        hostLine = 'Kerjakan dengan jujur dan teliti. Waktu dihitung oleh server.';
    } else {
        hostLine = PRACTICE_TIPS[index % PRACTICE_TIPS.length];
    }

    const theme = isExam
        ? { bg: 'from-slate-950 via-emerald-950 to-slate-950', chip: 'bg-emerald-400 text-emerald-950', label: 'ZONA UJIAN RESMI', host: 'Pengawas Ujian', preset: 'guru', hair: 'peci' }
        : { bg: 'from-sky-500 via-indigo-600 to-violet-700', chip: 'bg-banten-gold text-banten-night', label: 'ARENA LATIHAN SOAL', host: 'Pemandu Latihan', preset: 'duta', hair: 'short' };

    return (
        <div className={`relative min-h-screen bg-gradient-to-br ${theme.bg} text-white overflow-x-hidden`}>
            <div className="absolute inset-0 bg-batik-banten opacity-[0.12] pointer-events-none" />

            <div className="relative max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-5 space-y-3 sm:space-y-4">
                {/* Bar atas */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={() => (isExam && !isFinished ? setLeaveOpen(true) : onBack())}
                        className="btn-chunky p-2.5 rounded-2xl bg-slate-900/80 border border-white/20 cursor-pointer"
                        aria-label="Kembali ke dunia 3D"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="min-w-0 flex-1">
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-widest ${theme.chip}`}>{theme.label}</span>
                        <h1 className="font-game text-base sm:text-2xl leading-tight truncate text-stroke-game">
                            BAB {chapter.number}: {chapter.title}
                        </h1>
                    </div>
                    {isExam && !isFinished && (
                        <div className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl font-game text-lg sm:text-2xl border-2 ${lowTime ? 'bg-rose-600 border-rose-300 animate-pulse' : 'bg-slate-900/80 border-emerald-400/60'}`}>
                            <Clock className="w-5 h-5" />
                            {formatTimer(remainingSec)}
                        </div>
                    )}
                    <div className="hidden sm:flex flex-col items-end px-3 py-1.5 rounded-2xl bg-slate-900/70 border border-white/15">
                        <span className="text-[10px] font-bold text-white/70">Dijawab</span>
                        <span className="font-game text-lg leading-none">
                            {answered}/{questions.length}
                        </span>
                    </div>
                </div>

                {/* Navigasi nomor soal */}
                <div ref={navRef} className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:thin]">
                    {questions.map((x, i) => {
                        let cls = 'bg-white/15 border-white/25 text-white';
                        if (isFinished) cls = x.is_correct ? 'bg-emerald-500 border-emerald-200 text-white' : 'bg-rose-500 border-rose-200 text-white';
                        else if (x.is_answered) cls = 'bg-cyan-300 border-cyan-100 text-slate-950';
                        return (
                            <button
                                key={x.attempt_question_id}
                                data-idx={i}
                                type="button"
                                onClick={() => setIndex(i)}
                                className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl border-2 font-game text-base cursor-pointer transition ${cls} ${
                                    i === index ? 'ring-4 ring-white scale-110' : 'opacity-90 hover:opacity-100'
                                }`}
                            >
                                {x.order}
                            </button>
                        );
                    })}
                </div>

                {/* Pembawa kuis */}
                <div className="flex items-end gap-2">
                    <BlockyAvatar preset={theme.preset} hair={theme.hair} size={52} />
                    <div key={`${index}-${isFinished}`} className="relative animate-bubble-in rounded-2xl rounded-bl-md bg-white text-slate-800 px-3.5 py-2 text-xs sm:text-sm font-semibold shadow-lg border-b-4 border-slate-300 max-w-[85%]">
                        <span className="block text-[10px] font-black text-indigo-600 uppercase tracking-wider">{theme.host}</span>
                        {hostLine}
                    </div>
                </div>

                {/* Kartu soal */}
                {q && (
                    <div key={q.attempt_question_id} className="animate-bubble-in rounded-3xl bg-white text-slate-900 p-4 sm:p-6 shadow-2xl border-b-8 border-slate-300 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-game text-sm tracking-wide">
                                SOAL {q.order} / {attempt.total_questions || questions.length}
                            </span>
                            {!isFinished && q.is_answered && <span className="text-[11px] font-extrabold text-emerald-600">✓ Tersimpan otomatis</span>}
                            {isFinished && (
                                <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black text-white ${q.is_correct ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                    {q.is_correct ? 'BENAR' : 'SALAH'}
                                </span>
                            )}
                        </div>
                        {q.stimulus && (
                            <div className="rounded-2xl bg-amber-50 border-l-4 border-banten-gold px-4 py-3 text-[13px] text-slate-700 leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto">
                                {q.stimulus}
                            </div>
                        )}
                        <p className="text-[15px] sm:text-lg font-extrabold leading-relaxed whitespace-pre-line">{q.stem}</p>
                    </div>
                )}

                {/* Pilihan jawaban */}
                {q && (
                    <div className={`grid gap-2.5 sm:gap-3 ${longOptions ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                        {q.options.map((opt, i) => {
                            const selected = q.selected_label === opt.label;
                            const correct = isFinished && q.correct_label === opt.label;
                            const wrongPick = isFinished && selected && !correct;
                            let st = OPTION_STYLES[i % OPTION_STYLES.length];
                            if (correct) st = { ...OPTION_STYLES[3], dark: false };
                            else if (wrongPick) st = { ...OPTION_STYLES[0], dark: false };
                            let extra = '';
                            if (isFinished) extra = correct ? 'ring-4 ring-emerald-300 scale-[1.01]' : wrongPick ? 'ring-4 ring-rose-200' : 'opacity-45';
                            else if (selected) extra = 'ring-4 ring-white scale-[1.02]';
                            else if (q.selected_label) extra = 'opacity-75 hover:opacity-100';
                            return (
                                <button
                                    key={opt.label}
                                    type="button"
                                    disabled={isFinished}
                                    onClick={() => onSelect(q.attempt_question_id, opt.label)}
                                    className={`btn-chunky relative w-full text-left rounded-2xl bg-gradient-to-b ${st.bg} border-b-4 ${st.border} px-3 py-3 sm:py-4 flex items-start gap-3 cursor-pointer disabled:cursor-default transition ${extra} ${
                                        st.dark ? 'text-slate-950' : 'text-white'
                                    }`}
                                >
                                    <span className={`w-9 h-9 shrink-0 rounded-xl flex flex-col items-center justify-center font-game text-lg leading-none ${st.dark ? 'bg-slate-950/15' : 'bg-black/20'}`}>
                                        {opt.label}
                                        <span className="text-[8px] opacity-80">{st.shape}</span>
                                    </span>
                                    <span className="flex-1 text-[13px] sm:text-sm font-bold leading-snug whitespace-pre-line pt-1">{opt.text}</span>
                                    {(selected || correct) && (
                                        <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center animate-pop ${wrongPick ? 'bg-white text-rose-600' : 'bg-white text-emerald-600'}`}>
                                            {wrongPick ? <X className="w-4 h-4" strokeWidth={4} /> : <Check className="w-4 h-4" strokeWidth={4} />}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Pembahasan setelah dikumpulkan */}
                {isFinished && q?.explanation && (
                    <div className="animate-bubble-in rounded-3xl bg-slate-950/70 border-2 border-cyan-300/60 p-4 sm:p-5">
                        <p className="font-game text-cyan-200 text-base">Kunci: {q.correct_label} · Pembahasan</p>
                        <p className="text-sm text-slate-100 leading-relaxed mt-1 whitespace-pre-line">{q.explanation}</p>
                    </div>
                )}

                {/* Navigasi bawah */}
                <div className="flex items-center gap-2 pt-1 pb-6">
                    <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => setIndex((i) => Math.max(0, i - 1))}
                        className="btn-chunky px-4 py-3 rounded-2xl bg-slate-900/80 border border-white/20 font-game text-base flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                        <ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Sebelumnya</span>
                    </button>
                    <div className="flex-1" />
                    {isFinished ? (
                        <button type="button" onClick={() => setShowResult(true)} className="btn-chunky px-4 py-3 rounded-2xl bg-slate-900/80 border border-white/20 font-game text-base flex items-center gap-2 cursor-pointer">
                            <Star className="w-5 h-5 text-amber-300" /> Lihat Hasil
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirmOpen(true)}
                            className="btn-chunky px-4 py-3 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 font-game text-base flex items-center gap-2 cursor-pointer"
                        >
                            <Flag className="w-5 h-5" /> Kumpulkan
                        </button>
                    )}
                    {index < questions.length - 1 && (
                        <button
                            type="button"
                            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
                            className="btn-chunky px-4 py-3 rounded-2xl bg-gradient-to-b from-amber-300 to-orange-500 text-slate-950 font-game text-base flex items-center gap-1 cursor-pointer"
                        >
                            <span className="hidden sm:inline">Berikutnya</span> <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Konfirmasi kumpulkan */}
            {confirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="animate-pop w-full max-w-sm rounded-3xl bg-white text-slate-900 p-5 border-b-8 border-slate-300 text-center space-y-3">
                        <Flag className="w-10 h-10 mx-auto text-emerald-500" />
                        <h3 className="font-game text-2xl">Kumpulkan Jawaban?</h3>
                        <p className="text-sm text-slate-600">
                            Kamu sudah menjawab <b>{answered}</b> dari <b>{questions.length}</b> soal.
                        </p>
                        {unanswered.length > 0 && (
                            <p className="text-xs font-bold text-rose-600 bg-rose-50 rounded-xl px-3 py-2">Belum dijawab: nomor {unanswered.join(', ')}</p>
                        )}
                        <div className="flex gap-2 pt-1">
                            <button type="button" onClick={() => setConfirmOpen(false)} className="btn-chunky flex-1 py-3 rounded-2xl bg-slate-200 font-game text-base cursor-pointer">
                                Cek Lagi
                            </button>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => {
                                    setConfirmOpen(false);
                                    onSubmit();
                                }}
                                className="btn-chunky flex-1 py-3 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-white font-game text-base cursor-pointer disabled:opacity-60"
                            >
                                {submitting ? 'Mengirim...' : 'Ya, Kumpulkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Konfirmasi keluar saat ujian berjalan */}
            {leaveOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="animate-pop w-full max-w-sm rounded-3xl bg-white text-slate-900 p-5 border-b-8 border-slate-300 text-center space-y-3">
                        <Clock className="w-10 h-10 mx-auto text-amber-500" />
                        <h3 className="font-game text-2xl">Tinggalkan Ruang Ujian?</h3>
                        <p className="text-sm text-slate-600">Waktu ujian tetap berjalan di server. Jawaban yang sudah dipilih tetap tersimpan.</p>
                        <div className="flex gap-2 pt-1">
                            <button type="button" onClick={() => setLeaveOpen(false)} className="btn-chunky flex-1 py-3 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-white font-game text-base cursor-pointer">
                                Lanjut Ujian
                            </button>
                            <button type="button" onClick={onBack} className="btn-chunky flex-1 py-3 rounded-2xl bg-slate-200 font-game text-base cursor-pointer">
                                Keluar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Layar hasil */}
            {isFinished && showResult && (
                <>
                    {attempt.passed && <Confetti />}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
                        <div className="animate-pop relative w-full max-w-md rounded-[2rem] bg-gradient-to-b from-banten-night to-slate-950 border-4 border-banten-gold/80 p-6 text-center shadow-2xl">
                            <div className="absolute inset-0 rounded-[1.7rem] bg-batik-banten opacity-10 pointer-events-none" />
                            <div className="relative space-y-3">
                                <div className="flex justify-center gap-1">
                                    {[1, 2, 3].map((s) => (
                                        <Star
                                            key={s}
                                            className={`${s === 2 ? '-mt-3 w-12 h-12' : 'w-10 h-10'} ${s <= stars ? 'text-amber-300 fill-amber-300 animate-pop' : 'text-slate-600'}`}
                                            style={{ animationDelay: `${s * 0.2}s` }}
                                        />
                                    ))}
                                </div>
                                <h2 className={`font-game text-3xl sm:text-4xl text-stroke-game ${attempt.passed ? 'text-emerald-300' : 'text-rose-300'}`}>
                                    {attempt.passed ? (isExam ? 'UJIAN LULUS!' : 'LATIHAN LULUS!') : 'BELUM LULUS'}
                                </h2>
                                <div className="relative w-fit mx-auto">
                                    <ScoreRing score={attempt.score} passed={attempt.passed} />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="font-game text-5xl leading-none">{attempt.score}</span>
                                        <span className="text-[11px] font-bold text-white/70">KKM {kkm}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-200">
                                    <b>{attempt.correct_count}</b> benar dari <b>{attempt.total_questions}</b> soal.{' '}
                                    {attempt.passed
                                        ? isExam
                                            ? 'Selamat, BAB ini tuntas!'
                                            : 'Gerbang Zona Ujian Resmi kini terbuka!'
                                        : 'Pelajari pembahasan, lalu coba lagi. Kamu pasti bisa!'}
                                </p>
                                <div className="grid gap-2 pt-2">
                                    {!isExam && attempt.passed && canStartExam && (
                                        <button type="button" onClick={onStartExam} className="btn-chunky py-3 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 font-game text-lg flex items-center justify-center gap-2 cursor-pointer">
                                            <ShieldCheck className="w-5 h-5" /> Masuk Zona Ujian Resmi
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowResult(false);
                                            setIndex(0);
                                        }}
                                        className="btn-chunky py-3 rounded-2xl bg-gradient-to-b from-cyan-300 to-blue-600 font-game text-lg cursor-pointer"
                                    >
                                        Lihat Pembahasan
                                    </button>
                                    <div className="grid grid-cols-2 gap-2">
                                        {!isExam && (
                                            <button type="button" onClick={onRetry} className="btn-chunky py-3 rounded-2xl bg-gradient-to-b from-amber-300 to-orange-500 text-slate-950 font-game text-base flex items-center justify-center gap-1.5 cursor-pointer">
                                                <RotateCcw className="w-4 h-4" /> Ulangi
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={onBack}
                                            className={`btn-chunky py-3 rounded-2xl bg-slate-800 border border-white/20 font-game text-base flex items-center justify-center gap-1.5 cursor-pointer ${isExam ? 'col-span-2' : ''}`}
                                        >
                                            <Gamepad2 className="w-4 h-4" /> Dunia 3D
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
