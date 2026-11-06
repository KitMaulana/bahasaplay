import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowDownUp, BookOpen, CheckCircle2, Download, LogIn, MinusCircle, PenLine, Search, Trophy } from 'lucide-react';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import { formatDateTime } from '../../lib/format';
import { timeAgo } from './studentTable';

/*
 * Rekap Aktivitas Siswa — periode, ringkasan, grafik aktivitas harian, tabel per siswa, linimasa.
 * Grafik: satu seri (jumlah aktivitas/hari), batang satu warna #0891b2 (lolos validasi kontras
 * & pita kecerahan pada permukaan gelap), tanpa legenda; judul menamai seri; tooltip per batang.
 */

const BAR = '#0891b2';
const TZ = 'Asia/Jakarta';

function jakartaDate(offsetDays = 0) {
    const d = new Date(Date.now() + offsetDays * 86400000);
    return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

const PRESETS = [
    { key: 'today', label: 'Hari ini', range: () => [jakartaDate(0), jakartaDate(0)] },
    { key: '7', label: '7 hari', range: () => [jakartaDate(-6), jakartaDate(0)] },
    { key: '30', label: '30 hari', range: () => [jakartaDate(-29), jakartaDate(0)] },
    { key: 'month', label: 'Bulan ini', range: () => [jakartaDate(0).slice(0, 8) + '01', jakartaDate(0)] },
];

const ENGAGEMENT = {
    aktif: { label: 'Aktif', icon: CheckCircle2, cls: 'bg-lime-400/15 text-lime-200 border-lime-400/50' },
    jarang: { label: 'Jarang', icon: AlertCircle, cls: 'bg-amber-400/15 text-amber-200 border-amber-400/50' },
    belum: { label: 'Belum aktif', icon: MinusCircle, cls: 'bg-rose-500/15 text-rose-200 border-rose-400/50' },
};

const shortDate = (iso) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
const longDate = (iso) => new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));

function DailyChart({ daily }) {
    const [hover, setHover] = useState(null);
    const max = Math.max(1, ...daily.map((d) => d.count));
    const total = daily.reduce((a, d) => a + d.count, 0);
    if (!daily.length) return null;
    const mid = Math.floor(daily.length / 2);
    return (
        <div>
            <div className="relative h-40 flex">
                {/* Sumbu Y (resesif) */}
                <div className="flex flex-col justify-between text-[10px] text-slate-500 pr-2 pb-5 text-right w-8">
                    <span>{max}</span>
                    <span>0</span>
                </div>
                <div className="relative flex-1">
                    <div className="absolute inset-x-0 top-0 border-t border-dashed border-white/10" />
                    <div className="absolute inset-x-0 bottom-5 border-t border-white/20" />
                    <div className="absolute inset-x-0 top-0 bottom-5 flex items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
                        {daily.map((d, i) => (
                            <div
                                key={d.date}
                                className="relative flex-1 h-full flex items-end cursor-default"
                                onMouseEnter={() => setHover(i)}
                                onFocus={() => setHover(i)}
                                tabIndex={0}
                                aria-label={`${longDate(d.date)}: ${d.count} aktivitas`}
                            >
                                <div
                                    className="w-full rounded-t-[4px] transition-opacity"
                                    style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 3 : 0, background: BAR, opacity: hover === null || hover === i ? 1 : 0.55 }}
                                />
                            </div>
                        ))}
                    </div>
                    {/* Label sumbu X: awal, tengah, akhir */}
                    <div className="absolute inset-x-0 bottom-0 h-4 text-[10px] text-slate-500">
                        <span className="absolute left-0">{shortDate(daily[0].date)}</span>
                        {daily.length > 2 && (
                            <span className="absolute -translate-x-1/2" style={{ left: `${((mid + 0.5) / daily.length) * 100}%` }}>
                                {shortDate(daily[mid].date)}
                            </span>
                        )}
                        {daily.length > 1 && <span className="absolute right-0">{shortDate(daily[daily.length - 1].date)}</span>}
                    </div>
                    {hover !== null && (
                        <div
                            className="pointer-events-none absolute -top-2 -translate-y-full -translate-x-1/2 px-2.5 py-1.5 rounded-xl bg-slate-950 border-2 border-white/15 text-[11px] whitespace-nowrap shadow-xl z-10"
                            style={{ left: `${((hover + 0.5) / daily.length) * 100}%` }}
                        >
                            <span className="block text-slate-400">{longDate(daily[hover].date)}</span>
                            <span className="font-extrabold text-white">{daily[hover].count} aktivitas</span>
                        </div>
                    )}
                </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
                Total {total} aktivitas dalam {daily.length} hari.
            </p>
        </div>
    );
}

const COLUMNS = [
    { key: 'name', label: 'Siswa' },
    { key: 'logins', label: 'Login', num: true },
    { key: 'materials_completed', label: 'Materi', num: true },
    { key: 'practice_submitted', label: 'Latihan', num: true },
    { key: 'exam_submitted', label: 'Ujian', num: true },
    { key: 'avg_score', label: 'Rata-rata', num: true },
    { key: 'active_days', label: 'Hari aktif', num: true },
    { key: 'last_activity_at', label: 'Terakhir aktif' },
    { key: 'engagement', label: 'Keaktifan' },
];

export default function ActivityRecap({ classId, onOpenStudent }) {
    const [preset, setPreset] = useState('7');
    const [range, setRange] = useState(PRESETS[1].range());
    const [search, setSearch] = useState('');
    const [engagement, setEngagement] = useState('all');
    const [sortKey, setSortKey] = useState('total_activities');
    const [sortDir, setSortDir] = useState('desc');

    const params = { from: range[0], to: range[1], ...(classId ? { class_id: classId } : {}) };
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['teacher-activity-recap', params],
        queryFn: async () => (await api.get('/teacher/activity-recap', { params })).data.data,
    });

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        const list = (data?.students || []).filter(
            (s) => (!q || s.name.toLowerCase().includes(q) || String(s.nisn).includes(q)) && (engagement === 'all' || s.engagement === engagement)
        );
        const dir = sortDir === 'asc' ? 1 : -1;
        return [...list].sort((a, b) => {
            const va = a[sortKey] ?? -1;
            const vb = b[sortKey] ?? -1;
            if (typeof va === 'string' || typeof vb === 'string') return String(va).localeCompare(String(vb)) * dir;
            return (va - vb) * dir;
        });
    }, [data, search, engagement, sortKey, sortDir]);

    const exportUrl = `/api/v1/teacher/activity-recap/export?${new URLSearchParams(params).toString()}`;
    const sum = data?.summary;

    const toggleSort = (key) => {
        if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortKey(key);
            setSortDir(key === 'name' ? 'asc' : 'desc');
        }
    };

    return (
        <div className="space-y-5">
            {/* Periode */}
            <div className="flex flex-wrap items-center gap-2">
                {PRESETS.map((p) => (
                    <button
                        key={p.key}
                        type="button"
                        onClick={() => {
                            setPreset(p.key);
                            setRange(p.range());
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-extrabold border-2 cursor-pointer ${
                            preset === p.key ? 'bg-banten-gold text-banten-night border-banten-night' : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/30'
                        }`}
                    >
                        {p.label}
                    </button>
                ))}
                <span className="flex items-center gap-1.5 text-xs text-slate-300">
                    <input
                        type="date"
                        value={range[0]}
                        max={range[1]}
                        onChange={(e) => {
                            setPreset('custom');
                            setRange([e.target.value, range[1]]);
                        }}
                        className="px-2 py-1.5 rounded-xl bg-slate-950 border-2 border-white/10 text-white [color-scheme:dark]"
                        aria-label="Tanggal awal"
                    />
                    s.d.
                    <input
                        type="date"
                        value={range[1]}
                        min={range[0]}
                        onChange={(e) => {
                            setPreset('custom');
                            setRange([range[0], e.target.value]);
                        }}
                        className="px-2 py-1.5 rounded-xl bg-slate-950 border-2 border-white/10 text-white [color-scheme:dark]"
                        aria-label="Tanggal akhir"
                    />
                </span>
                <a href={exportUrl} className="btn-chunky ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-b from-lime-300 to-emerald-600 border-2 border-emerald-900/60 text-white text-xs font-extrabold">
                    <Download className="w-4 h-4" /> Unduh Rekap (Excel/CSV)
                </a>
            </div>

            {isLoading || !data ? (
                <div className="py-16 flex justify-center">
                    <div className="w-10 h-10 rounded-full border-4 border-banten-gold border-t-transparent animate-spin" />
                </div>
            ) : (
                <>
                    <div className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
                        {[
                            ['Siswa aktif', `${sum.active_students}/${sum.total_students}`, CheckCircle2, 'text-lime-300'],
                            ['Login', sum.logins, LogIn, 'text-white'],
                            ['Materi selesai', sum.materials_completed, BookOpen, 'text-white'],
                            ['Latihan dikumpulkan', sum.practice_submitted, PenLine, 'text-white'],
                            ['Ujian dikumpulkan', sum.exam_submitted, Trophy, 'text-white'],
                            ['Rata-rata nilai', sum.avg_score ?? '—', ArrowDownUp, 'text-banten-gold'],
                        ].map(([label, value, Icon, accent]) => (
                            <div key={label} className="rounded-2xl bg-slate-950/60 border-2 border-white/10 p-3">
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <Icon className="w-3.5 h-3.5" /> {label}
                                </p>
                                <p className={`font-game text-2xl sm:text-3xl leading-tight ${accent}`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    <Card title="Aktivitas Harian Siswa" subtitle={`${longDate(data.range.from)} – ${longDate(data.range.to)} · login, materi, latihan, dan ujian`}>
                        <DailyChart daily={data.daily} />
                    </Card>

                    <Card
                        title="Rekap per Siswa"
                        subtitle="Klik judul kolom untuk mengurutkan · klik nama untuk detail"
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
                                <select value={engagement} onChange={(e) => setEngagement(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-950 border-2 border-white/10 text-xs text-white">
                                    <option value="all">Semua keaktifan</option>
                                    <option value="aktif">Aktif</option>
                                    <option value="jarang">Jarang</option>
                                    <option value="belum">Belum aktif</option>
                                </select>
                            </div>
                        }
                    >
                        <div className="overflow-x-auto rounded-2xl border-2 border-white/10">
                            <table className="w-full text-xs">
                                <thead className="bg-banten-night text-amber-200/90 text-[11px] uppercase tracking-wider">
                                    <tr>
                                        {COLUMNS.map((c) => (
                                            <th key={c.key} className={`px-3 py-2.5 ${c.num ? 'text-right' : 'text-left'} whitespace-nowrap`}>
                                                <button type="button" onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 cursor-pointer hover:text-white">
                                                    {c.label}
                                                    {sortKey === c.key && <span>{sortDir === 'asc' ? '▲' : '▼'}</span>}
                                                </button>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {rows.map((s) => {
                                        const eg = ENGAGEMENT[s.engagement];
                                        return (
                                            <tr key={s.student_id} className="hover:bg-white/5">
                                                <td className="px-3 py-2">
                                                    <button type="button" onClick={() => onOpenStudent(s.student_id)} className="text-left cursor-pointer group">
                                                        <span className="block font-extrabold text-white group-hover:text-banten-gold">{s.name}</span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {s.class_name} · Lv {s.level}
                                                        </span>
                                                    </button>
                                                </td>
                                                <td className="px-3 py-2 text-right text-slate-200">{s.logins}</td>
                                                <td className="px-3 py-2 text-right text-slate-200">{s.materials_completed}</td>
                                                <td className="px-3 py-2 text-right text-slate-200">
                                                    {s.practice_submitted}
                                                    {s.practice_submitted > 0 && <span className="text-slate-500"> ({s.practice_passed} lulus)</span>}
                                                </td>
                                                <td className="px-3 py-2 text-right text-slate-200">{s.exam_submitted}</td>
                                                <td className="px-3 py-2 text-right font-extrabold text-white">{s.avg_score ?? '—'}</td>
                                                <td className="px-3 py-2 text-right text-slate-200">{s.active_days}</td>
                                                <td className="px-3 py-2 text-slate-300 whitespace-nowrap">{timeAgo(s.last_activity_at)}</td>
                                                <td className="px-3 py-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border-2 text-[11px] font-extrabold ${eg.cls}`}>
                                                        <eg.icon className="w-3.5 h-3.5" /> {eg.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {rows.length === 0 && (
                                        <tr>
                                            <td colSpan={COLUMNS.length} className="px-3 py-8 text-center text-slate-400">
                                                Tidak ada siswa yang cocok dengan filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-2">Keaktifan: Aktif = minimal 3 hari aktif atau 10 aktivitas dalam periode; Jarang = ada aktivitas; Belum aktif = tanpa aktivitas.</p>
                    </Card>

                    <Card title="Aktivitas Terbaru" subtitle="Maksimal 120 aktivitas terakhir dalam periode">
                        {data.feed.length === 0 ? (
                            <p className="text-xs text-slate-400">Belum ada aktivitas pada periode ini.</p>
                        ) : (
                            <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                                {data.feed.map((f) => (
                                    <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/60 border-2 border-white/5">
                                        <span className="w-8 h-8 shrink-0 rounded-lg bg-slate-800 flex items-center justify-center text-banten-gold">
                                            {f.action.startsWith('material') || f.action.startsWith('mission') ? (
                                                <BookOpen className="w-4 h-4" />
                                            ) : f.action.startsWith('practice') ? (
                                                <PenLine className="w-4 h-4" />
                                            ) : f.action.startsWith('exam') ? (
                                                <Trophy className="w-4 h-4" />
                                            ) : (
                                                <LogIn className="w-4 h-4" />
                                            )}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs text-white truncate">
                                                <button type="button" onClick={() => onOpenStudent(f.student_id)} className="font-extrabold hover:text-banten-gold cursor-pointer">
                                                    {f.student_name}
                                                </button>{' '}
                                                <span className="text-slate-300">{f.label.toLowerCase()}</span>
                                                {f.detail && <span className="text-slate-400"> · {f.detail}</span>}
                                            </p>
                                            <p className="text-[10px] text-slate-500">
                                                {f.class_name} · {formatDateTime(f.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
}
