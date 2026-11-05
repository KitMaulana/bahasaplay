import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Shield,
    Users,
    Settings,
    Activity,
    Plus,
    Edit3,
    Trash2,
    BookOpen,
    Server,
    CheckCircle2,
} from 'lucide-react';
import api from '../lib/api';
import AppShell from '../components/layout/AppShell';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';

export default function AdminDashboardPage() {
    const location = useLocation();
    const queryClient = useQueryClient();
    const [toast, setToast] = useState(null);
    const [userModal, setUserModal] = useState(null);
    const [roleFilter, setRoleFilter] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: async () => (await api.get('/admin/dashboard')).data.data,
    });

    const [settingsForm, setSettingsForm] = useState({
        school_name: 'SMAN 1 Ciruas',
        academic_year: '2026/2027',
        kkm_default: 75,
        app_tagline: 'Mainkan gamenya, pelajari bahasanya.',
    });

    useEffect(() => {
        if (data?.settings) {
            setSettingsForm({
                school_name: data.settings.school_name || 'SMAN 1 Ciruas',
                academic_year: data.settings.academic_year || '2026/2027',
                kkm_default: data.settings.kkm_default || 75,
                app_tagline: data.settings.app_tagline || 'Mainkan gamenya, pelajari bahasanya.',
            });
        }
    }, [data]);

    const notify = (message, type = 'success') => setToast({ message, type });

    const saveUserMutation = useMutation({
        mutationFn: async (payload) => {
            if (payload.id) {
                return (await api.put(`/admin/users/${payload.id}`, payload)).data;
            }
            return (await api.post('/admin/users', payload)).data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
            setUserModal(null);
            notify(res.message);
        },
        onError: (err) => notify(err?.response?.data?.message || 'Gagal menyimpan akun.', 'error'),
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id) => (await api.delete(`/admin/users/${id}`)).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
            notify(res.message);
        },
        onError: (err) => notify(err?.response?.data?.message || 'Gagal menghapus akun.', 'error'),
    });

    const saveSettingsMutation = useMutation({
        mutationFn: async (payload) => (await api.put('/admin/settings', payload)).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
            notify(res.message);
        },
        onError: (err) =>
            notify(err?.response?.data?.message || 'Gagal menyimpan pengaturan.', 'error'),
    });

    if (isLoading || !data) {
        return (
            <AppShell title="Dashboard Administrator" subtitle="Memuat sistem manajemen BAHASA PLAY...">
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
                </div>
            </AppShell>
        );
    }

    const { stats, users = [], classes = [], roles = [], activity_logs = [] } = data;
    const filteredUsers = roleFilter ? users.filter((u) => u.role === roleFilter) : users;

    return (
        <AppShell
            title="Dashboard Administrator Sistem"
            subtitle={`${settingsForm.school_name} · Tahun Ajaran ${settingsForm.academic_year}`}
            actions={
                <Link
                    to="/teacher"
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5"
                >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Buka Panel LMS Guru</span>
                </Link>
            }
        >
            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

            {/* Statistik Utama Sistem */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                    <p className="text-xs text-slate-400">Total Akun Pengguna</p>
                    <p className="text-2xl font-extrabold text-white mt-1">{stats.total_users}</p>
                    <p className="text-[11px] text-cyan-400 mt-1">
                        {stats.total_admins} Admin · {stats.total_teachers} Guru · {stats.total_students} Siswa
                    </p>
                </Card>
                <Card>
                    <p className="text-xs text-slate-400">Konten LMS & Game 3D</p>
                    <p className="text-2xl font-extrabold text-white mt-1">
                        {stats.total_chapters} BAB
                    </p>
                    <p className="text-[11px] text-emerald-400 mt-1">
                        {stats.total_questions} Butir Soal (A–E)
                    </p>
                </Card>
                <Card>
                    <p className="text-xs text-slate-400">Total Sesi Latihan & Ujian</p>
                    <p className="text-2xl font-extrabold text-white mt-1">
                        {stats.total_attempts}
                    </p>
                    <p className="text-[11px] text-amber-300 mt-1">
                        {stats.total_classes} Kelas Aktif
                    </p>
                </Card>
                <Card>
                    <p className="text-xs text-slate-400">Lingkungan Server</p>
                    <p className="text-lg font-extrabold text-white mt-1">
                        PHP {stats.php_version}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                        Laravel v{stats.laravel_version} · MySQL Aktif
                    </p>
                </Card>
            </div>

            {/* Pengaturan Global Sekolah & KKM */}
            <Card
                title="Pengaturan Global Aplikasi & Standar KKM"
                subtitle="Perubahan KKM akan disinkronkan secara otomatis ke seluruh BAB pembelajaran"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        saveSettingsMutation.mutate({
                            ...settingsForm,
                            kkm_default: Number(settingsForm.kkm_default),
                        });
                    }}
                    className="grid sm:grid-cols-4 gap-4 items-end"
                >
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Nama Sekolah</label>
                        <input
                            required
                            value={settingsForm.school_name}
                            onChange={(e) =>
                                setSettingsForm({ ...settingsForm, school_name: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Tahun Ajaran</label>
                        <input
                            required
                            value={settingsForm.academic_year}
                            onChange={(e) =>
                                setSettingsForm({ ...settingsForm, academic_year: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">
                            Nilai KKM Default (1–100)
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            required
                            value={settingsForm.kkm_default}
                            onChange={(e) =>
                                setSettingsForm({ ...settingsForm, kkm_default: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                    </div>
                    <Button type="submit" disabled={saveSettingsMutation.isPending}>
                        <Settings className="w-4 h-4" />
                        <span>Simpan Pengaturan</span>
                    </Button>
                </form>
            </Card>

            {/* Manajemen Seluruh Pengguna (Admin, Guru, Siswa) */}
            <Card
                title={`Manajemen Akun Pengguna (${filteredUsers.length})`}
                subtitle="Kelola akun Administrator, Guru Bahasa Indonesia, dan Siswa Kelas XII"
                actions={
                    <div className="flex items-center gap-2">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                        >
                            <option value="">Semua Role</option>
                            <option value="admin">Administrator</option>
                            <option value="teacher">Guru</option>
                            <option value="student">Siswa</option>
                        </select>
                        <Button
                            size="sm"
                            onClick={() =>
                                setUserModal({
                                    name: '',
                                    username: '',
                                    email: '',
                                    role: 'student',
                                    password: '',
                                    school_class_id: classes[0]?.id || '',
                                })
                            }
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Akun</span>
                        </Button>
                    </div>
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                                <th className="py-2.5 px-3">Nama Lengkap</th>
                                <th className="py-2.5 px-3">Username / NISN</th>
                                <th className="py-2.5 px-3">Email</th>
                                <th className="py-2.5 px-3">Role</th>
                                <th className="py-2.5 px-3">Kelas</th>
                                <th className="py-2.5 px-3">Status</th>
                                <th className="py-2.5 px-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/70">
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-900/50">
                                    <td className="py-2.5 px-3 font-bold text-white">{u.name}</td>
                                    <td className="py-2.5 px-3 font-mono text-cyan-300">
                                        {u.username}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-400">
                                        {u.email || '-'}
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <Badge
                                            variant={
                                                u.role === 'admin'
                                                    ? 'warning'
                                                    : u.role === 'teacher'
                                                    ? 'info'
                                                    : 'success'
                                            }
                                        >
                                            {u.role.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="py-2.5 px-3">{u.class_name || '-'}</td>
                                    <td className="py-2.5 px-3">
                                        <Badge variant={u.is_active ? 'success' : 'danger'}>
                                            {u.is_active ? 'Aktif' : 'Nonaktif'}
                                        </Badge>
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                        <div className="inline-flex items-center gap-1.5">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() =>
                                                    setUserModal({
                                                        id: u.id,
                                                        name: u.name,
                                                        username: u.username,
                                                        email: u.email || '',
                                                        role: u.role,
                                                        password: '',
                                                        is_active: u.is_active,
                                                    })
                                                }
                                            >
                                                <Edit3 className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => deleteUserMutation.mutate(u.id)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Matriks Role & Permission + Log Aktivitas Sistem */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card
                    title="Matriks Role & Hak Akses (RBAC Spatie)"
                    subtitle="Otorisasi berlapis pada API dan antarmuka pengguna"
                >
                    <div className="space-y-3">
                        {roles.map((r) => (
                            <div
                                key={r.id}
                                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-extrabold text-white text-sm uppercase">
                                        Role: {r.name}
                                    </span>
                                    <Badge variant="info">{r.permissions.length} Hak Akses</Badge>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {r.permissions.map((perm) => (
                                        <span
                                            key={perm}
                                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                                        >
                                            {perm}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card
                    title="Log Aktivitas Sistem & Keamanan"
                    subtitle="40 aktivitas terbaru dari seluruh pengguna"
                >
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {activity_logs.map((log) => (
                            <div
                                key={log.id}
                                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                            >
                                <div>
                                    <p className="font-bold text-white">
                                        {log.action}{' '}
                                        <span className="text-cyan-400">({log.user_name})</span>
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                        IP: {log.ip_address || '127.0.0.1'} ·{' '}
                                        {log.created_at
                                            ? new Date(log.created_at).toLocaleString('id-ID')
                                            : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* MODAL TAMBAH / EDIT PENGGUNA */}
            <Modal
                open={!!userModal}
                onClose={() => setUserModal(null)}
                title={userModal?.id ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
            >
                {userModal && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            saveUserMutation.mutate(userModal);
                        }}
                        className="space-y-3"
                    >
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Role Akun</label>
                            <select
                                value={userModal.role}
                                onChange={(e) =>
                                    setUserModal({ ...userModal, role: e.target.value })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                            >
                                <option value="student">Siswa (Password default = NISN)</option>
                                <option value="teacher">Guru (Password default = smancir123)</option>
                                <option value="admin">Administrator (Password default = admin123)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">
                                Nama Lengkap
                            </label>
                            <input
                                required
                                value={userModal.name}
                                onChange={(e) =>
                                    setUserModal({ ...userModal, name: e.target.value })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">
                                    Username / NISN
                                </label>
                                <input
                                    required
                                    value={userModal.username}
                                    onChange={(e) =>
                                        setUserModal({ ...userModal, username: e.target.value })
                                    }
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">
                                    Email (Wajib untuk Guru)
                                </label>
                                <input
                                    type="email"
                                    value={userModal.email || ''}
                                    onChange={(e) =>
                                        setUserModal({ ...userModal, email: e.target.value })
                                    }
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">
                                Kata Sandi (Kosongkan untuk memakai sandi bawaan/tetap)
                            </label>
                            <input
                                type="password"
                                value={userModal.password || ''}
                                onChange={(e) =>
                                    setUserModal({ ...userModal, password: e.target.value })
                                }
                                placeholder="Kosongkan jika memakai default..."
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setUserModal(null)}
                            >
                                Batal
                            </Button>
                            <Button type="submit">Simpan Akun</Button>
                        </div>
                    </form>
                )}
            </Modal>
        </AppShell>
    );
}
