import React from 'react';

/*
 * Ilustrasi SVG ringan bertema Banten untuk halaman publik (tanpa Three.js):
 * Menara Banten, Masjid Agung Banten beratap tumpang lima, awan blok, dan pulau rumput gaya Roblox.
 */

export function MenaraBanten({ className = '' }) {
    return (
        <svg viewBox="0 0 80 220" className={className} aria-hidden="true">
            <path d="M8 220 L12 176 H68 L72 220 Z" fill="#f5f5f4" stroke="#10213a" strokeWidth="3" />
            <rect x="32" y="196" width="16" height="24" rx="2" fill="#7c2d12" stroke="#10213a" strokeWidth="2" />
            <path d="M18 176 L26 66 H54 L62 176 Z" fill="#fafaf9" stroke="#10213a" strokeWidth="3" />
            {[150, 120, 92].map((y) => (
                <rect key={y} x={22 + (176 - y) * 0.04} y={y} width={36 - (176 - y) * 0.08} height="5" fill="#e7e5e4" stroke="#10213a" strokeWidth="1.5" />
            ))}
            <rect x="16" y="58" width="48" height="9" rx="2" fill="#e7e5e4" stroke="#10213a" strokeWidth="3" />
            <rect x="28" y="34" width="24" height="24" fill="#fafaf9" stroke="#10213a" strokeWidth="3" />
            <rect x="35" y="40" width="10" height="12" rx="5" fill="#0f8b8d" />
            <path d="M24 34 L40 10 L56 34 Z" fill="#57534e" stroke="#10213a" strokeWidth="3" />
            <circle cx="40" cy="7" r="4" fill="#f2b43a" stroke="#10213a" strokeWidth="2" />
        </svg>
    );
}

export function MasjidAgung({ className = '' }) {
    const tiers = [
        [10, 96, 150, 30],
        [26, 74, 118, 26],
        [40, 54, 90, 24],
        [54, 36, 62, 22],
        [66, 20, 38, 18],
    ];
    return (
        <svg viewBox="0 0 170 190" className={className} aria-hidden="true">
            <rect x="18" y="128" width="134" height="58" fill="#fffbeb" stroke="#10213a" strokeWidth="3" />
            {[34, 60, 86, 112, 138].map((x) => (
                <rect key={x} x={x - 4} y="140" width="8" height="46" fill="#f5f5f4" stroke="#10213a" strokeWidth="1.5" />
            ))}
            <rect x="72" y="146" width="26" height="40" rx="12" fill="#7c2d12" stroke="#10213a" strokeWidth="2" />
            {tiers.map(([x, y, w, h], i) => (
                <g key={i}>
                    <path d={`M${x} ${y + h} L${x + w * 0.18} ${y} H${x + w * 0.82} L${x + w} ${y + h} Z`} fill={i % 2 ? '#b4532a' : '#8a3a1c'} stroke="#10213a" strokeWidth="3" />
                    {i < tiers.length - 1 && <rect x={x + w * 0.3} y={y - 6} width={w * 0.4} height="6" fill="#fef3c7" stroke="#10213a" strokeWidth="1.5" />}
                </g>
            ))}
            <circle cx="85" cy="14" r="6" fill="#f2b43a" stroke="#10213a" strokeWidth="2" />
        </svg>
    );
}

export function BlockCloud({ className = '', style }) {
    return (
        <svg viewBox="0 0 120 50" className={className} style={style} aria-hidden="true">
            <rect x="10" y="20" width="100" height="26" rx="8" fill="#ffffff" />
            <rect x="28" y="6" width="44" height="30" rx="8" fill="#ffffff" />
            <rect x="62" y="12" width="34" height="24" rx="8" fill="#f8fafc" />
        </svg>
    );
}

/** Pulau rumput blok ala Roblox (bertekstur "stud"). */
export function GrassIsland({ className = '', children }) {
    return (
        <div className={`relative ${className}`}>
            {children}
            <div className="relative h-8 rounded-t-xl bg-gradient-to-b from-lime-400 to-green-500 border-4 border-banten-night border-b-0">
                <div
                    className="absolute inset-0 opacity-40 rounded-t-lg"
                    style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.7) 0 3px, transparent 4px)', backgroundSize: '22px 16px' }}
                />
            </div>
            <div className="relative h-14 rounded-b-3xl bg-gradient-to-b from-amber-700 to-amber-900 border-4 border-t-0 border-banten-night overflow-hidden">
                <div className="absolute inset-0 bg-batik-banten opacity-60" />
            </div>
        </div>
    );
}
