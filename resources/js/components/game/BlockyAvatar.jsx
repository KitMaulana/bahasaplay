import React from 'react';

/*
 * BlockyAvatar — potret karakter blok gaya Roblox berbaju batik Banten (HTML/CSS murni).
 * Dipakai di dialog NPC, pembawa kuis, dan halaman utama tanpa memuat Three.js.
 */

export const BATIK_PRESETS = {
    siswa: { base: '#e2e8f0', pattern: '#b45309', accent: '#0284c7' },
    guru: { base: '#0c4a6e', pattern: '#f59e0b', accent: '#38bdf8' },
    budayawan: { base: '#78350f', pattern: '#fef08a', accent: '#b45309' },
    duta: { base: '#581c87', pattern: '#fde047', accent: '#c084fc' },
};

/** Tebak preset batik & penutup kepala dari peran/nama NPC (sama dengan logika dunia 3D). */
export function npcLook(npc) {
    const role = (npc?.role_label || '').toLowerCase();
    const name = (npc?.name || '').toLowerCase();
    let preset = 'siswa';
    if (role.includes('guru') || role.includes('hrd') || role.includes('konsultan') || role.includes('tata usaha')) preset = 'guru';
    else if (role.includes('adat') || role.includes('budaya') || role.includes('kritikus') || name.includes('raden')) preset = 'budayawan';
    else if (role.includes('duta') || role.includes('penulis') || name.includes('nara') || name.includes('wulan')) preset = 'duta';
    let hair = 'short';
    if (name.includes('ayah') || name.includes('jaro') || name.includes('usep')) hair = 'iket';
    else if (name.includes('ustadz') || name.includes('hafidz') || name.includes('pak bangkit')) hair = 'peci';
    return { preset, hair };
}

function batikBackground(p) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><rect width='20' height='20' fill='${p.base}'/><path d='M10 2 L18 10 L10 18 L2 10 Z' fill='none' stroke='${p.pattern}' stroke-width='1.6'/><circle cx='10' cy='10' r='2.2' fill='${p.accent}'/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export default function BlockyAvatar({ preset = 'siswa', hair = 'short', skin = '#fde68a', size = 96, talking = false, className = '' }) {
    const p = BATIK_PRESETS[preset] || BATIK_PRESETS.siswa;
    const u = size / 100; // satuan relatif
    const px = (n) => `${n * u}px`;
    return (
        <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size * 1.15 }} aria-hidden="true">
            {/* Torso batik */}
            <div
                className="absolute left-1/2 -translate-x-1/2 rounded-md border-black/30"
                style={{ bottom: 0, width: px(78), height: px(42), backgroundImage: batikBackground(p), backgroundSize: px(22), borderWidth: px(2) }}
            >
                <div className="absolute left-1/2 -translate-x-1/2 top-0" style={{ width: 0, height: 0, borderLeft: `${px(10)} solid transparent`, borderRight: `${px(10)} solid transparent`, borderTop: `${px(12)} solid ${p.accent}` }} />
            </div>
            {/* Kepala */}
            <div
                className="absolute left-1/2 -translate-x-1/2 rounded-lg border-black/30"
                style={{ bottom: px(40), width: px(62), height: px(62), background: skin, borderWidth: px(2) }}
            >
                {/* Mata */}
                <div className="absolute rounded-full bg-slate-900" style={{ left: px(14), top: px(24), width: px(9), height: px(11) }}>
                    <div className="absolute rounded-full bg-white" style={{ left: px(2), top: px(2), width: px(3), height: px(3) }} />
                </div>
                <div className="absolute rounded-full bg-slate-900" style={{ right: px(14), top: px(24), width: px(9), height: px(11) }}>
                    <div className="absolute rounded-full bg-white" style={{ left: px(2), top: px(2), width: px(3), height: px(3) }} />
                </div>
                {/* Pipi */}
                <div className="absolute rounded-full bg-rose-300/70" style={{ left: px(7), top: px(38), width: px(9), height: px(5) }} />
                <div className="absolute rounded-full bg-rose-300/70" style={{ right: px(7), top: px(38), width: px(9), height: px(5) }} />
                {/* Mulut */}
                <div
                    className={`absolute left-1/2 -translate-x-1/2 bg-slate-900 ${talking ? 'animate-pulse' : ''}`}
                    style={{ top: px(42), width: px(talking ? 12 : 16), height: px(talking ? 8 : 5), borderRadius: talking ? px(6) : `0 0 ${px(10)} ${px(10)}` }}
                />
                {/* Rambut / peci / iket */}
                {hair === 'peci' && <div className="absolute left-1/2 -translate-x-1/2 bg-slate-900 rounded-t-md" style={{ top: px(-12), width: px(58), height: px(16) }} />}
                {hair === 'iket' && (
                    <>
                        <div className="absolute left-1/2 -translate-x-1/2 rounded-t-md" style={{ top: px(-10), width: px(66), height: px(16), background: '#3f2d1c', borderBottom: `${px(3)} solid #c27a2c` }} />
                        <div className="absolute" style={{ right: px(-8), top: px(-6), width: px(14), height: px(10), background: '#3f2d1c', transform: 'rotate(25deg)' }} />
                    </>
                )}
                {hair === 'short' && (
                    <>
                        <div className="absolute left-1/2 -translate-x-1/2 rounded-t-lg bg-indigo-950" style={{ top: px(-8), width: px(66), height: px(18) }} />
                        <div className="absolute bg-indigo-950" style={{ left: px(-3), top: px(4), width: px(8), height: px(16) }} />
                        <div className="absolute bg-indigo-950" style={{ right: px(-3), top: px(4), width: px(8), height: px(16) }} />
                    </>
                )}
            </div>
        </div>
    );
}
