import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    BookOpen,
    MapPin,
    HelpCircle,
    FileSpreadsheet,
    Sparkles,
    Users,
    Plus,
    Trash2,
    Edit3,
    CheckCircle2,
    XCircle,
    Download,
    Printer,
    Gamepad2,
    RefreshCw,
    Upload,
    AlertTriangle,
} from 'lucide-react';
import api from '../lib/api';
import AppShell from '../components/layout/AppShell';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import ProgressBar from '../components/ui/ProgressBar';

const MAP_PRESETS = [
    { value: 'cilegon', label: 'Kota Cilegon (Alun-Alun & Kawasan Industri Krakatau)' },
    { value: 'banten_lama', label: 'Kota Serang — Kawasan Masjid Agung Banten Lama' },
    { value: 'royal_baroe', label: 'Kota Serang — Kawasan Pertokoan Royal Baroe' },
    { value: 'gading_serpong', label: 'Kota Tangerang Selatan — Gedung Modern Gading Serpong' },
    { value: 'alun_tangsel', label: 'Kota Tangerang Selatan — Alun-Alun Kota' },
    { value: 'baduy', label: 'Kabupaten Lebak — Kawasan Adat Baduy' },
    { value: 'alun_lebak', label: 'Kabupaten Lebak — Alun-Alun Rangkasbitung' },
    { value: 'smancir', label: 'Kabupaten Serang — Kampus SMAN 1 Ciruas' },
];

export default function TeacherDashboardPage() {
    const location = useLocation();
    const queryClient = useQueryClient();
    const [toast, setToast] = useState(null);

    const path = location.pathname;
    const activeTab = path.includes('/chapters')
        ? 'chapters'
        : path.includes('/game-editor')
        ? 'game'
        : path.includes('/questions')
        ? 'questions'
        : path.includes('/exams')
        ? 'exams'
        : path.includes('/ai-generator')
        ? 'ai'
        : path.includes('/students')
        ? 'students'
        : 'overview';

    const notify = (message, type = 'success') => setToast({ message, type });

    // Queries
    const { data: overview } = useQuery({
        queryKey: ['teacher-overview'],
        queryFn: async () => (await api.get('/teacher/overview')).data.data,
    });

    const { data: chapters = [] } = useQuery({
        queryKey: ['teacher-chapters'],
        queryFn: async () => (await api.get('/teacher/chapters')).data.data,
    });

    const [selectedChapterId, setSelectedChapterId] = useState(null);
    const activeChapter =
        chapters.find((c) => c.id === Number(selectedChapterId)) || chapters[0] || null;

    // =========================================================
    // 1. STATE & MUTASI BAB & MATERI
    // =========================================================
    const [editingChapter, setEditingChapter] = useState(null);
    const [materialModal, setMaterialModal] = useState(null);

    const saveChapterMutation = useMutation({
        mutationFn: async (payload) => {
            if (payload.id) {
                return (await api.put(`/teacher/chapters/${payload.id}`, payload)).data;
            }
            return (await api.post('/teacher/chapters', payload)).data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-chapters'] });
            queryClient.invalidateQueries({ queryKey: ['teacher-overview'] });
            setEditingChapter(null);
            notify(res.message);
        },
        onError: (err) => notify(err?.response?.data?.message || 'Gagal menyimpan BAB.', 'error'),
    });

    const saveMaterialMutation = useMutation({
        mutationFn: async (payload) => {
            if (payload.id) {
                return (await api.put(`/teacher/materials/${payload.id}`, payload)).data;
            }
            return (await api.post(`/teacher/chapters/${payload.chapter_id}/materials`, payload)).data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-chapters'] });
            setMaterialModal(null);
            notify(res.message);
        },
        onError: (err) => notify(err?.response?.data?.message || 'Gagal menyimpan materi.', 'error'),
    });

    const deleteMaterialMutation = useMutation({
        mutationFn: async (id) => (await api.delete(`/teacher/materials/${id}`)).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-chapters'] });
            notify(res.message);
        },
    });

    // =========================================================
    // 2. STATE & MUTASI ZONA 3D, NPC, OBJEK & MISI
    // =========================================================
    const [npcForm, setNpcForm] = useState({
        name: '',
        role_label: '',
        greeting: '',
        shirt_color: '#0284c7',
        position_x: 2,
        position_z: -4,
        material_id: '',
    });
    const [objForm, setObjForm] = useState({
        label: '',
        type: 'board',
        position_x: -3,
        position_z: -5,
        material_id: '',
    });
    const [missionTitle, setMissionTitle] = useState('');
    const [missionDesc, setMissionDesc] = useState('');

    const updateZoneMutation = useMutation({
        mutationFn: async ({ zoneId, payload }) =>
            (await api.put(`/teacher/zones/${zoneId}`, payload)).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-chapters'] });
            notify(res.message);
        },
    });

    const addNpcMutation = useMutation({
        mutationFn: async ({ zoneId, payload }) =>
            (await api.post(`/teacher/zones/${zoneId}/npcs`, payload)).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-chapters'] });
            setNpcForm({
                name: '',
                role_label: '',
                greeting: '',
                shirt_color: '#0284c7',
                position_x: 2,
                position_z: -4,
                material_id: '',
            });
            notify(res.message);
        },
    });

    const deleteNpcMutation = useMutation({
        mutationFn: async (id) => (await api.delete(`/teacher/npcs/${id}`)).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-chapters'] });
            notify(res.message);
        },
    });

    const addInteractableMutation = useMutation({
        mutationFn: async ({ zoneId, payload }) =>
            (await api.post(`/teacher/zones/${zoneId}/interactables`, payload)).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-chapters'] });
            setObjForm({
                label: '',
                type: 'board',
                position_x: -3,
                position_z: -5,
                material_id: '',
            });
            notify(res.message);
        },
    });

    const deleteInteractableMutation = useMutation({
        mutationFn: async (id) => (await api.delete(`/teacher/interactables/${id}`)).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-chapters'] });
            notify(res.message);
        },
    });

    const addMissionMutation = useMutation({
        mutationFn: async ({ chapterId, payload }) =>
            (await api.post(`/teacher/chapters/${chapterId}/missions`, payload)).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-chapters'] });
            setMissionTitle('');
            setMissionDesc('');
            notify(res.message);
        },
    });

    const deleteMissionMutation = useMutation({
        mutationFn: async (id) => (await api.delete(`/teacher/missions/${id}`)).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-chapters'] });
            notify(res.message);
        },
    });

    // =========================================================
    // 3. BANK SOAL & PRACTICE CONFIG
    // =========================================================
    const [filterChapterQ, setFilterChapterQ] = useState('');
    const [questionModal, setQuestionModal] = useState(null);

    const { data: questions = [] } = useQuery({
        queryKey: ['teacher-questions', filterChapterQ],
        queryFn: async () =>
            (
                await api.get('/teacher/questions', {
                    params: filterChapterQ ? { chapter_id: filterChapterQ } : {},
                })
            ).data.data,
        enabled: activeTab === 'questions' || activeTab === 'overview',
    });

    const saveQuestionMutation = useMutation({
        mutationFn: async (payload) => {
            if (payload.id) {
                return (await api.put(`/teacher/questions/${payload.id}`, payload)).data;
            }
            return (await api.post('/teacher/questions', payload)).data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-questions'] });
            queryClient.invalidateQueries({ queryKey: ['teacher-overview'] });
            setQuestionModal(null);
            notify(res.message);
        },
        onError: (err) => notify(err?.response?.data?.message || 'Gagal menyimpan soal.', 'error'),
    });

    const deleteQuestionMutation = useMutation({
        mutationFn: async (id) => (await api.delete(`/teacher/questions/${id}`)).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-questions'] });
            notify(res.message);
        },
    });

    const savePracticeConfigMutation = useMutation({
        mutationFn: async ({ chapterId, payload }) =>
            (await api.put(`/teacher/chapters/${chapterId}/practice-config`, payload)).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-chapters'] });
            notify(res.message);
        },
    });

    // =========================================================
    // 4. UJIAN RESMI & REMEDIAL
    // =========================================================
    const [examModal, setExamModal] = useState(null);
    const [remedialModal, setRemedialModal] = useState(null);

    const { data: exams = [] } = useQuery({
        queryKey: ['teacher-exams'],
        queryFn: async () => (await api.get('/teacher/exams')).data.data,
        enabled: activeTab === 'exams' || activeTab === 'overview',
    });

    const saveExamMutation = useMutation({
        mutationFn: async (payload) => {
            if (payload.id) {
                return (await api.put(`/teacher/exams/${payload.id}`, payload)).data;
            }
            return (await api.post('/teacher/exams', payload)).data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-exams'] });
            setExamModal(null);
            notify(res.message);
        },
        onError: (err) => notify(err?.response?.data?.message || 'Gagal menyimpan ujian.', 'error'),
    });

    const deleteExamMutation = useMutation({
        mutationFn: async (id) => (await api.delete(`/teacher/exams/${id}`)).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-exams'] });
            notify(res.message);
        },
    });

    const grantRemedialMutation = useMutation({
        mutationFn: async ({ examId, user_id, extra_attempts }) =>
            (await api.post(`/teacher/exams/${examId}/remedial`, { user_id, extra_attempts })).data,
        onSuccess: (res) => {
            setRemedialModal(null);
            notify(res.message);
        },
        onError: (err) => notify(err?.response?.data?.message || 'Gagal memberikan remedial.', 'error'),
    });

    // =========================================================
    // 5. AI QUESTION GENERATOR (GEMINI API)
    // =========================================================
    const [aiChapterId, setAiChapterId] = useState('');
    const [aiMaterialId, setAiMaterialId] = useState('');
    const [aiCount, setAiCount] = useState(3);
    const [aiDifficulty, setAiDifficulty] = useState('medium');

    const { data: aiGenerations = [] } = useQuery({
        queryKey: ['teacher-ai-generations'],
        queryFn: async () => (await api.get('/teacher/ai/generations')).data.data,
        enabled: activeTab === 'ai',
    });

    const generateAiMutation = useMutation({
        mutationFn: async (payload) =>
            (await api.post('/teacher/ai/questions/generate', payload)).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-ai-generations'] });
            notify(res.message);
        },
        onError: (err) => notify(err?.response?.data?.message || 'Gagal membuat soal AI.', 'error'),
    });

    const approveAiItemMutation = useMutation({
        mutationFn: async (itemId) =>
            (await api.post(`/teacher/ai/items/${itemId}/approve`)).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-ai-generations'] });
            queryClient.invalidateQueries({ queryKey: ['teacher-questions'] });
            notify(res.message);
        },
    });

    const rejectAiItemMutation = useMutation({
        mutationFn: async (itemId) =>
            (await api.post(`/teacher/ai/items/${itemId}/reject`)).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-ai-generations'] });
            notify(res.message);
        },
    });

    // =========================================================
    // 6. SISWA, KELAS & LAPORAN LENGKAP
    // =========================================================
    const [studentModal, setStudentModal] = useState(null);
    const [importText, setImportText] = useState('');
    const [newClassName, setNewClassName] = useState('');
    const [reportClassFilter, setReportClassFilter] = useState('');

    const { data: studentData } = useQuery({
        queryKey: ['teacher-students'],
        queryFn: async () => (await api.get('/teacher/students')).data.data,
        enabled: activeTab === 'students' || activeTab === 'exams',
    });

    const { data: reportData } = useQuery({
        queryKey: ['teacher-reports', reportClassFilter],
        queryFn: async () =>
            (
                await api.get('/teacher/reports', {
                    params: reportClassFilter ? { class_id: reportClassFilter } : {},
                })
            ).data.data,
        enabled: activeTab === 'students' || activeTab === 'overview',
    });

    const saveStudentMutation = useMutation({
        mutationFn: async (payload) => {
            if (payload.id) {
                return (await api.put(`/teacher/students/${payload.id}`, payload)).data;
            }
            return (await api.post('/teacher/students', payload)).data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-students'] });
            queryClient.invalidateQueries({ queryKey: ['teacher-reports'] });
            setStudentModal(null);
            notify(res.message);
        },
        onError: (err) => notify(err?.response?.data?.message || 'Gagal menyimpan siswa.', 'error'),
    });

    const deleteStudentMutation = useMutation({
        mutationFn: async (id) => (await api.delete(`/teacher/students/${id}`)).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-students'] });
            queryClient.invalidateQueries({ queryKey: ['teacher-reports'] });
            notify(res.message);
        },
    });

    const importStudentsMutation = useMutation({
        mutationFn: async (rows) => (await api.post('/teacher/students/import', { rows })).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-students'] });
            queryClient.invalidateQueries({ queryKey: ['teacher-reports'] });
            setImportText('');
            notify(res.message);
        },
        onError: (err) => notify(err?.response?.data?.message || 'Gagal mengimpor siswa.', 'error'),
    });

    const addClassMutation = useMutation({
        mutationFn: async (name) => (await api.post('/teacher/classes', { name })).data,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['teacher-students'] });
            setNewClassName('');
            notify(res.message);
        },
    });

    return (
        <AppShell
            title="Dashboard Guru Bahasa Indonesia"
            subtitle="Bangkit Candra Maulana, S.Pd. · SMAN 1 Ciruas"
        >
            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

            {/* Sub-Navigasi Cepat Antar Modul Guru */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800">
                {[
                    { to: '/teacher', key: 'overview', label: 'Ringkasan', icon: BookOpen },
                    { to: '/teacher/chapters', key: 'chapters', label: 'BAB & Materi (BAB 5 Dinamis)', icon: BookOpen },
                    { to: '/teacher/game-editor', key: 'game', label: 'Zona & NPC 3D', icon: MapPin },
                    { to: '/teacher/questions', key: 'questions', label: 'Bank Soal & Latihan', icon: HelpCircle },
                    { to: '/teacher/exams', key: 'exams', label: 'Ujian & Remedial', icon: FileSpreadsheet },
                    { to: '/teacher/ai-generator', key: 'ai', label: 'AI Question Generator', icon: Sparkles },
                    { to: '/teacher/students', key: 'students', label: 'Siswa & Laporan Nilai', icon: Users },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                        <Link
                            key={tab.key}
                            to={tab.to}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition ${
                                active
                                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                                    : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* =====================================================
                TAB 1: RINGKASAN
               ===================================================== */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Card>
                            <p className="text-xs text-slate-400">Total Siswa Kelas XII</p>
                            <p className="text-2xl font-extrabold text-white mt-1">
                                {overview?.total_students ?? 10}
                            </p>
                            <p className="text-[11px] text-cyan-400 mt-1">
                                {overview?.total_classes ?? 3} Kelas Aktif
                            </p>
                        </Card>
                        <Card>
                            <p className="text-xs text-slate-400">BAB Pembelajaran</p>
                            <p className="text-2xl font-extrabold text-white mt-1">
                                {overview?.published_chapters ?? 5} / {overview?.total_chapters ?? 6}
                            </p>
                            <p className="text-[11px] text-amber-300 mt-1">
                                BAB 5 siap dikonfigurasi
                            </p>
                        </Card>
                        <Card>
                            <p className="text-xs text-slate-400">Butir Bank Soal (A–E)</p>
                            <p className="text-2xl font-extrabold text-white mt-1">
                                {overview?.total_questions ?? 50}
                            </p>
                            <p className="text-[11px] text-emerald-400 mt-1">
                                Manual + Google Gemini AI
                            </p>
                        </Card>
                        <Card>
                            <p className="text-xs text-slate-400">Siswa Belum Tuntas KKM 75</p>
                            <p className="text-2xl font-extrabold text-rose-400 mt-1">
                                {overview?.below_kkm_count ?? 0}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                                Dipantau otomatis
                            </p>
                        </Card>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        <Card
                            title="Rekap Ketuntasan per Kelas"
                            subtitle="Rata-rata nilai latihan, nilai ujian resmi tertinggi, dan progres kelas"
                        >
                            <div className="space-y-3">
                                {(overview?.class_summary || []).map((cls) => (
                                    <div
                                        key={cls.class_id}
                                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                                    >
                                        <div>
                                            <h4 className="font-extrabold text-white text-sm">
                                                Kelas {cls.class_name}
                                            </h4>
                                            <p className="text-xs text-slate-400">
                                                {cls.student_count} Siswa · Tuntas KKM: {cls.passed_kkm_count} siswa
                                            </p>
                                        </div>
                                        <div className="text-right text-xs">
                                            <p className="text-cyan-300 font-bold">
                                                Rata-rata Ujian: {cls.avg_exam_score ?? '-'}
                                            </p>
                                            <p className="text-slate-400">
                                                Progres: {cls.avg_progress_percent}%
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card
                            title="Statistik Penyelesaian per BAB"
                            subtitle="Jumlah siswa yang menyelesaikan Learning Zone, Practice Zone, dan Ujian"
                        >
                            <div className="space-y-2.5">
                                {(overview?.chapter_summary || []).map((ch) => (
                                    <div
                                        key={ch.chapter_id}
                                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-bold text-white truncate">
                                                BAB {ch.number}: {ch.title}
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                Belajar: {ch.learning_completed_count} · Lulus Latihan: {ch.practice_passed_count} · Ujian: {ch.exam_completed_count}
                                            </p>
                                        </div>
                                        <Badge variant={ch.status === 'published' ? 'success' : 'warning'}>
                                            {ch.status === 'published' ? 'Terbit' : 'Draf'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* =====================================================
                TAB 2: MANAJEMEN BAB & MATERI (TERMASUK BAB 5 DINAMIS)
               ===================================================== */}
            {activeTab === 'chapters' && (
                <div className="space-y-6">
                    <Card
                        title="Manajemen BAB Pembelajaran (BAB 1 – BAB 6)"
                        subtitle="BAB 5 sengaja disiapkan dalam status Draf agar Guru bebas menentukan judul, deskripsi, lokasi 3D, dan materi tanpa hardcode."
                        actions={
                            <Button
                                size="sm"
                                onClick={() =>
                                    setEditingChapter({
                                        number: chapters.length + 1,
                                        title: '',
                                        description: '',
                                        setting_location: 'Kota Cilegon',
                                        kkm: 75,
                                        status: 'published',
                                    })
                                }
                            >
                                <Plus className="w-4 h-4" />
                                <span>Tambah BAB Baru</span>
                            </Button>
                        }
                    >
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {chapters.map((ch) => (
                                <div
                                    key={ch.id}
                                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                                        activeChapter?.id === ch.id
                                            ? 'bg-cyan-500/10 border-cyan-400'
                                            : 'bg-slate-950/80 border-slate-800'
                                    }`}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-extrabold text-cyan-400">
                                                BAB {ch.number}
                                            </span>
                                            <Badge
                                                variant={
                                                    ch.status === 'published' ? 'success' : 'warning'
                                                }
                                            >
                                                {ch.status === 'published' ? 'Published' : 'Draft (Dinamis)'}
                                            </Badge>
                                        </div>
                                        <h4 className="font-extrabold text-white text-sm">
                                            {ch.title}
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            Latar 3D: <b className="text-slate-200">{ch.setting_location}</b> · KKM: {ch.kkm}
                                        </p>
                                        <p className="text-xs text-slate-400 line-clamp-2">
                                            {ch.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                                        <Button
                                            size="sm"
                                            variant={activeChapter?.id === ch.id ? 'primary' : 'secondary'}
                                            onClick={() => setSelectedChapterId(ch.id)}
                                        >
                                            Kelola Materi ({ch.materials?.length || 0})
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setEditingChapter({ ...ch })}
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                            <span>Edit BAB</span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {activeChapter && (
                        <Card
                            title={`Daftar Materi Pembelajaran — BAB ${activeChapter.number}: ${activeChapter.title}`}
                            subtitle="Materi yang wajib dibaca siswa di Learning Zone sebelum membuka kuis latihan"
                            actions={
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        setMaterialModal({
                                            chapter_id: activeChapter.id,
                                            title: '',
                                            summary: '',
                                            content: '',
                                            is_required: true,
                                            status: 'published',
                                        })
                                    }
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Materi</span>
                                </Button>
                            }
                        >
                            {activeChapter.materials?.length === 0 ? (
                                <p className="text-xs text-slate-400 py-6 text-center">
                                    Belum ada materi pada BAB ini. Klik "Tambah Materi" untuk mengisi materi pembelajaran.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {activeChapter.materials.map((mat) => (
                                        <div
                                            key={mat.id}
                                            className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="info">Urutan #{mat.order}</Badge>
                                                    <h4 className="font-bold text-white text-sm">
                                                        {mat.title}
                                                    </h4>
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    {mat.summary}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => setMaterialModal({ ...mat })}
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                    <span>Edit</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => deleteMaterialMutation.mutate(mat.id)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            )}

            {/* =====================================================
                TAB 3: EDITOR ZONA GAME 3D, NPC, OBJEK & MISI
               ===================================================== */}
            {activeTab === 'game' && (
                <div className="space-y-6">
                    <Card
                        title="Editor Dunia Game 3D, NPC, Objek Interaktif & Misi"
                        subtitle="Konfigurasi berbasis data (Data-Driven 3D Zone). Pilih BAB untuk mengatur lingkungan 3D."
                        actions={
                            activeChapter && (
                                <Link
                                    to={`/student/chapters/${activeChapter.id}/play`}
                                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-extrabold text-xs flex items-center gap-2"
                                >
                                    <Gamepad2 className="w-4 h-4" />
                                    <span>Pratinjau Dunia 3D BAB {activeChapter.number}</span>
                                </Link>
                            )
                        }
                    >
                        <div className="flex flex-wrap gap-2 mb-4">
                            {chapters.map((ch) => (
                                <button
                                    key={ch.id}
                                    type="button"
                                    onClick={() => setSelectedChapterId(ch.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                                        activeChapter?.id === ch.id
                                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                                            : 'bg-slate-950 border-slate-800 text-slate-400'
                                    }`}
                                >
                                    BAB {ch.number}: {ch.setting_location || ch.title}
                                </button>
                            ))}
                        </div>

                        {activeChapter &&
                            (() => {
                                const learningZone =
                                    activeChapter.zones?.find((z) => z.type === 'learning') ||
                                    activeChapter.zones?.[0];
                                if (!learningZone) return null;

                                return (
                                    <div className="space-y-6">
                                        {/* Pengaturan Peta 3D */}
                                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                                            <h4 className="font-bold text-white text-sm">
                                                Preset Lingkungan 3D — {learningZone.name}
                                            </h4>
                                            <div className="grid sm:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-xs text-slate-400 mb-1">
                                                        Pilih Peta Kota/Kabupaten 3D
                                                    </label>
                                                    <select
                                                        value={learningZone.map_key}
                                                        onChange={(e) =>
                                                            updateZoneMutation.mutate({
                                                                zoneId: learningZone.id,
                                                                payload: {
                                                                    name: learningZone.name,
                                                                    description: learningZone.description,
                                                                    map_key: e.target.value,
                                                                    area_key: learningZone.area_key || 'utama',
                                                                },
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                                    >
                                                        {MAP_PRESETS.map((mp) => (
                                                            <option key={mp.value} value={mp.value}>
                                                                {mp.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="sm:col-span-2 flex items-end">
                                                    <p className="text-xs text-slate-400">
                                                        Mengubah preset peta akan langsung memperbarui arsitektur bangunan 3D (Krakatau Steel Cilegon, Banten Lama, Royal Baroe, Gading Serpong, Baduy Lebak, atau SMAN 1 Ciruas).
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Daftar & Tambah NPC 3D */}
                                        <div className="grid lg:grid-cols-2 gap-6">
                                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                                                <h4 className="font-bold text-white text-sm">
                                                    Karakter NPC Pembelajaran ({learningZone.npcs?.length || 0})
                                                </h4>
                                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                                    {(learningZone.npcs || []).map((npc) => (
                                                        <div
                                                            key={npc.id}
                                                            className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                                                        >
                                                            <div>
                                                                <p className="font-bold text-white">
                                                                    {npc.name}{' '}
                                                                    <span className="text-cyan-400">
                                                                        ({npc.role_label})
                                                                    </span>
                                                                </p>
                                                                <p className="text-slate-400 line-clamp-1">
                                                                    "{npc.greeting}"
                                                                </p>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="danger"
                                                                onClick={() =>
                                                                    deleteNpcMutation.mutate(npc.id)
                                                                }
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>

                                                <form
                                                    onSubmit={(e) => {
                                                        e.preventDefault();
                                                        addNpcMutation.mutate({
                                                            zoneId: learningZone.id,
                                                            payload: {
                                                                ...npcForm,
                                                                material_id: npcForm.material_id
                                                                    ? Number(npcForm.material_id)
                                                                    : null,
                                                            },
                                                        });
                                                    }}
                                                    className="space-y-2.5 pt-3 border-t border-slate-800"
                                                >
                                                    <p className="text-xs font-bold text-cyan-300">
                                                        + Tambah NPC Baru ke Dunia 3D
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            required
                                                            placeholder="Nama NPC (mis. Pak Dedi)"
                                                            value={npcForm.name}
                                                            onChange={(e) =>
                                                                setNpcForm({ ...npcForm, name: e.target.value })
                                                            }
                                                            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                                        />
                                                        <input
                                                            required
                                                            placeholder="Peran (mis. HRD / Tokoh)"
                                                            value={npcForm.role_label}
                                                            onChange={(e) =>
                                                                setNpcForm({
                                                                    ...npcForm,
                                                                    role_label: e.target.value,
                                                                })
                                                            }
                                                            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                                        />
                                                    </div>
                                                    <textarea
                                                        required
                                                        rows={2}
                                                        placeholder="Kalimat sapaan / penjelasan materi saat siswa berinteraksi..."
                                                        value={npcForm.greeting}
                                                        onChange={(e) =>
                                                            setNpcForm({ ...npcForm, greeting: e.target.value })
                                                        }
                                                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                                    />
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <input
                                                            type="number"
                                                            placeholder="Posisi X"
                                                            value={npcForm.position_x}
                                                            onChange={(e) =>
                                                                setNpcForm({
                                                                    ...npcForm,
                                                                    position_x: e.target.value,
                                                                })
                                                            }
                                                            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="Posisi Z"
                                                            value={npcForm.position_z}
                                                            onChange={(e) =>
                                                                setNpcForm({
                                                                    ...npcForm,
                                                                    position_z: e.target.value,
                                                                })
                                                            }
                                                            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                                        />
                                                        <select
                                                            value={npcForm.material_id}
                                                            onChange={(e) =>
                                                                setNpcForm({
                                                                    ...npcForm,
                                                                    material_id: e.target.value,
                                                                })
                                                            }
                                                            className="px-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                                        >
                                                            <option value="">Hubungkan Materi</option>
                                                            {(activeChapter.materials || []).map((m) => (
                                                                <option key={m.id} value={m.id}>
                                                                    {m.title}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <Button type="submit" size="sm">
                                                        Simpan NPC 3D
                                                    </Button>
                                                </form>
                                            </div>

                                            {/* Daftar & Tambah Objek Interaktif 3D */}
                                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                                                <h4 className="font-bold text-white text-sm">
                                                    Objek Interaktif 3D ({learningZone.interactables?.length || 0})
                                                </h4>
                                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                                    {(learningZone.interactables || []).map((obj) => (
                                                        <div
                                                            key={obj.id}
                                                            className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                                                        >
                                                            <div>
                                                                <p className="font-bold text-white">
                                                                    {obj.label}
                                                                </p>
                                                                <p className="text-slate-400">
                                                                    Tipe: {obj.type} · Posisi ({obj.position?.[0]}, {obj.position?.[2]})
                                                                </p>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="danger"
                                                                onClick={() =>
                                                                    deleteInteractableMutation.mutate(obj.id)
                                                                }
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>

                                                <form
                                                    onSubmit={(e) => {
                                                        e.preventDefault();
                                                        addInteractableMutation.mutate({
                                                            zoneId: learningZone.id,
                                                            payload: {
                                                                ...objForm,
                                                                material_id: objForm.material_id
                                                                    ? Number(objForm.material_id)
                                                                    : null,
                                                            },
                                                        });
                                                    }}
                                                    className="space-y-2.5 pt-3 border-t border-slate-800"
                                                >
                                                    <p className="text-xs font-bold text-amber-300">
                                                        + Tambah Objek 3D Baru (Buku, Papan, Komputer, Dokumen)
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            required
                                                            placeholder="Label Objek (mis. Papan Struktur CV)"
                                                            value={objForm.label}
                                                            onChange={(e) =>
                                                                setObjForm({ ...objForm, label: e.target.value })
                                                            }
                                                            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                                        />
                                                        <select
                                                            value={objForm.type}
                                                            onChange={(e) =>
                                                                setObjForm({ ...objForm, type: e.target.value })
                                                            }
                                                            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                                        >
                                                            <option value="board">Papan Informasi</option>
                                                            <option value="book">Buku Materi</option>
                                                            <option value="computer">Terminal Komputer</option>
                                                            <option value="document">Dokumen / Arsip</option>
                                                        </select>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <input
                                                            type="number"
                                                            placeholder="Posisi X"
                                                            value={objForm.position_x}
                                                            onChange={(e) =>
                                                                setObjForm({
                                                                    ...objForm,
                                                                    position_x: e.target.value,
                                                                })
                                                            }
                                                            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="Posisi Z"
                                                            value={objForm.position_z}
                                                            onChange={(e) =>
                                                                setObjForm({
                                                                    ...objForm,
                                                                    position_z: e.target.value,
                                                                })
                                                            }
                                                            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                                        />
                                                        <select
                                                            value={objForm.material_id}
                                                            onChange={(e) =>
                                                                setObjForm({
                                                                    ...objForm,
                                                                    material_id: e.target.value,
                                                                })
                                                            }
                                                            className="px-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                                        >
                                                            <option value="">Buka Materi...</option>
                                                            {(activeChapter.materials || []).map((m) => (
                                                                <option key={m.id} value={m.id}>
                                                                    {m.title}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <Button type="submit" size="sm">
                                                        Simpan Objek 3D
                                                    </Button>
                                                </form>
                                            </div>
                                        </div>

                                        {/* Misi Pembelajaran BAB */}
                                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                                            <h4 className="font-bold text-white text-sm">
                                                Misi Eksplorasi BAB ({activeChapter.missions?.length || 0})
                                            </h4>
                                            <div className="space-y-2">
                                                {(activeChapter.missions || []).map((ms) => (
                                                    <div
                                                        key={ms.id}
                                                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                                                    >
                                                        <div>
                                                            <p className="font-bold text-white">
                                                                {ms.title} (+{ms.reward_xp} XP)
                                                            </p>
                                                            <p className="text-slate-400">
                                                                {ms.description}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            onClick={() =>
                                                                deleteMissionMutation.mutate(ms.id)
                                                            }
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    addMissionMutation.mutate({
                                                        chapterId: activeChapter.id,
                                                        payload: {
                                                            title: missionTitle,
                                                            description: missionDesc,
                                                            reward_xp: 100,
                                                        },
                                                    });
                                                }}
                                                className="flex flex-col sm:flex-row gap-2 pt-2"
                                            >
                                                <input
                                                    required
                                                    placeholder="Judul misi baru..."
                                                    value={missionTitle}
                                                    onChange={(e) => setMissionTitle(e.target.value)}
                                                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                                />
                                                <input
                                                    placeholder="Deskripsi misi..."
                                                    value={missionDesc}
                                                    onChange={(e) => setMissionDesc(e.target.value)}
                                                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                                />
                                                <Button type="submit" size="sm">
                                                    + Tambah Misi
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                );
                            })()}
                    </Card>
                </div>
            )}

            {/* =====================================================
                TAB 4: BANK SOAL (A-E) & PRACTICE CONFIG
               ===================================================== */}
            {activeTab === 'questions' && (
                <div className="space-y-6">
                    {activeChapter && (
                        <Card
                            title={`Konfigurasi Latihan Soal (Practice Zone) — BAB ${activeChapter.number}`}
                            subtitle="Maksimal 10 soal diacak dari Bank Soal. Siswa wajib mencapai KKM 75 untuk membuka Zona Ujian."
                        >
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap gap-2">
                                    {chapters.map((ch) => (
                                        <button
                                            key={ch.id}
                                            type="button"
                                            onClick={() => setSelectedChapterId(ch.id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                                                activeChapter.id === ch.id
                                                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                                                    : 'bg-slate-950 border-slate-800 text-slate-400'
                                            }`}
                                        >
                                            BAB {ch.number}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-300">
                                        Jumlah Soal Latihan (Maks 10):
                                    </span>
                                    <select
                                        value={activeChapter.practice_config?.question_count || 10}
                                        onChange={(e) =>
                                            savePracticeConfigMutation.mutate({
                                                chapterId: activeChapter.id,
                                                payload: {
                                                    question_count: Number(e.target.value),
                                                    shuffle_options: true,
                                                    is_active: true,
                                                },
                                            })
                                        }
                                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                    >
                                        {[5, 8, 10].map((n) => (
                                            <option key={n} value={n}>
                                                {n} Soal Pilihan Ganda
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </Card>
                    )}

                    <Card
                        title={`Bank Soal Pilihan Ganda A–E (${questions.length} Soal)`}
                        subtitle="Digunakan untuk Practice Zone dan Examination Zone"
                        actions={
                            <div className="flex items-center gap-2">
                                <select
                                    value={filterChapterQ}
                                    onChange={(e) => setFilterChapterQ(e.target.value)}
                                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                >
                                    <option value="">Semua BAB</option>
                                    {chapters.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            BAB {c.number}: {c.title}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        setQuestionModal({
                                            chapter_id: activeChapter?.id || chapters[0]?.id,
                                            stem: '',
                                            stimulus: '',
                                            difficulty: 'medium',
                                            category: 'Pemahaman Materi',
                                            explanation: '',
                                            correct_label: 'A',
                                            options: { A: '', B: '', C: '', D: '', E: '' },
                                        })
                                    }
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Soal Manual</span>
                                </Button>
                            </div>
                        }
                    >
                        <div className="space-y-3">
                            {questions.map((q) => {
                                const correctOpt = q.options?.find((o) => o.is_correct);
                                return (
                                    <div
                                        key={q.id}
                                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="info">
                                                    BAB {q.chapter?.number || '-'}
                                                </Badge>
                                                <Badge
                                                    variant={
                                                        q.difficulty === 'hard'
                                                            ? 'danger'
                                                            : q.difficulty === 'medium'
                                                            ? 'warning'
                                                            : 'success'
                                                    }
                                                >
                                                    {q.difficulty.toUpperCase()}
                                                </Badge>
                                                <Badge variant="neutral">
                                                    {q.source === 'ai' ? '✨ Gemini AI' : 'Manual'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        const opts = { A: '', B: '', C: '', D: '', E: '' };
                                                        q.options?.forEach((o) => {
                                                            opts[o.label] = o.text;
                                                        });
                                                        setQuestionModal({
                                                            id: q.id,
                                                            chapter_id: q.chapter_id,
                                                            stem: q.stem,
                                                            stimulus: q.stimulus || '',
                                                            difficulty: q.difficulty,
                                                            category: q.category || 'Umum',
                                                            explanation: q.explanation || '',
                                                            correct_label: correctOpt?.label || 'A',
                                                            options: opts,
                                                        });
                                                    }}
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => deleteQuestionMutation.mutate(q.id)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        <p className="text-sm font-semibold text-white">{q.stem}</p>
                                        <div className="grid sm:grid-cols-2 gap-1.5 text-xs">
                                            {(q.options || []).map((o) => (
                                                <div
                                                    key={o.label}
                                                    className={`px-2.5 py-1.5 rounded-lg border ${
                                                        o.is_correct
                                                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                                                            : 'bg-slate-900 border-slate-800 text-slate-400'
                                                    }`}
                                                >
                                                    {o.label}. {o.text}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            )}

            {/* =====================================================
                TAB 5: ZONA UJIAN RESMI & REMEDIAL
               ===================================================== */}
            {activeTab === 'exams' && (
                <div className="space-y-6">
                    <Card
                        title="Manajemen Examination Zone (Ujian Resmi)"
                        subtitle="Atur durasi waktu ujian, jumlah soal, jadwal, serta berikan izin ujian ulang (Remedial) dengan sistem Nilai Tertinggi."
                        actions={
                            <Button
                                size="sm"
                                onClick={() =>
                                    setExamModal({
                                        chapter_id: chapters[0]?.id,
                                        title: '',
                                        question_count: 10,
                                        selection_mode: 'random',
                                        duration_minutes: 45,
                                        max_attempts: 1,
                                        is_active: true,
                                    })
                                }
                            >
                                <Plus className="w-4 h-4" />
                                <span>Buat Jadwal Ujian Baru</span>
                            </Button>
                        }
                    >
                        <div className="space-y-4">
                            {exams.map((ex) => (
                                <div
                                    key={ex.id}
                                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="info">
                                                BAB {ex.chapter?.number}
                                            </Badge>
                                            <Badge variant={ex.is_active ? 'success' : 'neutral'}>
                                                {ex.is_active ? 'Ujian Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </div>
                                        <h4 className="font-extrabold text-white text-sm">
                                            {ex.title}
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            Durasi: <b className="text-white">{ex.duration_minutes} menit</b> · Jumlah Soal: <b className="text-white">{ex.question_count} soal</b> · Kesempatan Awal: {ex.max_attempts}x · Peserta mengerjakan: {ex.attempts_count} sesi
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() =>
                                                setRemedialModal({
                                                    exam: ex,
                                                    user_id: studentData?.students?.[0]?.id || '',
                                                    extra_attempts: 1,
                                                })
                                            }
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            <span>Beri Izin Remedial</span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                saveExamMutation.mutate({
                                                    id: ex.id,
                                                    is_active: !ex.is_active,
                                                })
                                            }
                                        >
                                            {ex.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => deleteExamMutation.mutate(ex.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* =====================================================
                TAB 6: AI QUESTION GENERATOR (GOOGLE GEMINI API)
               ===================================================== */}
            {activeTab === 'ai' && (
                <div className="space-y-6">
                    <Card
                        title="AI Question Generator — Google Gemini API"
                        subtitle="Buat draf soal pilihan ganda A–E beserta kunci dan pembahasan otomatis berdasarkan BAB dan materi. Kunci API tersimpan aman di .env server."
                    >
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                generateAiMutation.mutate({
                                    chapter_id: Number(aiChapterId || chapters[0]?.id),
                                    material_id: aiMaterialId ? Number(aiMaterialId) : null,
                                    count: Number(aiCount),
                                    difficulty: aiDifficulty,
                                });
                            }}
                            className="grid sm:grid-cols-4 gap-3 items-end"
                        >
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">
                                    Pilih BAB Pembelajaran
                                </label>
                                <select
                                    value={aiChapterId || chapters[0]?.id || ''}
                                    onChange={(e) => {
                                        setAiChapterId(e.target.value);
                                        setAiMaterialId('');
                                    }}
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                                >
                                    {chapters.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            BAB {c.number}: {c.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">
                                    Tingkat Kesulitan
                                </label>
                                <select
                                    value={aiDifficulty}
                                    onChange={(e) => setAiDifficulty(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                                >
                                    <option value="easy">Mudah (Easy)</option>
                                    <option value="medium">Sedang (Medium)</option>
                                    <option value="hard">Sulit / HOTS (Hard)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">
                                    Jumlah Soal Dibuat
                                </label>
                                <select
                                    value={aiCount}
                                    onChange={(e) => setAiCount(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                                >
                                    {[2, 3, 5, 10].map((n) => (
                                        <option key={n} value={n}>
                                            {n} Butir Soal (A–E)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Button type="submit" disabled={generateAiMutation.isPending}>
                                <Sparkles className="w-4 h-4" />
                                <span>
                                    {generateAiMutation.isPending
                                        ? 'Menghasilkan Soal...'
                                        : 'Generate Soal dengan AI'}
                                </span>
                            </Button>
                        </form>
                    </Card>

                    <Card
                        title="Daftar Draf Soal Hasil AI (Tinjau & Setujui)"
                        subtitle="Soal tidak langsung masuk ke Bank Soal sebelum disetujui oleh Guru"
                    >
                        {aiGenerations.length === 0 ? (
                            <p className="text-xs text-slate-400 py-6 text-center">
                                Belum ada riwayat pembuatan soal AI. Klik "Generate Soal dengan AI" di atas.
                            </p>
                        ) : (
                            <div className="space-y-6">
                                {aiGenerations.map((gen) => (
                                    <div
                                        key={gen.id}
                                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                                    >
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                            <span className="text-xs font-bold text-cyan-300">
                                                BAB {gen.chapter?.number}: {gen.chapter?.title} · Model: {gen.model}
                                            </span>
                                            <Badge variant="info">{gen.difficulty}</Badge>
                                        </div>

                                        <div className="space-y-3">
                                            {(gen.items || []).map((item) => {
                                                const p = item.payload || {};
                                                return (
                                                    <div
                                                        key={item.id}
                                                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <Badge
                                                                variant={
                                                                    item.status === 'approved'
                                                                        ? 'success'
                                                                        : item.status === 'rejected'
                                                                        ? 'danger'
                                                                        : 'warning'
                                                                }
                                                            >
                                                                {item.status === 'approved'
                                                                    ? 'Disetujui di Bank Soal'
                                                                    : item.status === 'rejected'
                                                                    ? 'Ditolak'
                                                                    : 'Menunggu Review Guru'}
                                                            </Badge>
                                                            {item.status === 'draft' && (
                                                                <div className="flex items-center gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            approveAiItemMutation.mutate(
                                                                                item.id
                                                                            )
                                                                        }
                                                                    >
                                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                                        <span>Setujui ke Bank Soal</span>
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="danger"
                                                                        onClick={() =>
                                                                            rejectAiItemMutation.mutate(
                                                                                item.id
                                                                            )
                                                                        }
                                                                    >
                                                                        <XCircle className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs sm:text-sm font-bold text-white">
                                                            {p.stem}
                                                        </p>
                                                        <div className="grid sm:grid-cols-2 gap-1.5 text-xs">
                                                            {Object.entries(p.options || {}).map(
                                                                ([lbl, txt]) => (
                                                                    <div
                                                                        key={lbl}
                                                                        className={`px-2.5 py-1 rounded-lg border ${
                                                                            lbl === p.correct_label
                                                                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                                                                                : 'bg-slate-950 border-slate-800 text-slate-400'
                                                                        }`}
                                                                    >
                                                                        {lbl}. {txt}
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                        {p.explanation && (
                                                            <p className="text-xs text-slate-400">
                                                                <b className="text-cyan-300">Pembahasan:</b>{' '}
                                                                {p.explanation}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* =====================================================
                TAB 7: MANAJEMEN SISWA, KELAS & LAPORAN 7 BAGIAN + EKSPOR
               ===================================================== */}
            {activeTab === 'students' && (
                <div className="space-y-6">
                    {/* Ekspor & Filter Laporan */}
                    <Card
                        title="Laporan Hasil Pembelajaran & Rekap Nilai (KKM 75)"
                        subtitle="Unduh laporan resmi dalam format Excel (CSV UTF-8) atau cetak laporan resmi PDF SMAN 1 Ciruas"
                        actions={
                            <div className="flex flex-wrap items-center gap-2">
                                <select
                                    value={reportClassFilter}
                                    onChange={(e) => setReportClassFilter(e.target.value)}
                                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                                >
                                    <option value="">Semua Kelas XII</option>
                                    {(studentData?.classes || []).map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            Kelas {cls.name}
                                        </option>
                                    ))}
                                </select>
                                <a
                                    href={`/api/v1/teacher/reports/export/excel${
                                        reportClassFilter ? `?class_id=${reportClassFilter}` : ''
                                    }`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Unduh Excel (CSV)</span>
                                </a>
                                <a
                                    href={`/api/v1/teacher/reports/export/pdf${
                                        reportClassFilter ? `?class_id=${reportClassFilter}` : ''
                                    }`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Cetak / PDF Resmi</span>
                                </a>
                            </div>
                        }
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-400">
                                        <th className="py-2.5 px-3">NISN</th>
                                        <th className="py-2.5 px-3">Nama Siswa</th>
                                        <th className="py-2.5 px-3">Kelas</th>
                                        <th className="py-2.5 px-3">Rata-Rata Latihan</th>
                                        <th className="py-2.5 px-3">Nilai Ujian (Tertinggi)</th>
                                        <th className="py-2.5 px-3">Progres</th>
                                        <th className="py-2.5 px-3">Ketuntasan KKM 75</th>
                                        <th className="py-2.5 px-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/70">
                                    {(reportData?.students || []).map((st) => (
                                        <tr key={st.id} className="hover:bg-slate-900/50">
                                            <td className="py-2.5 px-3 font-mono text-cyan-300">
                                                {st.nisn}
                                            </td>
                                            <td className="py-2.5 px-3 font-bold text-white">
                                                {st.name}
                                            </td>
                                            <td className="py-2.5 px-3">{st.class_name}</td>
                                            <td className="py-2.5 px-3">
                                                {st.avg_practice_score ?? '-'}
                                            </td>
                                            <td className="py-2.5 px-3 font-bold text-white">
                                                {st.avg_exam_score ?? '-'}
                                            </td>
                                            <td className="py-2.5 px-3">{st.progress_percent}%</td>
                                            <td className="py-2.5 px-3">
                                                <Badge variant={st.passed_kkm ? 'success' : 'warning'}>
                                                    {st.passed_kkm ? 'TUNTAS' : 'BELUM TUNTAS'}
                                                </Badge>
                                            </td>
                                            <td className="py-2.5 px-3 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            setStudentModal({
                                                                id: st.id,
                                                                name: st.name,
                                                                nisn: st.nisn,
                                                                school_class_id:
                                                                    studentData?.classes?.find(
                                                                        (c) => c.name === st.class_name
                                                                    )?.id ||
                                                                    studentData?.classes?.[0]?.id,
                                                                reset_password_to_nisn: false,
                                                            })
                                                        }
                                                    >
                                                        <Edit3 className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() =>
                                                            deleteStudentMutation.mutate(st.id)
                                                        }
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

                    {/* Tambah Siswa, Import Massal & Kelola Kelas */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        <Card
                            title="Tambah & Impor Data Siswa"
                            subtitle="Password awal otomatis menggunakan NISN masing-masing siswa"
                            actions={
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        setStudentModal({
                                            name: '',
                                            nisn: '',
                                            school_class_id: studentData?.classes?.[0]?.id || 1,
                                        })
                                    }
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah 1 Siswa</span>
                                </Button>
                            }
                        >
                            <div className="space-y-3">
                                <p className="text-xs text-slate-400">
                                    Format Impor Cepat (satu baris per siswa: <code className="text-cyan-300">NISN, Nama Lengkap, Kelas</code>):
                                </p>
                                <textarea
                                    rows={4}
                                    placeholder={'0081234511, Raka Pratama, XII-1\n0081234512, Dinda Permata, XII-2'}
                                    value={importText}
                                    onChange={(e) => setImportText(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                                />
                                <Button
                                    size="sm"
                                    disabled={!importText.trim() || importStudentsMutation.isPending}
                                    onClick={() => {
                                        const rows = importText
                                            .split('\n')
                                            .map((line) => line.trim())
                                            .filter(Boolean)
                                            .map((line) => {
                                                const parts = line.split(',').map((p) => p.trim());
                                                return {
                                                    nisn: parts[0] || '',
                                                    name: parts[1] || parts[0] || '',
                                                    class_name: parts[2] || 'XII-1',
                                                };
                                            });
                                        importStudentsMutation.mutate(rows);
                                    }}
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Impor Daftar Siswa Sekarang</span>
                                </Button>
                            </div>
                        </Card>

                        <Card title="Daftar Kelas XII yang Diampu" subtitle="Kelola rombongan belajar">
                            <div className="space-y-2.5">
                                {(studentData?.classes || []).map((cls) => (
                                    <div
                                        key={cls.id}
                                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                                    >
                                        <span className="font-bold text-white">
                                            Kelas {cls.name} ({cls.academic_year})
                                        </span>
                                        <Badge variant="info">{cls.students_count} Siswa</Badge>
                                    </div>
                                ))}
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (newClassName.trim()) {
                                            addClassMutation.mutate(newClassName.trim());
                                        }
                                    }}
                                    className="flex gap-2 pt-2"
                                >
                                    <input
                                        placeholder="Nama Kelas Baru (mis. XII-4)"
                                        value={newClassName}
                                        onChange={(e) => setNewClassName(e.target.value)}
                                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                                    />
                                    <Button type="submit" size="sm">
                                        + Tambah Kelas
                                    </Button>
                                </form>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* =====================================================
                MODAL EDIT / TAMBAH BAB (TERMASUK BAB 5)
               ===================================================== */}
            <Modal
                open={!!editingChapter}
                onClose={() => setEditingChapter(null)}
                title={editingChapter?.id ? `Edit BAB ${editingChapter.number}` : 'Tambah BAB Baru'}
            >
                {editingChapter && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            saveChapterMutation.mutate(editingChapter);
                        }}
                        className="space-y-3"
                    >
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Judul Materi BAB</label>
                            <input
                                required
                                value={editingChapter.title}
                                onChange={(e) =>
                                    setEditingChapter({ ...editingChapter, title: e.target.value })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">
                                    Lokasi Latar Game 3D
                                </label>
                                <input
                                    value={editingChapter.setting_location || ''}
                                    onChange={(e) =>
                                        setEditingChapter({
                                            ...editingChapter,
                                            setting_location: e.target.value,
                                        })
                                    }
                                    placeholder="Mis. Kabupaten Pandeglang"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">
                                    Status Publikasi
                                </label>
                                <select
                                    value={editingChapter.status}
                                    onChange={(e) =>
                                        setEditingChapter({
                                            ...editingChapter,
                                            status: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                                >
                                    <option value="published">Published (Tampil di Siswa)</option>
                                    <option value="draft">Draft (Disiapkan Guru)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Deskripsi BAB</label>
                            <textarea
                                rows={3}
                                value={editingChapter.description || ''}
                                onChange={(e) =>
                                    setEditingChapter({
                                        ...editingChapter,
                                        description: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setEditingChapter(null)}
                            >
                                Batal
                            </Button>
                            <Button type="submit">Simpan BAB</Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* MODAL TAMBAH / EDIT MATERI */}
            <Modal
                open={!!materialModal}
                onClose={() => setMaterialModal(null)}
                title={materialModal?.id ? 'Edit Materi Pembelajaran' : 'Tambah Materi Pembelajaran'}
                size="lg"
            >
                {materialModal && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            saveMaterialMutation.mutate(materialModal);
                        }}
                        className="space-y-3"
                    >
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Judul Materi</label>
                            <input
                                required
                                value={materialModal.title}
                                onChange={(e) =>
                                    setMaterialModal({ ...materialModal, title: e.target.value })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">
                                Ringkasan Singkat
                            </label>
                            <input
                                value={materialModal.summary || ''}
                                onChange={(e) =>
                                    setMaterialModal({ ...materialModal, summary: e.target.value })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">
                                Isi Lengkap Materi Pembelajaran
                            </label>
                            <textarea
                                required
                                rows={7}
                                value={materialModal.content}
                                onChange={(e) =>
                                    setMaterialModal({ ...materialModal, content: e.target.value })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setMaterialModal(null)}
                            >
                                Batal
                            </Button>
                            <Button type="submit">Simpan Materi</Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* MODAL TAMBAH / EDIT SOAL PILIHAN GANDA A-E */}
            <Modal
                open={!!questionModal}
                onClose={() => setQuestionModal(null)}
                title={questionModal?.id ? 'Edit Butir Soal (A–E)' : 'Tambah Butir Soal Baru (A–E)'}
                size="lg"
            >
                {questionModal && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            saveQuestionMutation.mutate(questionModal);
                        }}
                        className="space-y-3 max-h-[75vh] overflow-y-auto pr-1"
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">BAB</label>
                                <select
                                    value={questionModal.chapter_id}
                                    onChange={(e) =>
                                        setQuestionModal({
                                            ...questionModal,
                                            chapter_id: Number(e.target.value),
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                                >
                                    {chapters.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            BAB {c.number}: {c.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">
                                    Tingkat Kesulitan
                                </label>
                                <select
                                    value={questionModal.difficulty}
                                    onChange={(e) =>
                                        setQuestionModal({
                                            ...questionModal,
                                            difficulty: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                                >
                                    <option value="easy">Mudah</option>
                                    <option value="medium">Sedang</option>
                                    <option value="hard">Sulit</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-slate-400 mb-1">
                                Pertanyaan Soal (Stem)
                            </label>
                            <textarea
                                required
                                rows={3}
                                value={questionModal.stem}
                                onChange={(e) =>
                                    setQuestionModal({ ...questionModal, stem: e.target.value })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs text-slate-400">
                                Opsi Pilihan Jawaban (A sampai E) & Pilih Kunci Jawaban Benar
                            </label>
                            {['A', 'B', 'C', 'D', 'E'].map((lbl) => (
                                <div key={lbl} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="correct_label"
                                        checked={questionModal.correct_label === lbl}
                                        onChange={() =>
                                            setQuestionModal({
                                                ...questionModal,
                                                correct_label: lbl,
                                            })
                                        }
                                    />
                                    <span className="text-xs font-extrabold text-cyan-400 w-5">
                                        {lbl}.
                                    </span>
                                    <input
                                        required
                                        value={questionModal.options[lbl] || ''}
                                        onChange={(e) =>
                                            setQuestionModal({
                                                ...questionModal,
                                                options: {
                                                    ...questionModal.options,
                                                    [lbl]: e.target.value,
                                                },
                                            })
                                        }
                                        placeholder={`Teks pilihan ${lbl}...`}
                                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                                    />
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-xs text-slate-400 mb-1">
                                Pembahasan Jawaban
                            </label>
                            <textarea
                                rows={2}
                                value={questionModal.explanation}
                                onChange={(e) =>
                                    setQuestionModal({
                                        ...questionModal,
                                        explanation: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setQuestionModal(null)}
                            >
                                Batal
                            </Button>
                            <Button type="submit">Simpan ke Bank Soal</Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* MODAL BUAT UJIAN RESMI */}
            <Modal
                open={!!examModal}
                onClose={() => setExamModal(null)}
                title="Buat Jadwal Ujian Resmi (Examination Zone)"
            >
                {examModal && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            saveExamMutation.mutate(examModal);
                        }}
                        className="space-y-3"
                    >
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Pilih BAB</label>
                            <select
                                value={examModal.chapter_id}
                                onChange={(e) =>
                                    setExamModal({
                                        ...examModal,
                                        chapter_id: Number(e.target.value),
                                    })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                            >
                                {chapters.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        BAB {c.number}: {c.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Judul Ujian</label>
                            <input
                                required
                                value={examModal.title}
                                onChange={(e) =>
                                    setExamModal({ ...examModal, title: e.target.value })
                                }
                                placeholder="Mis. Ujian Resmi BAB 5"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">
                                    Jumlah Soal
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={examModal.question_count}
                                    onChange={(e) =>
                                        setExamModal({
                                            ...examModal,
                                            question_count: Number(e.target.value),
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">
                                    Durasi Waktu (Menit)
                                </label>
                                <input
                                    type="number"
                                    min={5}
                                    max={180}
                                    value={examModal.duration_minutes}
                                    onChange={(e) =>
                                        setExamModal({
                                            ...examModal,
                                            duration_minutes: Number(e.target.value),
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setExamModal(null)}
                            >
                                Batal
                            </Button>
                            <Button type="submit">Simpan Ujian</Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* MODAL IZIN REMEDIAL */}
            <Modal
                open={!!remedialModal}
                onClose={() => setRemedialModal(null)}
                title={`Beri Kesempatan Remedial — ${remedialModal?.exam?.title || ''}`}
            >
                {remedialModal && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            grantRemedialMutation.mutate({
                                examId: remedialModal.exam.id,
                                user_id: Number(remedialModal.user_id),
                                extra_attempts: Number(remedialModal.extra_attempts),
                            });
                        }}
                        className="space-y-3"
                    >
                        <p className="text-xs text-slate-400">
                            Sesuai aturan penilaian BAHASA PLAY, nilai akhir ujian resmi siswa akan mengambil <b className="text-cyan-300">Nilai Tertinggi</b> dari seluruh percobaan yang diizinkan.
                        </p>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Pilih Siswa</label>
                            <select
                                value={remedialModal.user_id}
                                onChange={(e) =>
                                    setRemedialModal({ ...remedialModal, user_id: e.target.value })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                            >
                                {(studentData?.students || []).map((st) => (
                                    <option key={st.id} value={st.id}>
                                        {st.nisn} — {st.name} ({st.class_name})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">
                                Tambahan Kesempatan Ujian (Remedial)
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={5}
                                value={remedialModal.extra_attempts}
                                onChange={(e) =>
                                    setRemedialModal({
                                        ...remedialModal,
                                        extra_attempts: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setRemedialModal(null)}
                            >
                                Batal
                            </Button>
                            <Button type="submit">Berikan Izin Remedial</Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* MODAL TAMBAH / EDIT SISWA */}
            <Modal
                open={!!studentModal}
                onClose={() => setStudentModal(null)}
                title={studentModal?.id ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
            >
                {studentModal && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            saveStudentMutation.mutate(studentModal);
                        }}
                        className="space-y-3"
                    >
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">
                                NISN (Digunakan sebagai Username & Password Awal)
                            </label>
                            <input
                                required
                                value={studentModal.nisn}
                                onChange={(e) =>
                                    setStudentModal({ ...studentModal, nisn: e.target.value })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">
                                Nama Lengkap Siswa
                            </label>
                            <input
                                required
                                value={studentModal.name}
                                onChange={(e) =>
                                    setStudentModal({ ...studentModal, name: e.target.value })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Kelas</label>
                            <select
                                value={studentModal.school_class_id}
                                onChange={(e) =>
                                    setStudentModal({
                                        ...studentModal,
                                        school_class_id: Number(e.target.value),
                                    })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                            >
                                {(studentData?.classes || []).map((c) => (
                                    <option key={c.id} value={c.id}>
                                        Kelas {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {studentModal.id && (
                            <label className="flex items-center gap-2 text-xs text-slate-300 pt-1">
                                <input
                                    type="checkbox"
                                    checked={!!studentModal.reset_password_to_nisn}
                                    onChange={(e) =>
                                        setStudentModal({
                                            ...studentModal,
                                            reset_password_to_nisn: e.target.checked,
                                        })
                                    }
                                />
                                <span>Reset kata sandi siswa kembali ke NISN</span>
                            </label>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setStudentModal(null)}
                            >
                                Batal
                            </Button>
                            <Button type="submit">Simpan Data Siswa</Button>
                        </div>
                    </form>
                )}
            </Modal>
        </AppShell>
    );
}
