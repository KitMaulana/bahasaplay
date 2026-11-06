import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Eye, PenLine, Search, Trophy } from 'lucide-react';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import EmptyState from '../../components/ui/EmptyState';

/*
 * Pantau Progres — matriks siswa × BAB (materi, latihan, ujian) + ringkasan kelas & per BAB.
 * Warna status memakai palet status (baik/peringatan/kritis) selalu disertai ikon & teks.
 */

const TONE = {
    good: 'bg-lime-400/15 text-lime-200 border-lime-400/50',
    warn: 'bg-amber-400/15 text-amber-200 border-amber-400/50',
    bad: 'bg-rose-500/15 text-rose-200 border-rose-400/50',
    none: 'bg-slate-800/60 text-slate-500 border-white/10',
};

function stepInfo(kind, status, score, kkm, progress) {
    const hasScore = score !== null && score !== undefined;
    if (kind === 'learning') {
        if (status === 'completed') return { tone: 'good', text: 'Selesai' };
        // Baris progres dibuat otomatis berstatus in_progress; tanpa progres berarti belum mulai.
        if (status === 'in_progress' && Number(progress) > 0) return { tone: 'warn', text: 'Belajar' };
        return { tone: 'none', text: 'Belum' };
    }
    if (kind === 'practice') {
        if (status === 'passed') return { tone: 'good', text: hasScore ? Math.round(score) : 'Lulus' };
        if (hasScore) return { tone: Number(score) >= kkm ? 'good' : 'bad', text: Math.round(score) };
        if (status === 'available') return { tone: 'warn', text: 'Siap' };
        return { tone: 'none', text: '—' };
    }
    if (hasScore) return { tone: Number(score) >= kkm ? 'good' : 'bad', text: Math.round(score) };
    if (status === 'completed') return { tone: 'good', text: 'Selesai' };
    if (status === 'available') return { tone: 'warn', text: 'Siap' };
    return { tone: 'none', text: '—' };
}

const KIND = {
    learning: { icon: BookOpen, label: 'Materi' },
    practice: { icon: PenLine, label: 'Latihan' },
    exam: { icon: Trophy, label: 'Ujian' },
};

/** Chip status satu tahap (materi/latihan/ujian), dengan ikon + teks agar tidak bergantung warna saja. */
export function StepChip({ kind, status, score, kkm = 75, progress, compact = false }) {
    const info = stepInfo(kind, status, score, kkm, progress);
    const { icon: Icon, label } = KIND[kind];
    return (
        <span
            title={`${label}: ${info.text}`}
            className={`inline-flex items-center gap-1 rounded-lg border-2 font-extrabold ${TONE[info.tone]} ${compact ? 'px-1 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'}`}
        >
            <Icon className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            {!compact && <span>{label}</span>}
            <span>{info.text}</span>
        </span>
    );
}

function Stat({ label, value, sub, accent = 'text-white' }) {
    return (
        <div className="rounded-2xl bg-slate-950/60 border-2 border-white/10 p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
            <p className={`font-game text-2xl sm:text-3xl leading-tight ${accent}`}>{value}</p>
            {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
        </div>
    );
}

const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + Number(b), 0) / arr.length) : null);

export default function ProgressMonitor({ classId, onOpenStudent }) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('name');

    const { data, isLoading } = useQuery({
        queryKey: ['teacher-reports', classId],
        queryFn: async () => (await api.get('/teacher/reports', { params: classId ? { class_id: classId } : {} })).data.data,
    });

    const kkm = data?.kkm_default || 75;
    const chapters = data?.chapter_summary || [];
    const students = data?.students || [];

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        let list = students.filter((s) => !q || s.name.toLowerCase().includes(q) || String(s.nisn).includes(q));
        if (filter === 'not_started') list = list.filter((s) => Number(s.progress_percent) === 0);
        if (filter === 'attention')
            list = list.filter(
                (s) => (s.avg_practice_score !== null && s.avg_practice_score < kkm) || (s.avg_exam_score !== null && s.avg_exam_score < kkm)
            );
        if (filter === 'passed') list = list.filter((s) => s.passed_kkm);
        const sorted = [...list];
        if (sort === 'progress_desc') sorted.sort((a, b) => b.progress_percent - a.progress_percent);
        if (sort === 'progress_asc') sorted.sort((a, b) => a.progress_percent - b.progress_percent);
        return sorted;
    }, [students, search, filter, sort, kkm]);

    if (isLoading) {
        return (
            <div className="py-16 flex justify-center">
                <div className="w-10 h-10 rounded-full border-4 border-banten-gold border-t-transparent animate-spin" />
            </div>
        );
    }

    const total = students.length;
    const practiceScores = students.map((s) => s.avg_practice_score).filter((v) => v !== null);
    const examScores = students.map((s) => s.avg_exam_score).filter((v) => v !== null);
    const passedCount = students.filter((s) => s.passed_kkm).length;

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <Stat label="Siswa" value={total} sub={classId ? 'di kelas ini' : 'semua kelas'} />
                <Stat label="Rata-rata progres" value={`${avg(students.map((s) => s.progress_percent)) ?? 0}%`} accent="text-banten-gold" />
                <Stat label="Rata-rata latihan" value={avg(practiceScores) ?? '—'} sub={`${practiceScores.length} siswa berlatih`} accent="text-cyan-200" />
                <Stat label="Rata-rata ujian" value={avg(examScores) ?? '—'} sub={`${examScores.length} siswa ujian`} accent="text-cyan-200" />
                <Stat label={`Tuntas KKM ${kkm}`} value={`${passedCount}/${total}`} sub={total ? `${Math.round((passedCount / total) * 100)}% siswa` : ''} accent="text-lime-300" />
            </div>

            <Card title="Progres per BAB" subtitle="Jumlah siswa yang menuntaskan setiap tahap">
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {chapters.map((c) => (
                        <div key={c.chapter_id} className="rounded-2xl bg-slate-950/60 border-2 border-white/10 p-3 space-y-2">
                            <p className="text-xs font-extrabold text-white truncate">
                                <span className="font-game text-banten-gold">BAB {c.number}</span> · {c.title}
                            </p>
                            {[
                                ['Materi selesai', c.learning_completed_count, 'cyan'],
                                ['Latihan lulus', c.practice_passed_count, 'amber'],
                                ['Ujian selesai', c.exam_completed_count, 'emerald'],
                            ].map(([label, n, color]) => (
                                <div key={label} className="space-y-0.5">
                                    <div className="flex justify-between text-[11px] text-slate-300">
                                        <span>{label}</span>
                                        <span className="font-bold text-white">
                                            {n}/{total}
                                        </span>
                                    </div>
                                    <ProgressBar value={total ? (n / total) * 100 : 0} showPercent={false} size="sm" color={color} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </Card>

            <Card
                title="Matriks Progres Siswa"
                subtitle="Klik nama siswa untuk melihat detail progres & riwayatnya"
                action={
                    <div className="flex flex-wrap gap-2">
                        <span className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama / NISN"
                                className="pl-8 pr-3 py-2 rounded-xl bg-slate-950 border-2 border-white/10 text-xs text-white w-40 sm:w-48"
                            />
                        </span>
                        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-950 border-2 border-white/10 text-xs text-white">
                            <option value="all">Semua siswa</option>
                            <option value="attention">Perlu perhatian (&lt; KKM)</option>
                            <option value="not_started">Belum mulai</option>
                            <option value="passed">Sudah tuntas</option>
                        </select>
                        <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-950 border-2 border-white/10 text-xs text-white">
                            <option value="name">Urut nama</option>
                            <option value="progress_desc">Progres tertinggi</option>
                            <option value="progress_asc">Progres terendah</option>
                        </select>
                    </div>
                }
            >
                <div className="flex flex-wrap gap-2 mb-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" /> Materi
                    </span>
                    <span className="flex items-center gap-1">
                        <PenLine className="w-3.5 h-3.5" /> Latihan (nilai terbaik)
                    </span>
                    <span className="flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5" /> Ujian (nilai tertinggi)
                    </span>
                    <span className="text-lime-300">hijau = tuntas</span>
                    <span className="text-amber-200">kuning = berjalan</span>
                    <span className="text-rose-300">merah = di bawah KKM</span>
                </div>
                {rows.length === 0 ? (
                    <EmptyState title="Tidak ada siswa" description="Ubah filter kelas atau kata kunci pencarian." />
                ) : (
                    <div className="overflow-x-auto rounded-2xl border-2 border-white/10">
                        <table className="w-full text-xs">
                            <thead className="bg-banten-night text-amber-200/90 text-[11px] uppercase tracking-wider">
                                <tr>
                                    <th className="sticky left-0 z-10 bg-banten-night px-3 py-2.5 text-left min-w-[170px]">Siswa</th>
                                    <th className="px-3 py-2.5 text-left min-w-[120px]">Progres</th>
                                    {chapters.map((c) => (
                                        <th key={c.chapter_id} className="px-2 py-2.5 text-center min-w-[128px]" title={c.title}>
                                            BAB {c.number}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {rows.map((s) => {
                                    const byChapter = Object.fromEntries((s.chapters || []).map((c) => [c.chapter_id, c]));
                                    return (
                                        <tr key={s.student_id} className="hover:bg-white/5">
                                            <td className="sticky left-0 z-10 bg-slate-900 px-3 py-2">
                                                <button type="button" onClick={() => onOpenStudent(s.student_id)} className="text-left group cursor-pointer">
                                                    <span className="block font-extrabold text-white group-hover:text-banten-gold flex items-center gap-1">
                                                        {s.name} <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {s.class_name} · <span className="font-mono">{s.nisn}</span>
                                                    </span>
                                                </button>
                                            </td>
                                            <td className="px-3 py-2">
                                                <ProgressBar value={s.progress_percent} size="sm" color="gold" />
                                            </td>
                                            {chapters.map((c) => {
                                                const p = byChapter[c.chapter_id];
                                                return (
                                                    <td key={c.chapter_id} className="px-2 py-2">
                                                        <div className="flex justify-center gap-1">
                                                            <StepChip compact kind="learning" status={p?.learning_status} progress={p?.progress_percent} kkm={kkm} />
                                                            <StepChip compact kind="practice" status={p?.practice_status} score={p?.best_practice_score} kkm={kkm} />
                                                            <StepChip compact kind="exam" status={p?.exam_status} score={p?.exam_score} kkm={kkm} />
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
