/*
 * Utilitas data siswa untuk guru: mengurai tabel tempelan Excel / berkas CSV,
 * memvalidasi baris sebelum impor, dan membuat templat CSV.
 */

const NISN_RE = /^[0-9A-Za-z.\-]+$/;

function splitLine(line, delim) {
    if (delim !== ',') return line.split(delim);
    // CSV sederhana dengan dukungan tanda kutip
    const out = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        if (ch === '"') {
            if (quoted && line[i + 1] === '"') {
                cur += '"';
                i += 1;
            } else quoted = !quoted;
        } else if (ch === ',' && !quoted) {
            out.push(cur);
            cur = '';
        } else cur += ch;
    }
    out.push(cur);
    return out;
}

/** Urai teks tabel (tab dari Excel, titik koma, atau koma). Kolom: NISN, Nama, Kelas (urutan bebas bila ada judul). */
export function parseStudentTable(text) {
    const lines = String(text || '')
        .replace(/^﻿/, '')
        .split(/\r?\n/)
        .map((l) => l.replace(/\s+$/, '')) // jangan buang tab di awal: sel pertama boleh kosong
        .filter((l) => l.trim());
    if (!lines.length) return [];
    const sample = lines.slice(0, 5).join('\n');
    const delim = sample.includes('\t') ? '\t' : (sample.match(/;/g) || []).length > (sample.match(/,/g) || []).length ? ';' : ',';
    let rows = lines.map((l) => splitLine(l, delim).map((c) => c.trim().replace(/^"|"$/g, '')));

    let map = null;
    const head = rows[0].map((c) => c.toLowerCase());
    if (head.some((c) => c.includes('nisn') || c.includes('nama') || c === 'name')) {
        map = {
            nisn: head.findIndex((c) => c.includes('nisn') || c.includes('username')),
            name: head.findIndex((c) => c.includes('nama') || c === 'name'),
            class_name: head.findIndex((c) => c.includes('kelas') || c.includes('class') || c.includes('rombel')),
        };
        rows = rows.slice(1);
    }
    return rows
        .filter((r) => r.some(Boolean))
        .map((r) => {
            if (map) {
                return { nisn: r[map.nisn] ?? '', name: r[map.name] ?? '', class_name: map.class_name >= 0 ? r[map.class_name] ?? '' : '' };
            }
            // Tanpa judul: tebak urutan dari kolom yang berupa angka
            const firstNumeric = /^\d+$/.test(r[0] || '');
            const secondNumeric = /^\d+$/.test(r[1] || '');
            if (!firstNumeric && secondNumeric) return { name: r[0] || '', nisn: r[1] || '', class_name: r[2] || '' };
            return { nisn: r[0] || '', name: r[1] || '', class_name: r[2] || '' };
        });
}

/** Tandai setiap baris: error (tidak akan diimpor) dan info (akan diperbarui / kelas baru). */
export function validateRows(rows, { existingNisn = new Set(), classNames = new Set() } = {}) {
    const seen = new Map();
    return rows.map((row, i) => {
        const nisn = String(row.nisn || '').trim();
        const name = String(row.name || '').trim();
        const errors = [];
        const notes = [];
        if (!nisn) errors.push('NISN kosong');
        else if (!NISN_RE.test(nisn)) errors.push('NISN berisi spasi/simbol');
        if (!name) errors.push('Nama kosong');
        if (nisn && seen.has(nisn)) errors.push(`NISN sama dengan baris ${seen.get(nisn) + 1}`);
        if (nisn && !seen.has(nisn)) seen.set(nisn, i);
        if (nisn && existingNisn.has(nisn)) notes.push('Sudah terdaftar → data diperbarui (sandi tidak direset)');
        const cls = String(row.class_name || '').trim();
        if (cls && !classNames.has(cls)) notes.push(`Kelas "${cls}" akan dibuat`);
        return { ...row, nisn, name, class_name: cls, errors, notes, ok: errors.length === 0 };
    });
}

export function downloadCsv(filename, rows) {
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadTemplate() {
    downloadCsv('Templat_Impor_Siswa_BAHASA_PLAY.csv', [
        ['NISN', 'Nama Lengkap', 'Kelas'],
        ['0081234599', 'Contoh Nama Siswa', 'XII-1'],
        ['0081234600', 'Contoh Nama Kedua', 'XII-2'],
    ]);
}

export function timeAgo(iso) {
    if (!iso) return 'Belum pernah';
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} hari lalu`;
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'Asia/Jakarta' }).format(new Date(iso));
}
