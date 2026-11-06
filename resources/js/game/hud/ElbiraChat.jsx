import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, ShieldCheck, Sparkles, Trash2, X } from 'lucide-react';
import api from '../../lib/axios';
import CatAvatar from '../../components/game/CatAvatar';

/*
 * ElbiraChat — jendela chat dengan Elbira, kucing asisten belajar AI.
 * Tampilan senada dengan percakapan NPC (MaterialDialogue). Jawaban AI dirender
 * dari teks biasa (bukan HTML) agar aman: hanya **tebal**, *miring*, poin, dan nomor.
 */

const MAX_LEN = 600;

function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function inline(s) {
    return escapeHtml(s)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>');
}

/** Markdown mini yang aman → HTML (teks di-escape lebih dulu). */
function renderReply(text) {
    const lines = String(text || '').split(/\r?\n/);
    let html = '';
    let list = null;
    const close = () => {
        if (list) html += `</${list}>`;
        list = null;
    };
    for (const raw of lines) {
        const line = raw.trim();
        const ul = line.match(/^[-*•]\s+(.*)$/);
        const ol = line.match(/^(\d+)[.)]\s+(.*)$/);
        if (ul) {
            if (list !== 'ul') {
                close();
                html += '<ul>';
                list = 'ul';
            }
            html += `<li>${inline(ul[1])}</li>`;
        } else if (ol) {
            if (list !== 'ol') {
                close();
                html += '<ol>';
                list = 'ol';
            }
            html += `<li>${inline(ol[2])}</li>`;
        } else if (line === '') {
            close();
        } else {
            close();
            html += `<p>${inline(line)}</p>`;
        }
    }
    close();
    return html;
}

const RICH = '[&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_strong]:font-extrabold [&_strong]:text-banten-night';

function TypingDots() {
    return (
        <span className="inline-flex gap-1 items-center h-5">
            {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
        </span>
    );
}

export function elbiraGreeting(playerName, chapter) {
    const first = (playerName || 'Sobat').split(' ')[0];
    return {
        role: 'elbira',
        text: `Meong~ Halo, ${first}! Aku **Elbira**, kucing asisten belajarmu 🐾\n\nKita sedang di dunia **BAB ${chapter?.number ?? ''}: ${chapter?.title ?? 'Bahasa Indonesia'}**. Tanyakan apa saja tentang materi BAB ini, kaidah kebahasaan, EYD, jenis teks, atau sastra Indonesia. Aku hanya menjawab seputar pelajaran Bahasa Indonesia, ya!`,
        local: true,
    };
}

export default function ElbiraChat({ chapter, playerName, messages, setMessages, onClose }) {
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef();
    const inputRef = useRef();

    const suggestions = useMemo(() => {
        const mats = (chapter?.materials || []).slice(0, 2).map((m) => `Jelaskan "${m.title}" secara singkat`);
        return [...mats, 'Apa ciri kalimat efektif?', 'Bantu cek ejaan kalimatku', 'Beri aku 1 soal latihan singkat'];
    }, [chapter]);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, [messages, sending]);

    useEffect(() => {
        inputRef.current?.focus();
        const onKey = (e) => {
            if (e.code === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };
        window.addEventListener('keydown', onKey, true);
        return () => window.removeEventListener('keydown', onKey, true);
    }, [onClose]);

    const send = async (text) => {
        const msg = (text ?? input).trim().slice(0, MAX_LEN);
        if (!msg || sending) return;
        const history = messages
            .filter((m) => !m.local && !m.error)
            .slice(-8)
            .map((m) => ({ role: m.role, text: m.text.slice(0, 1500) }));
        setMessages((prev) => [...prev, { role: 'user', text: msg }]);
        setInput('');
        setSending(true);
        try {
            const res = await api.post('/student/elbira/chat', { message: msg, chapter_id: chapter?.id, history });
            const d = res.data?.data || {};
            setMessages((prev) => [...prev, { role: 'elbira', text: d.reply || 'Meong?', offTopic: d.on_topic === false, local: d.source !== 'ai' }]);
        } catch (err) {
            const text =
                err?.response?.status === 429
                    ? 'Meong… kamu bertanya terlalu cepat. Tunggu satu menit, lalu tanya lagi, ya.'
                    : err?.response?.data?.errors?.message?.[0] || err?.response?.data?.message || 'Meong… Elbira gagal terhubung. Coba lagi, ya.';
            setMessages((prev) => [...prev, { role: 'elbira', text, error: true, local: true }]);
        } finally {
            setSending(false);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    };

    const first = (playerName || 'Kamu').split(' ')[0];
    const onlyGreeting = messages.length <= 1;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/75 backdrop-blur-sm animate-bubble-in" onKeyDown={(e) => e.stopPropagation()} onKeyUp={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="shrink-0 px-3 sm:px-6 pt-3 pb-2 bg-gradient-to-b from-slate-950 to-slate-950/0">
                <div className="max-w-5xl mx-auto flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-amber-200 to-orange-400 border-2 border-banten-night flex items-center justify-center shrink-0 btn-chunky overflow-hidden">
                        <CatAvatar size={38} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">Asisten Belajar AI</p>
                        <h2 className="font-game text-base sm:text-xl text-white leading-tight truncate">Ngobrol dengan Elbira 🐾</h2>
                    </div>
                    {!onlyGreeting && (
                        <button
                            type="button"
                            onClick={() => setMessages((prev) => prev.slice(0, 1))}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-xs font-bold text-slate-200 hover:border-rose-400 cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" /> Bersihkan
                        </button>
                    )}
                    <button type="button" onClick={onClose} className="p-2 rounded-xl bg-slate-800 border border-slate-600 text-slate-300 hover:text-white cursor-pointer" aria-label="Tutup chat Elbira">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="max-w-5xl mx-auto mt-2 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-emerald-200/90">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    Elbira hanya menjawab seputar pelajaran Bahasa Indonesia · tidak memberi kunci jawaban ujian
                </div>
            </div>

            {/* Isi */}
            <div className="flex-1 min-h-0 max-w-5xl w-full mx-auto flex gap-5 px-3 sm:px-6">
                <aside className="hidden md:flex w-52 shrink-0 flex-col items-center justify-end pb-6">
                    <div className="animate-float">
                        <CatAvatar size={150} talking={sending} />
                    </div>
                    <div className="mt-3 w-full rounded-2xl bg-slate-900/95 border-2 border-banten-gold/70 p-3 text-center">
                        <p className="font-game text-white text-base leading-tight">Elbira</p>
                        <p className="text-[11px] text-amber-200/90 mt-0.5">Kucing Asisten Belajar · Gemini AI</p>
                    </div>
                </aside>

                <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto py-3 space-y-3 scroll-smooth">
                    {messages.map((m, i) =>
                        m.role === 'user' ? (
                            <div key={i} className="flex justify-end animate-bubble-in">
                                <div className="max-w-[80%]">
                                    <p className="text-[10px] font-extrabold text-cyan-200 mb-0.5 mr-2 text-right">{first}</p>
                                    <div className="rounded-3xl rounded-br-md bg-cyan-400 text-slate-950 px-4 py-2.5 text-sm font-bold border-b-4 border-cyan-600 shadow-lg whitespace-pre-wrap break-words">{m.text}</div>
                                </div>
                            </div>
                        ) : (
                            <div key={i} className="flex items-end gap-2 animate-bubble-in">
                                <div className="md:hidden">
                                    <CatAvatar size={40} />
                                </div>
                                <div className="max-w-[88%] sm:max-w-[80%]">
                                    <p className="text-[10px] font-extrabold text-amber-200 mb-0.5 ml-2">Elbira</p>
                                    <div
                                        className={`rounded-3xl rounded-bl-md px-4 py-3 text-[13px] sm:text-sm leading-relaxed border-b-4 shadow-lg break-words ${RICH} ${
                                            m.offTopic || m.error ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-white text-slate-800 border-slate-300'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: renderReply(m.text) }}
                                    />
                                </div>
                            </div>
                        )
                    )}
                    {sending && (
                        <div className="flex items-end gap-2">
                            <div className="md:hidden">
                                <CatAvatar size={40} talking />
                            </div>
                            <div className="rounded-3xl rounded-bl-md bg-white px-4 py-3 border-b-4 border-slate-300">
                                <TypingDots />
                            </div>
                        </div>
                    )}
                    {onlyGreeting && !sending && (
                        <div className="flex flex-wrap gap-2 pl-0 md:pl-2 pt-1">
                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => send(s)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/90 border-2 border-amber-300/60 text-amber-100 text-xs font-bold hover:bg-amber-400 hover:text-banten-night cursor-pointer text-left"
                                >
                                    <Sparkles className="w-3.5 h-3.5 shrink-0" /> {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Masukan */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    send();
                }}
                className="shrink-0 px-3 sm:px-6 pb-4 pt-2 bg-gradient-to-t from-slate-950 to-slate-950/0"
            >
                <div className="max-w-5xl mx-auto flex items-end gap-2">
                    <div className="relative flex-1">
                        <textarea
                            ref={inputRef}
                            rows={1}
                            value={input}
                            maxLength={MAX_LEN}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    send();
                                }
                            }}
                            placeholder="Tulis pertanyaanmu…"
                            className="w-full resize-none max-h-32 pl-4 pr-14 py-3.5 rounded-2xl bg-white text-slate-900 text-sm font-semibold border-4 border-banten-night focus:outline-none focus:border-amber-400"
                        />
                        <span className={`absolute right-3 bottom-2 text-[10px] font-bold ${input.length > MAX_LEN - 60 ? 'text-rose-500' : 'text-slate-400'}`}>
                            {input.length}/{MAX_LEN}
                        </span>
                    </div>
                    <button
                        type="submit"
                        disabled={sending || !input.trim()}
                        className="btn-chunky shrink-0 h-[56px] px-4 sm:px-6 rounded-2xl bg-gradient-to-b from-amber-300 to-orange-500 border-4 border-banten-night text-banten-night font-game text-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        aria-label="Kirim pertanyaan"
                    >
                        <Send className="w-5 h-5" />
                        <span className="hidden sm:inline">Kirim</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
