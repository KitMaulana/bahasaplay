import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, MessagesSquare, RotateCcw, X } from 'lucide-react';
import BlockyAvatar, { npcLook } from '../../components/game/BlockyAvatar';
import { buildMaterialSteps } from '../lib/materialSlides';

/*
 * MaterialDialogue — materi disampaikan NPC sebagai percakapan bertahap (gaya chat game).
 * Siswa menekan "Lanjut" (atau Spasi/Enter) untuk membalas dan memunculkan penjelasan berikutnya.
 * Riwayat percakapan tetap bisa digulir; "Mode Baca" menampilkan materi utuh.
 */

const RICH =
    '[&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_strong]:font-extrabold [&_h3]:font-extrabold [&_h3]:mt-3 [&_h3]:mb-1 [&_table]:w-full [&_td]:border [&_td]:p-1 [&_th]:border [&_th]:p-1';

function TypingDots() {
    return (
        <span className="inline-flex gap-1 items-center h-5">
            {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
        </span>
    );
}

export default function MaterialDialogue({ material, npc, playerName, onClose, onComplete, completing }) {
    const firstName = (playerName || 'Siswa').split(' ')[0];
    const look = npc ? npcLook(npc) : { preset: 'guru', hair: 'peci' };
    const speaker = npc?.name || 'Pemandu Materi';
    const role = npc?.role_label || 'Pemandu Belajar BAHASA PLAY';

    const messages = useMemo(() => {
        const { steps, sections } = buildMaterialSteps(material?.content);
        const greet =
            npc?.dialogues?.[0]?.nodes?.[0]?.text || npc?.greeting || `Halo, ${firstName}! Saya akan menemanimu mempelajari materi ini.`;
        const intro = `Hari ini kita belajar <strong>${material?.title || 'materi baru'}</strong>.${
            sections.length > 1 ? ` Ada ${sections.length} bagian, kita bahas pelan-pelan, ya.` : ' Kita bahas pelan-pelan, ya.'
        }`;
        const outro = material?.is_completed
            ? `Mantap, ${firstName}! Materi ini sudah pernah kamu selesaikan. Kamu boleh mengulangnya kapan saja.`
            : `Keren, ${firstName}! Kamu sudah menyimak seluruh materi. Tandai selesai untuk mendapat <strong>+15 XP</strong> dan membuka langkah berikutnya.`;
        return [
            { html: `<p>${greet}</p>`, section: null, reply: 'Halo! Saya siap belajar.' },
            { html: `<p>${intro}</p>`, section: null, reply: 'Ayo mulai!' },
            ...steps,
            { html: `<p>${outro}</p>`, section: null, reply: null, final: true },
        ];
    }, [material, npc, firstName]);

    const [idx, setIdx] = useState(0);
    const [typing, setTyping] = useState(false);
    const [readMode, setReadMode] = useState(false);
    const scrollRef = useRef();
    const timer = useRef();

    const last = messages.length - 1;
    const atEnd = idx >= last && !typing;
    const progress = Math.round((idx / last) * 100);

    // Nomor bagian untuk chip topik
    const sectionNumbers = useMemo(() => {
        let n = 0;
        return messages.map((m) => (m.section ? ++n : null));
    }, [messages]);

    const next = () => {
        if (typing || idx >= last) return;
        setTyping(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            setIdx((i) => Math.min(last, i + 1));
            setTyping(false);
        }, 520);
    };

    useEffect(() => () => clearTimeout(timer.current), []);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, [idx, typing, readMode]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.code === 'Escape') onClose();
            if (readMode) return;
            if (['Space', 'Enter', 'ArrowRight', 'KeyE'].includes(e.code)) {
                e.preventDefault();
                next();
            }
        };
        window.addEventListener('keydown', onKey, true);
        return () => window.removeEventListener('keydown', onKey, true);
    });

    const completeBtn = !material?.is_completed ? (
        <button
            type="button"
            disabled={completing}
            onClick={onComplete}
            className="btn-chunky w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-white font-game text-lg tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
            <CheckCircle2 className="w-5 h-5" />
            {completing ? 'Menyimpan...' : 'Tandai Selesai (+15 XP)'}
        </button>
    ) : (
        <button
            type="button"
            onClick={onClose}
            className="btn-chunky w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-b from-cyan-400 to-blue-600 text-white font-game text-lg tracking-wide flex items-center justify-center gap-2 cursor-pointer"
        >
            <CheckCircle2 className="w-5 h-5" /> Kembali Menjelajah
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/75 backdrop-blur-sm animate-bubble-in">
            {/* Header */}
            <div className="shrink-0 px-3 sm:px-6 pt-3 pb-2 bg-gradient-to-b from-slate-950 to-slate-950/0">
                <div className="max-w-5xl mx-auto flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-banten-gold text-banten-night flex items-center justify-center shrink-0 btn-chunky">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">Percakapan Materi</p>
                        <h2 className="font-game text-base sm:text-xl text-white leading-tight truncate">{material?.title}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={() => setReadMode((v) => !v)}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-xs font-bold text-slate-200 hover:border-cyan-400 cursor-pointer"
                    >
                        {readMode ? <MessagesSquare className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                        {readMode ? 'Mode Percakapan' : 'Mode Baca'}
                    </button>
                    <button type="button" onClick={onClose} className="p-2 rounded-xl bg-slate-800 border border-slate-600 text-slate-300 hover:text-white cursor-pointer" aria-label="Tutup materi">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="max-w-5xl mx-auto mt-2 flex items-center gap-2">
                    <div className="flex-1 h-3 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-amber-300 via-banten-gold to-emerald-400 transition-all duration-500" style={{ width: `${readMode ? 100 : progress}%` }} />
                    </div>
                    <span className="text-[11px] font-extrabold text-amber-200 w-10 text-right">{readMode ? 100 : progress}%</span>
                </div>
            </div>

            {/* Isi */}
            <div className="flex-1 min-h-0 max-w-5xl w-full mx-auto flex gap-5 px-3 sm:px-6">
                {/* Potret NPC (desktop) */}
                <aside className="hidden md:flex w-52 shrink-0 flex-col items-center justify-end pb-6">
                    <div className="animate-float">
                        <BlockyAvatar preset={look.preset} hair={look.hair} size={150} talking={typing} />
                    </div>
                    <div className="mt-3 w-full rounded-2xl bg-slate-900/95 border-2 border-banten-gold/70 p-3 text-center">
                        <p className="font-game text-white text-base leading-tight">{speaker}</p>
                        <p className="text-[11px] text-amber-200/90 mt-0.5">{role}</p>
                    </div>
                </aside>

                <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto py-3 space-y-3 scroll-smooth">
                    {readMode ? (
                        <div className={`rounded-3xl bg-white text-slate-800 p-5 sm:p-6 text-sm leading-relaxed border-b-4 border-slate-300 ${RICH}`} dangerouslySetInnerHTML={{ __html: material?.content }} />
                    ) : (
                        messages.slice(0, idx + 1).map((m, i) => (
                            <React.Fragment key={i}>
                                {m.section && (
                                    <div className="flex justify-center animate-pop">
                                        <span className="px-3 py-1 rounded-full bg-banten-gold text-banten-night text-[11px] font-extrabold shadow">
                                            📘 {/^\d+[.)]/.test(m.section) ? m.section : `Bagian ${sectionNumbers[i]} · ${m.section}`}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-end gap-2 animate-bubble-in">
                                    <div className="md:hidden">
                                        <BlockyAvatar preset={look.preset} hair={look.hair} size={40} />
                                    </div>
                                    <div className="max-w-[88%] sm:max-w-[80%]">
                                        <p className="text-[10px] font-extrabold text-amber-200 mb-0.5 ml-2">{speaker}</p>
                                        <div className={`rounded-3xl rounded-bl-md bg-white text-slate-800 px-4 py-3 text-[13px] sm:text-sm leading-relaxed border-b-4 border-slate-300 shadow-lg ${RICH}`} dangerouslySetInnerHTML={{ __html: m.html }} />
                                    </div>
                                </div>
                                {(i < idx || (i === idx && typing)) && m.reply && (
                                    <div className="flex justify-end animate-bubble-in">
                                        <div className="max-w-[75%]">
                                            <p className="text-[10px] font-extrabold text-cyan-200 mb-0.5 mr-2 text-right">{playerName || 'Kamu'}</p>
                                            <div className="rounded-3xl rounded-br-md bg-cyan-400 text-slate-950 px-4 py-2.5 text-sm font-bold border-b-4 border-cyan-600 shadow-lg">{m.reply}</div>
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))
                    )}
                    {typing && !readMode && (
                        <div className="flex items-end gap-2">
                            <div className="md:hidden">
                                <BlockyAvatar preset={look.preset} hair={look.hair} size={40} talking />
                            </div>
                            <div className="rounded-3xl rounded-bl-md bg-white px-4 py-3 border-b-4 border-slate-300">
                                <TypingDots />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Aksi bawah */}
            <div className="shrink-0 px-3 sm:px-6 pb-4 pt-2 bg-gradient-to-t from-slate-950 to-slate-950/0">
                <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setReadMode((v) => !v)}
                        className="sm:hidden mr-auto flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-xs font-bold text-slate-200 cursor-pointer"
                    >
                        {readMode ? <MessagesSquare className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                        {readMode ? 'Percakapan' : 'Mode Baca'}
                    </button>
                    {!readMode && idx > 1 && (
                        <button
                            type="button"
                            onClick={() => {
                                setIdx(0);
                                setTyping(false);
                            }}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-xs font-bold text-slate-300 hover:text-white cursor-pointer mr-auto"
                        >
                            <RotateCcw className="w-4 h-4" /> Ulangi dari Awal
                        </button>
                    )}
                    {readMode || atEnd ? (
                        completeBtn
                    ) : (
                        <button
                            type="button"
                            onClick={next}
                            disabled={typing}
                            className="btn-chunky flex-1 sm:flex-none sm:min-w-[260px] px-6 py-3.5 rounded-2xl bg-gradient-to-b from-amber-300 to-orange-500 text-slate-950 font-game text-lg tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                        >
                            <span className="truncate">{messages[idx]?.reply || 'Lanjut'}</span>
                            <ChevronRight className="w-5 h-5 shrink-0" />
                            <span className="hidden sm:inline text-[10px] font-sans font-extrabold opacity-70 ml-1">[SPASI]</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
