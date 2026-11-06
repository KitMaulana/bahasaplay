import React, { useMemo, useState } from 'react';
import { CheckSquare, Edit3, Eye, KeyRound, Search, Square, Trash2, UserCheck, UserX, Users } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { timeAgo } from './studentTable';

/*
 * Daftar Siswa — pencarian, filter status, pilih banyak siswa untuk aksi massal
 * (pindah kelas, aktif/nonaktif, reset sandi ke NISN, hapus).
 */
export default function StudentRoster({ students, classes, onEdit, onOpenStudent, onBulk, busy, onAdd, onImport }) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [selected, setSelected] = useState(() => new Set());
    const [moveTo, setMoveTo] = useState('');

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return students.filter((s) => {
            if (q && !s.name.toLowerCase().includes(q) && !String(s.nisn).includes(q)) return false;
            if (status === 'active') return s.is_active;
            if (status === 'inactive') return !s.is_active;
            if (status === 'never') return !s.last_login_at;
            return true;
        });
    }, [students, search, status]);

    const visibleIds = rows.map((s) => s.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
    const chosen = students.filter((s) => selected.has(s.id));
    const toggle = (id) =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    const runBulk = async (action, extra) => {
        const ok = await onBulk(action, chosen, extra);
        if (ok) setSelected(new Set());
    };

    return (
        <Card
            title="Data Siswa"
            icon={Users}
            subtitle={`${rows.length} dari ${students.length} siswa ditampilkan`}
            action={
                <>
                    <Button size="sm" variant="success" onClick={onAdd}>
                        + Tambah Manual
                    </Button>
                    <Button size="sm" variant="warning" onClick={onImport}>
                        Impor Sekaligus
                    </Button>
                </>
            }
        >
            <div className="flex flex-wrap gap-2 mb-3">
                <span className="relative flex-1 min-w-[180px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama atau NISN..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border-2 border-white/10 text-sm text-white focus:outline-none focus:border-banten-gold"
                    />
                </span>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2.5 rounded-xl bg-slate-950 border-2 border-white/10 text-xs text-white">
                    <option value="all">Semua status</option>
                    <option value="active">Akun aktif</option>
                    <option value="inactive">Akun nonaktif</option>
                    <option value="never">Belum pernah login</option>
                </select>
            </div>

            {/* Bilah aksi massal */}
            {chosen.length > 0 && (
                <div className="animate-bubble-in sticky top-16 z-10 mb-3 flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-banten-night border-2 border-banten-gold/60 shadow-xl">
                    <span className="font-game text-base text-banten-gold px-1">{chosen.length} dipilih</span>
                    <select value={moveTo} onChange={(e) => setMoveTo(e.target.value)} className="px-2.5 py-1.5 rounded-xl bg-slate-950 border-2 border-white/10 text-xs text-white">
                        <option value="">Pindah ke kelas...</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <Button size="sm" disabled={!moveTo || busy} onClick={() => runBulk('move', Number(moveTo))}>
                        Pindahkan
                    </Button>
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => runBulk('activate')}>
                        <UserCheck className="w-4 h-4" /> Aktifkan
                    </Button>
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => runBulk('deactivate')}>
                        <UserX className="w-4 h-4" /> Nonaktifkan
                    </Button>
                    <Button
                        size="sm"
                        variant="warning"
                        disabled={busy}
                        onClick={() => window.confirm(`Reset kata sandi ${chosen.length} siswa kembali ke NISN masing-masing?`) && runBulk('reset')}
                    >
                        <KeyRound className="w-4 h-4" /> Reset Sandi
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        disabled={busy}
                        onClick={() => window.confirm(`Hapus ${chosen.length} siswa beserta seluruh data belajarnya? Tindakan ini tidak dapat dibatalkan.`) && runBulk('delete')}
                    >
                        <Trash2 className="w-4 h-4" /> Hapus
                    </Button>
                    <button type="button" onClick={() => setSelected(new Set())} className="ml-auto text-xs font-bold text-slate-300 hover:text-white cursor-pointer">
                        Batal pilih
                    </button>
                </div>
            )}

            {rows.length === 0 ? (
                <EmptyState
                    title="Belum ada siswa"
                    description="Tambahkan siswa secara manual atau impor sekaligus dari Excel/CSV."
                    action={
                        <Button variant="success" onClick={onAdd}>
                            + Tambah Siswa
                        </Button>
                    }
                />
            ) : (
                <div className="overflow-x-auto rounded-2xl border-2 border-white/10">
                    <table className="w-full text-xs">
                        <thead className="bg-banten-night text-amber-200/90 text-[11px] uppercase tracking-wider">
                            <tr>
                                <th className="px-3 py-2.5 w-10">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelected((prev) => {
                                                const next = new Set(prev);
                                                visibleIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
                                                return next;
                                            })
                                        }
                                        className="cursor-pointer text-amber-200"
                                        aria-label="Pilih semua"
                                    >
                                        {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                    </button>
                                </th>
                                <th className="px-3 py-2.5 text-left">Siswa</th>
                                <th className="px-3 py-2.5 text-left">NISN</th>
                                <th className="px-3 py-2.5 text-left">Kelas</th>
                                <th className="px-3 py-2.5 text-left">Status</th>
                                <th className="px-3 py-2.5 text-left">Login terakhir</th>
                                <th className="px-3 py-2.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {rows.map((s) => {
                                const isSel = selected.has(s.id);
                                return (
                                    <tr key={s.id} className={isSel ? 'bg-banten-gold/10' : 'hover:bg-white/5'}>
                                        <td className="px-3 py-2">
                                            <button type="button" onClick={() => toggle(s.id)} className="cursor-pointer text-slate-300" aria-label={`Pilih ${s.name}`}>
                                                {isSel ? <CheckSquare className="w-4 h-4 text-banten-gold" /> : <Square className="w-4 h-4" />}
                                            </button>
                                        </td>
                                        <td className="px-3 py-2">
                                            <button type="button" onClick={() => onOpenStudent(s.id)} className="flex items-center gap-2 text-left cursor-pointer group">
                                                <span className="w-8 h-8 rounded-lg bg-banten-teal text-white font-game flex items-center justify-center shrink-0">{s.name.charAt(0)}</span>
                                                <span className="font-extrabold text-white group-hover:text-banten-gold">{s.name}</span>
                                            </button>
                                        </td>
                                        <td className="px-3 py-2 font-mono text-cyan-200">{s.nisn}</td>
                                        <td className="px-3 py-2 text-slate-200">{s.class_name}</td>
                                        <td className="px-3 py-2">
                                            {s.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-lime-300 font-bold">
                                                    <UserCheck className="w-3.5 h-3.5" /> Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-rose-300 font-bold">
                                                    <UserX className="w-3.5 h-3.5" /> Nonaktif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-slate-300 whitespace-nowrap">{timeAgo(s.last_login_at)}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex justify-end gap-1.5">
                                                <Button size="sm" variant="secondary" onClick={() => onOpenStudent(s.id)} aria-label={`Detail ${s.name}`}>
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button size="sm" variant="secondary" onClick={() => onEdit(s)} aria-label={`Edit ${s.name}`}>
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    disabled={busy}
                                                    onClick={() => window.confirm(`Hapus siswa ${s.name}? Data belajarnya ikut terhapus.`) && onBulk('delete', [s])}
                                                    aria-label={`Hapus ${s.name}`}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}
