import React, { useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardPaste, Download, FileUp, Info, Plus, Trash2, Upload } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { downloadTemplate, parseStudentTable, validateRows } from './studentTable';

const INPUT = 'w-full px-3 py-2.5 rounded-xl bg-slate-950 border-2 border-white/10 text-sm text-white focus:outline-none focus:border-banten-gold';

/** Ringkasan hasil impor dari server (dibuat/diperbarui/dilewati). */
export function ImportResult({ result }) {
    if (!result) return null;
    return (
        <div className="animate-bubble-in rounded-2xl border-2 border-lime-400/50 bg-lime-400/10 p-3 space-y-1.5">
            <p className="font-game text-base text-lime-200 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Impor selesai
            </p>
            <p className="text-xs text-slate-200">
                <b>{result.created}</b> siswa baru · <b>{result.updated}</b> diperbarui · <b>{result.skipped?.length || 0}</b> dilewati
            </p>
            {result.skipped?.length > 0 && (
                <ul className="text-[11px] text-amber-200 list-disc pl-5 max-h-28 overflow-y-auto">
                    {result.skipped.map((s, i) => (
                        <li key={i}>
                            Baris {s.row} ({s.nisn || 'tanpa NISN'}): {s.reason}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/** Tambah siswa manual: satu atau beberapa baris sekaligus. */
export function AddStudentsModal({ open, onClose, classes, defaultClassId, existingNisn, onSubmit, submitting }) {
    const blank = () => ({ nisn: '', name: '', class_id: defaultClassId || classes?.[0]?.id || '' });
    const [rows, setRows] = useState([blank()]);
    const [result, setResult] = useState(null);

    const checked = useMemo(
        () =>
            validateRows(
                rows.map((r) => ({ ...r, class_name: '' })),
                { existingNisn }
            ),
        [rows, existingNisn]
    );
    const filled = checked.filter((r) => r.nisn || r.name);
    const canSubmit = filled.length > 0 && filled.every((r) => r.ok) && !submitting;

    const update = (i, patch) => setRows((rs) => rs.map((r, k) => (k === i ? { ...r, ...patch } : r)));
    const close = () => {
        setRows([blank()]);
        setResult(null);
        onClose();
    };

    return (
        <Modal open={open} onClose={close} title="Tambah Siswa Manual" size="lg">
            <div className="space-y-3">
                <p className="text-xs text-slate-400">
                    Isi satu baris per siswa. Tekan <b className="text-white">+ Baris</b> untuk menambah banyak siswa sekaligus. Kata sandi awal = NISN.
                </p>
                <div className="space-y-2">
                    {rows.map((r, i) => {
                        const v = checked[i];
                        const touched = r.nisn || r.name;
                        return (
                            <div key={i} className="rounded-2xl bg-slate-950/60 border-2 border-white/10 p-2.5">
                                <div className="grid grid-cols-12 gap-2 items-center">
                                    <span className="col-span-1 font-game text-banten-gold text-center">{i + 1}</span>
                                    <input
                                        value={r.nisn}
                                        onChange={(e) => update(i, { nisn: e.target.value })}
                                        placeholder="NISN"
                                        inputMode="numeric"
                                        className={`${INPUT} col-span-11 sm:col-span-3 font-mono`}
                                        aria-label={`NISN baris ${i + 1}`}
                                    />
                                    <input
                                        value={r.name}
                                        onChange={(e) => update(i, { name: e.target.value })}
                                        placeholder="Nama lengkap"
                                        className={`${INPUT} col-span-12 sm:col-span-5`}
                                        aria-label={`Nama baris ${i + 1}`}
                                    />
                                    <select
                                        value={r.class_id}
                                        onChange={(e) => update(i, { class_id: Number(e.target.value) })}
                                        className={`${INPUT} col-span-10 sm:col-span-2`}
                                        aria-label={`Kelas baris ${i + 1}`}
                                    >
                                        {(classes || []).map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        disabled={rows.length === 1}
                                        onClick={() => setRows((rs) => rs.filter((_, k) => k !== i))}
                                        className="col-span-2 sm:col-span-1 p-2 rounded-xl text-rose-300 hover:bg-rose-500/15 disabled:opacity-30 cursor-pointer flex justify-center"
                                        aria-label={`Hapus baris ${i + 1}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                {touched && (v.errors.length > 0 || v.notes.length > 0) && (
                                    <p className={`text-[11px] mt-1.5 pl-1 ${v.errors.length ? 'text-rose-300' : 'text-amber-200'}`}>
                                        {[...v.errors, ...v.notes].join(' · ')}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setRows((rs) => [...rs, { ...blank(), class_id: rs[rs.length - 1]?.class_id || blank().class_id }])}>
                        <Plus className="w-4 h-4" /> Baris
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setRows((rs) => [...rs, ...Array.from({ length: 5 }, () => ({ ...blank(), class_id: rs[rs.length - 1]?.class_id || blank().class_id }))])}
                    >
                        <Plus className="w-4 h-4" /> 5 Baris
                    </Button>
                </div>

                <ImportResult result={result} />

                <div className="flex justify-end gap-2 pt-2 border-t-2 border-white/5">
                    <Button variant="secondary" onClick={close}>
                        Tutup
                    </Button>
                    <Button
                        variant="success"
                        disabled={!canSubmit}
                        onClick={async () => {
                            const res = await onSubmit(filled.map((r) => ({ nisn: r.nisn, name: r.name, class_id: r.class_id || null })));
                            if (res) {
                                setResult(res);
                                setRows([blank()]);
                            }
                        }}
                    >
                        <CheckCircle2 className="w-4 h-4" /> {submitting ? 'Menyimpan...' : `Simpan ${filled.length || ''} Siswa`}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

/** Impor massal: tempel dari Excel / unggah CSV → pratinjau tervalidasi → impor. */
export function ImportStudentsModal({ open, onClose, classes, existingNisn, onSubmit, submitting }) {
    const [text, setText] = useState('');
    const [defaultClass, setDefaultClass] = useState('');
    const [result, setResult] = useState(null);
    const [fileName, setFileName] = useState('');
    const fileRef = useRef();
    const classNames = useMemo(() => new Set((classes || []).map((c) => c.name)), [classes]);

    const rows = useMemo(() => {
        const parsed = parseStudentTable(text).map((r) => ({ ...r, class_name: r.class_name || defaultClass }));
        return validateRows(parsed, { existingNisn, classNames });
    }, [text, defaultClass, existingNisn, classNames]);
    const good = rows.filter((r) => r.ok);

    const close = () => {
        setText('');
        setResult(null);
        setFileName('');
        onClose();
    };

    return (
        <Modal open={open} onClose={close} title="Impor Siswa Sekaligus" size="xl">
            <div className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-slate-950/60 border-2 border-white/10 p-3 text-xs text-slate-300">
                        <ClipboardPaste className="w-5 h-5 text-banten-gold mb-1" />
                        <b className="text-white">1. Tempel dari Excel</b>
                        <p className="mt-0.5">Blok kolom NISN, Nama, Kelas di Excel → salin → tempel di kotak bawah.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="text-left rounded-2xl bg-slate-950/60 border-2 border-white/10 hover:border-banten-gold p-3 text-xs text-slate-300 cursor-pointer"
                    >
                        <FileUp className="w-5 h-5 text-banten-gold mb-1" />
                        <b className="text-white">2. Unggah berkas CSV</b>
                        <p className="mt-0.5">{fileName || 'Dari Excel: Simpan Sebagai → CSV. Klik untuk memilih berkas.'}</p>
                    </button>
                    <button
                        type="button"
                        onClick={downloadTemplate}
                        className="text-left rounded-2xl bg-slate-950/60 border-2 border-white/10 hover:border-banten-gold p-3 text-xs text-slate-300 cursor-pointer"
                    >
                        <Download className="w-5 h-5 text-banten-gold mb-1" />
                        <b className="text-white">Unduh templat</b>
                        <p className="mt-0.5">Templat CSV berkolom NISN, Nama Lengkap, Kelas.</p>
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".csv,.txt,text/csv,text/plain"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setFileName(file.name);
                            const reader = new FileReader();
                            reader.onload = () => setText(String(reader.result || ''));
                            reader.readAsText(file);
                            e.target.value = '';
                        }}
                    />
                </div>

                <textarea
                    rows={6}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={'NISN\tNama Lengkap\tKelas\n0081234511\tRaka Pratama\tXII-1\n0081234512\tDinda Permata\tXII-2'}
                    className={`${INPUT} font-mono text-xs`}
                    aria-label="Data siswa yang ditempel"
                />

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-300 font-bold">Kelas untuk baris tanpa kelas:</span>
                    <select value={defaultClass} onChange={(e) => setDefaultClass(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-950 border-2 border-white/10 text-white">
                        <option value="">XII-1 (bawaan)</option>
                        {(classes || []).map((c) => (
                            <option key={c.id} value={c.name}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                {rows.length > 0 && (
                    <div className="rounded-2xl border-2 border-white/10 overflow-hidden">
                        <div className="flex flex-wrap items-center gap-3 px-3 py-2 bg-banten-night text-xs">
                            <span className="font-game text-base text-white">Pratinjau</span>
                            <span className="text-lime-300 font-bold">{good.length} siap</span>
                            {rows.length - good.length > 0 && <span className="text-rose-300 font-bold">{rows.length - good.length} bermasalah (tidak diimpor)</span>}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            <table className="w-full text-xs">
                                <thead className="sticky top-0 bg-slate-900 text-slate-400">
                                    <tr>
                                        <th className="px-3 py-2 text-left">#</th>
                                        <th className="px-3 py-2 text-left">NISN</th>
                                        <th className="px-3 py-2 text-left">Nama</th>
                                        <th className="px-3 py-2 text-left">Kelas</th>
                                        <th className="px-3 py-2 text-left">Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {rows.map((r, i) => (
                                        <tr key={i} className={r.ok ? '' : 'bg-rose-500/10'}>
                                            <td className="px-3 py-1.5 text-slate-500">{i + 1}</td>
                                            <td className="px-3 py-1.5 font-mono text-cyan-200">{r.nisn || '—'}</td>
                                            <td className="px-3 py-1.5 text-white">{r.name || '—'}</td>
                                            <td className="px-3 py-1.5">{r.class_name || 'XII-1'}</td>
                                            <td className="px-3 py-1.5">
                                                {r.errors.length > 0 ? (
                                                    <span className="inline-flex items-center gap-1 text-rose-300">
                                                        <AlertTriangle className="w-3.5 h-3.5" /> {r.errors.join(', ')}
                                                    </span>
                                                ) : r.notes.length > 0 ? (
                                                    <span className="inline-flex items-center gap-1 text-amber-200">
                                                        <Info className="w-3.5 h-3.5" /> {r.notes.join(', ')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-lime-300">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Siswa baru
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <ImportResult result={result} />

                <div className="flex justify-end gap-2 pt-2 border-t-2 border-white/5">
                    <Button variant="secondary" onClick={close}>
                        Tutup
                    </Button>
                    <Button
                        variant="success"
                        disabled={!good.length || submitting}
                        onClick={async () => {
                            const res = await onSubmit(good.map((r) => ({ nisn: r.nisn, name: r.name, class_name: r.class_name || 'XII-1' })));
                            if (res) {
                                setResult(res);
                                setText('');
                                setFileName('');
                            }
                        }}
                    >
                        <Upload className="w-4 h-4" /> {submitting ? 'Mengimpor...' : `Impor ${good.length} Siswa`}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

/** Edit data satu siswa. */
export function EditStudentModal({ student, onClose, classes, onSubmit, submitting }) {
    const [form, setForm] = useState(null);
    const current = form && form.id === student?.id ? form : student ? { ...student, reset_password_to_nisn: false } : null;
    const set = (patch) => setForm({ ...current, ...patch });

    return (
        <Modal open={Boolean(student)} onClose={onClose} title="Edit Data Siswa" size="sm">
            {current && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit(current);
                    }}
                    className="space-y-3"
                >
                    <label className="block text-xs font-bold text-slate-300">
                        NISN (username login)
                        <input required value={current.nisn} onChange={(e) => set({ nisn: e.target.value })} className={`${INPUT} mt-1 font-mono`} />
                    </label>
                    <label className="block text-xs font-bold text-slate-300">
                        Nama lengkap
                        <input required value={current.name} onChange={(e) => set({ name: e.target.value })} className={`${INPUT} mt-1`} />
                    </label>
                    <label className="block text-xs font-bold text-slate-300">
                        Kelas
                        <select value={current.school_class_id || ''} onChange={(e) => set({ school_class_id: Number(e.target.value) })} className={`${INPUT} mt-1`}>
                            {(classes || []).map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-200">
                        <input type="checkbox" checked={current.is_active !== false} onChange={(e) => set({ is_active: e.target.checked })} className="w-4 h-4 accent-lime-400" />
                        Akun aktif (bisa login)
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-200">
                        <input type="checkbox" checked={Boolean(current.reset_password_to_nisn)} onChange={(e) => set({ reset_password_to_nisn: e.target.checked })} className="w-4 h-4 accent-amber-400" />
                        Reset kata sandi kembali ke NISN
                    </label>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="secondary" onClick={onClose}>
                            Batal
                        </Button>
                        <Button type="submit" variant="success" disabled={submitting}>
                            {submitting ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}

/** Kelola rombongan belajar (kelas). */
export function ClassManagerModal({ open, onClose, classes, onAdd, onDelete, busy }) {
    const [name, setName] = useState('');
    return (
        <Modal open={open} onClose={onClose} title="Kelola Kelas" size="sm">
            <div className="space-y-3">
                {(classes || []).map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-slate-950/60 border-2 border-white/10">
                        <div>
                            <p className="font-game text-base text-white">Kelas {c.name}</p>
                            <p className="text-[11px] text-slate-400">
                                {c.students_count} siswa · {c.academic_year}
                            </p>
                        </div>
                        <Button
                            variant="danger"
                            size="sm"
                            disabled={busy || c.students_count > 0}
                            title={c.students_count > 0 ? 'Pindahkan/hapus siswanya dulu' : 'Hapus kelas'}
                            onClick={() => window.confirm(`Hapus kelas ${c.name}?`) && onDelete(c.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (name.trim()) {
                            onAdd(name.trim());
                            setName('');
                        }
                    }}
                    className="flex gap-2"
                >
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kelas baru (mis. XII-4)" className={INPUT} />
                    <Button type="submit" disabled={busy}>
                        <Plus className="w-4 h-4" /> Tambah
                    </Button>
                </form>
                <p className="text-[11px] text-slate-500">Kelas yang masih berisi siswa tidak dapat dihapus.</p>
            </div>
        </Modal>
    );
}
