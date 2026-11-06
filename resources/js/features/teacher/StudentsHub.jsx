import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, BarChart3, Download, FileSpreadsheet, Printer, Settings2, Users } from 'lucide-react';
import api from '../../lib/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StudentRoster from './StudentRoster';
import ProgressMonitor from './ProgressMonitor';
import ActivityRecap from './ActivityRecap';
import StudentDetailModal from './StudentDetailModal';
import { AddStudentsModal, ClassManagerModal, EditStudentModal, ImportStudentsModal } from './StudentFormModals';

/*
 * Pusat Siswa untuk guru (dan admin):
 *  1. Data Siswa       — tambah manual (banyak baris), impor sekaligus, edit, aksi massal
 *  2. Pantau Progres   — matriks siswa × BAB, ringkasan kelas & per BAB
 *  3. Rekap Aktivitas  — periode, grafik harian, rekap per siswa, linimasa, ekspor
 *  4. Laporan Nilai    — ekspor Excel/PDF resmi, ringkasan kelas, siswa di bawah KKM
 * Filter kelas berlaku untuk semua tab.
 */

const TABS = [
    { key: 'data', label: 'Data Siswa', icon: Users, color: 'bg-lime-400' },
    { key: 'progress', label: 'Pantau Progres', icon: BarChart3, color: 'bg-sky-400' },
    { key: 'activity', label: 'Rekap Aktivitas', icon: Activity, color: 'bg-orange-400' },
    { key: 'report', label: 'Laporan Nilai', icon: FileSpreadsheet, color: 'bg-violet-400' },
];

function ReportTab({ classId }) {
    const { data } = useQuery({
        queryKey: ['teacher-reports', classId],
        queryFn: async () => (await api.get('/teacher/reports', { params: classId ? { class_id: classId } : {} })).data.data,
    });
    const q = classId ? `?class_id=${classId}` : '';
    const kkm = data?.kkm_default || 75;
    return (
        <div className="grid lg:grid-cols-2 gap-5">
            <Card title="Unduh Laporan Resmi" icon={Download} subtitle="Mengikuti filter kelas yang dipilih">
                <div className="grid sm:grid-cols-2 gap-3">
                    <a
                        href={`/api/v1/teacher/reports/export/excel${q}`}
                        className="btn-chunky flex flex-col items-start gap-1 p-4 rounded-2xl bg-gradient-to-b from-lime-300 to-emerald-600 border-2 border-emerald-900/60 text-white"
                    >
                        <FileSpreadsheet className="w-7 h-7" />
                        <span className="font-game text-lg">Excel (CSV)</span>
                        <span className="text-[11px] font-bold opacity-90">Rekap nilai latihan, ujian & ketuntasan</span>
                    </a>
                    <a
                        href={`/api/v1/teacher/reports/export/pdf${q}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-chunky flex flex-col items-start gap-1 p-4 rounded-2xl bg-gradient-to-b from-cyan-300 to-blue-600 border-2 border-blue-900/60 text-white"
                    >
                        <Printer className="w-7 h-7" />
                        <span className="font-game text-lg">Cetak / PDF</span>
                        <span className="text-[11px] font-bold opacity-90">Laporan berkop sekolah</span>
                    </a>
                </div>
            </Card>
            <Card title="Ringkasan per Kelas" icon={BarChart3}>
                <div className="space-y-2">
                    {(data?.class_summary || [])
                        .filter((c) => !classId || String(c.class_id) === String(classId))
                        .map((c) => (
                            <div key={c.class_id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border-2 border-white/10">
                                <span className="font-game text-lg text-banten-gold w-16">{c.class_name}</span>
                                <div className="flex-1 grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                                    <span>
                                        Siswa <b className="block text-white text-sm">{c.student_count}</b>
                                    </span>
                                    <span>
                                        Rata ujian <b className="block text-white text-sm">{c.avg_exam || '—'}</b>
                                    </span>
                                    <span>
                                        Tuntas <b className="block text-white text-sm">{c.completion_rate}%</b>
                                    </span>
                                </div>
                            </div>
                        ))}
                </div>
            </Card>
            <Card title={`Siswa di Bawah KKM ${kkm}`} icon={Activity} className="lg:col-span-2">
                {(data?.below_kkm_students || []).length === 0 ? (
                    <p className="text-xs text-slate-400">Belum ada siswa dengan nilai di bawah KKM pada filter ini.</p>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {data.below_kkm_students.map((s) => (
                            <div key={s.student_id} className="p-3 rounded-2xl bg-rose-500/10 border-2 border-rose-400/40">
                                <p className="text-xs font-extrabold text-white">{s.name}</p>
                                <p className="text-[11px] text-slate-300">
                                    {s.class_name} · latihan {s.avg_practice_score ?? '—'} · ujian {s.avg_exam_score ?? '—'}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

export default function StudentsHub({ notify }) {
    const queryClient = useQueryClient();
    const [params, setParams] = useSearchParams();
    const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'data';
    const classId = params.get('kelas') || '';
    const setParam = (key, value) => {
        const next = new URLSearchParams(params);
        if (value) next.set(key, value);
        else next.delete(key);
        setParams(next, { replace: true });
    };

    const [addOpen, setAddOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [classOpen, setClassOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [detailId, setDetailId] = useState(null);

    const { data: studentData } = useQuery({
        queryKey: ['teacher-students'],
        queryFn: async () => (await api.get('/teacher/students')).data.data,
    });
    const classes = studentData?.classes || [];
    const allStudents = studentData?.students || [];
    const students = useMemo(() => (classId ? allStudents.filter((s) => String(s.class_id) === String(classId)) : allStudents), [allStudents, classId]);
    const existingNisn = useMemo(() => new Set(allStudents.map((s) => String(s.nisn))), [allStudents]);

    const refresh = () => {
        ['teacher-students', 'teacher-reports', 'teacher-activity-recap', 'teacher-student-progress'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
    };
    const errMsg = (err, fallback) => {
        const errors = err?.response?.data?.errors;
        return (errors && Object.values(errors)[0]?.[0]) || err?.response?.data?.message || fallback;
    };

    const importMutation = useMutation({
        mutationFn: async (rows) => (await api.post('/teacher/students/import', { rows })).data,
        onSuccess: (res) => {
            refresh();
            notify(res.message);
        },
        onError: (err) => notify(errMsg(err, 'Gagal menyimpan data siswa.'), 'error'),
    });
    const submitRows = async (rows) => {
        try {
            const res = await importMutation.mutateAsync(rows);
            return res.data;
        } catch {
            return null;
        }
    };

    const updateMutation = useMutation({
        mutationFn: async (s) =>
            (
                await api.put(`/teacher/students/${s.id}`, {
                    name: s.name,
                    nisn: s.nisn,
                    school_class_id: s.school_class_id || null,
                    is_active: s.is_active !== false,
                    reset_password_to_nisn: Boolean(s.reset_password_to_nisn),
                })
            ).data,
        onSuccess: (res) => {
            refresh();
            setEditing(null);
            notify(res.message);
        },
        onError: (err) => notify(errMsg(err, 'Gagal memperbarui siswa.'), 'error'),
    });

    const [bulkBusy, setBulkBusy] = useState(false);
    const runBulk = async (action, list, extra) => {
        if (!list.length) return false;
        setBulkBusy(true);
        const results = await Promise.allSettled(
            list.map((s) => {
                if (action === 'delete') return api.delete(`/teacher/students/${s.id}`);
                return api.put(`/teacher/students/${s.id}`, {
                    name: s.name,
                    nisn: s.nisn,
                    school_class_id: action === 'move' ? extra : s.class_id,
                    is_active: action === 'activate' ? true : action === 'deactivate' ? false : s.is_active,
                    reset_password_to_nisn: action === 'reset',
                });
            })
        );
        setBulkBusy(false);
        refresh();
        const failed = results.filter((r) => r.status === 'rejected').length;
        const verb = { delete: 'dihapus', move: 'dipindahkan', activate: 'diaktifkan', deactivate: 'dinonaktifkan', reset: 'direset sandinya' }[action];
        notify(failed ? `${list.length - failed} siswa ${verb}, ${failed} gagal.` : `${list.length} siswa berhasil ${verb}.`, failed ? 'error' : 'success');
        return failed === 0;
    };

    const classMutation = useMutation({
        mutationFn: async ({ type, payload }) =>
            type === 'add' ? (await api.post('/teacher/classes', { name: payload })).data : (await api.delete(`/teacher/classes/${payload}`)).data,
        onSuccess: (res) => {
            refresh();
            notify(res.message);
        },
        onError: (err) => notify(errMsg(err, 'Gagal memproses kelas.'), 'error'),
    });

    return (
        <div className="space-y-5">
            {/* Filter kelas (berlaku untuk semua tab) */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold text-banten-night mr-1 px-2 py-0.5 rounded-lg bg-white/80 border-2 border-banten-night">Kelas:</span>
                {[{ id: '', name: 'Semua', students_count: allStudents.length }, ...classes].map((c) => {
                    const active = String(classId) === String(c.id);
                    return (
                        <button
                            key={c.id || 'all'}
                            type="button"
                            onClick={() => setParam('kelas', c.id)}
                            className={`px-3 py-1.5 rounded-xl border-2 text-xs font-extrabold cursor-pointer flex items-center gap-1.5 ${
                                active ? 'bg-banten-gold text-banten-night border-banten-night shadow-[0_3px_0_0_rgba(0,0,0,0.4)]' : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/30'
                            }`}
                        >
                            {c.name}
                            <span className={`px-1.5 rounded-md text-[10px] ${active ? 'bg-banten-night/15' : 'bg-white/10'}`}>{c.students_count}</span>
                        </button>
                    );
                })}
                <button type="button" onClick={() => setClassOpen(true)} className="px-3 py-1.5 rounded-xl border-2 border-dashed border-white/20 text-xs font-extrabold text-slate-300 hover:text-white cursor-pointer flex items-center gap-1.5">
                    <Settings2 className="w-3.5 h-3.5" /> Kelola Kelas
                </button>
            </div>

            {/* Tab bergaya game */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {TABS.map((t) => {
                    const active = tab === t.key;
                    return (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setParam('tab', t.key === 'data' ? '' : t.key)}
                            className={`btn-chunky flex items-center gap-2 px-3 py-3 rounded-2xl border-2 text-left cursor-pointer ${
                                active ? 'bg-gradient-to-b from-amber-100 to-banten-gold text-banten-night border-banten-night' : 'bg-slate-900 text-slate-200 border-white/10'
                            }`}
                            aria-pressed={active}
                        >
                            <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center border-2 border-banten-night/50 ${active ? 'bg-white/70' : t.color} text-banten-night`}>
                                <t.icon className="w-5 h-5" />
                            </span>
                            <span className="font-game text-base leading-tight">{t.label}</span>
                        </button>
                    );
                })}
            </div>

            {tab === 'data' && (
                <StudentRoster
                    students={students}
                    classes={classes}
                    busy={bulkBusy}
                    onAdd={() => setAddOpen(true)}
                    onImport={() => setImportOpen(true)}
                    onEdit={(s) => setEditing({ ...s, school_class_id: s.class_id })}
                    onOpenStudent={setDetailId}
                    onBulk={runBulk}
                />
            )}
            {tab === 'progress' && <ProgressMonitor classId={classId} onOpenStudent={setDetailId} />}
            {tab === 'activity' && <ActivityRecap classId={classId} onOpenStudent={setDetailId} />}
            {tab === 'report' && <ReportTab classId={classId} />}

            <AddStudentsModal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                classes={classes}
                defaultClassId={classId ? Number(classId) : undefined}
                existingNisn={existingNisn}
                onSubmit={submitRows}
                submitting={importMutation.isPending}
            />
            <ImportStudentsModal open={importOpen} onClose={() => setImportOpen(false)} classes={classes} existingNisn={existingNisn} onSubmit={submitRows} submitting={importMutation.isPending} />
            <EditStudentModal student={editing} onClose={() => setEditing(null)} classes={classes} onSubmit={(s) => updateMutation.mutate(s)} submitting={updateMutation.isPending} />
            <ClassManagerModal
                open={classOpen}
                onClose={() => setClassOpen(false)}
                classes={classes}
                busy={classMutation.isPending}
                onAdd={(name) => classMutation.mutate({ type: 'add', payload: name })}
                onDelete={(id) => classMutation.mutate({ type: 'delete', payload: id })}
            />
            <StudentDetailModal studentId={detailId} onClose={() => setDetailId(null)} />
            {classes.length === 0 && <Badge variant="warning">Belum ada kelas — tambahkan lewat "Kelola Kelas".</Badge>}
        </div>
    );
}
