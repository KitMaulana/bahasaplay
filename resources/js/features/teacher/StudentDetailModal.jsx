import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ClipboardCheck, Clock, PenLine, Trophy } from 'lucide-react';
import api from '../../lib/api';
import Modal from '../../components/ui/Modal';
import ProgressBar from '../../components/ui/ProgressBar';
import BlockyAvatar from '../../components/game/BlockyAvatar';
import { formatDateTime } from '../../lib/format';
import { timeAgo } from './studentTable';
import { StepChip } from './ProgressMonitor';

/** Detail progres satu siswa: kartu pemain, progres per BAB, riwayat latihan/ujian, linimasa aktivitas. */
export default function StudentDetailModal({ studentId, onClose }) {
    const { data, isLoading } = useQuery({
        queryKey: ['teacher-student-progress', studentId],
        queryFn: async () => (await api.get(`/teacher/students/${studentId}/progress`)).data.data,
        enabled: Boolean(studentId),
    });
    const s = data?.student;

    return (
        <Modal open={Boolean(studentId)} onClose={onClose} title="Detail Progres Siswa" size="xl">
            {isLoading || !data ? (
                <div className="py-10 flex justify-center">
                    <div className="w-10 h-10 rounded-full border-4 border-banten-gold border-t-transparent animate-spin" />
                </div>
            ) : (
                <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-4 rounded-3xl bg-gradient-to-br from-banten-teal/40 to-slate-950 border-2 border-white/10 p-4">
                        <BlockyAvatar preset="siswa" hair="short" size={64} />
                        <div className="min-w-0 flex-1">
                            <p className="font-game text-2xl text-white leading-tight">{s.name}</p>
                            <p className="text-xs text-slate-300">
                                NISN <span className="font-mono">{s.nisn}</span> · Kelas {s.class_name} · {s.is_active ? 'Akun aktif' : 'Akun nonaktif'}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Login terakhir: {timeAgo(s.last_login_at)}</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="text-center px-3 py-2 rounded-2xl bg-slate-950/70 border-2 border-white/10">
                                <p className="font-game text-2xl text-banten-gold leading-none">{s.level}</p>
                                <p className="text-[10px] font-bold text-slate-400">LEVEL</p>
                            </div>
                            <div className="text-center px-3 py-2 rounded-2xl bg-slate-950/70 border-2 border-white/10">
                                <p className="font-game text-2xl text-cyan-200 leading-none">{s.xp}</p>
                                <p className="text-[10px] font-bold text-slate-400">XP</p>
                            </div>
                        </div>
                    </div>

                    <section>
                        <h4 className="font-game text-lg text-white mb-2">Progres per BAB</h4>
                        <div className="grid sm:grid-cols-2 gap-2">
                            {data.chapters.map((c) => (
                                <div key={c.chapter_id} className={`rounded-2xl border-2 p-3 ${c.status === 'published' ? 'bg-slate-950/60 border-white/10' : 'bg-slate-950/30 border-dashed border-white/10 opacity-70'}`}>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <p className="text-xs font-extrabold text-white truncate">
                                            <span className="text-banten-gold font-game">BAB {c.number}</span> · {c.title}
                                        </p>
                                        {c.status !== 'published' && <span className="text-[10px] text-slate-400">draf</span>}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        <StepChip kind="learning" status={c.learning_status} progress={c.progress_percent} />
                                        <StepChip kind="practice" status={c.practice_status} score={c.best_practice_score} kkm={c.kkm} />
                                        <StepChip kind="exam" status={c.exam_status} score={c.exam_score} kkm={c.kkm} />
                                    </div>
                                    <ProgressBar value={c.progress_percent} size="sm" color="gold" />
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="grid lg:grid-cols-2 gap-4">
                        <section>
                            <h4 className="font-game text-lg text-white mb-2">Riwayat Latihan & Ujian</h4>
                            {data.attempts.length === 0 ? (
                                <p className="text-xs text-slate-400">Belum ada percobaan latihan atau ujian.</p>
                            ) : (
                                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                                    {data.attempts.map((a) => (
                                        <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/60 border-2 border-white/5">
                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.type === 'exam' ? 'bg-emerald-400' : 'bg-orange-400'} text-banten-night`}>
                                                {a.type === 'exam' ? <Trophy className="w-4 h-4" /> : <PenLine className="w-4 h-4" />}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-white truncate">
                                                    {a.type === 'exam' ? 'Ujian' : 'Latihan'} · {a.chapter}
                                                </p>
                                                <p className="text-[10px] text-slate-400">{formatDateTime(a.submitted_at || a.started_at)}</p>
                                            </div>
                                            {a.status === 'in_progress' ? (
                                                <span className="text-[11px] font-bold text-amber-200">Berjalan</span>
                                            ) : (
                                                <span className={`font-game text-lg ${a.passed ? 'text-lime-300' : 'text-rose-300'}`}>{a.score ?? '-'}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                        <section>
                            <h4 className="font-game text-lg text-white mb-2">Linimasa Aktivitas</h4>
                            {data.activities.length === 0 ? (
                                <p className="text-xs text-slate-400">Belum ada aktivitas tercatat.</p>
                            ) : (
                                <ol className="relative border-l-2 border-banten-gold/40 ml-2 space-y-2 max-h-72 overflow-y-auto pr-1">
                                    {data.activities.map((l) => (
                                        <li key={l.id} className="relative pl-4">
                                            <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-banten-gold border-2 border-slate-900" />
                                            <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                                {l.action.startsWith('material') ? <BookOpen className="w-3.5 h-3.5 text-cyan-300" /> : l.action.startsWith('auth') ? <Clock className="w-3.5 h-3.5 text-slate-400" /> : <ClipboardCheck className="w-3.5 h-3.5 text-lime-300" />}
                                                {l.label}
                                                {l.properties?.score !== undefined && <span className="text-slate-300 font-normal">· nilai {l.properties.score}</span>}
                                            </p>
                                            <p className="text-[10px] text-slate-400">{formatDateTime(l.created_at)}</p>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </section>
                    </div>
                </div>
            )}
        </Modal>
    );
}
