import React from 'react';

/*
 * CatAvatar — potret Elbira, kucing oranye blok (HTML/CSS murni, tanpa Three.js).
 * Dipakai di jendela chat Elbira dan tombol HUD.
 */
export default function CatAvatar({ size = 96, talking = false, className = '' }) {
    const u = size / 100;
    const px = (n) => `${n * u}px`;
    return (
        <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }} aria-hidden="true">
            {/* Telinga */}
            {[14, 60].map((left, i) => (
                <div
                    key={left}
                    className="absolute"
                    style={{
                        left: px(left),
                        top: px(4),
                        width: 0,
                        height: 0,
                        borderLeft: `${px(13)} solid transparent`,
                        borderRight: `${px(13)} solid transparent`,
                        borderBottom: `${px(24)} solid #ea580c`,
                        transform: `rotate(${i ? 12 : -12}deg)`,
                    }}
                >
                    <div className="absolute" style={{ left: px(-6), top: px(8), width: 0, height: 0, borderLeft: `${px(6)} solid transparent`, borderRight: `${px(6)} solid transparent`, borderBottom: `${px(12)} solid #fda4af` }} />
                </div>
            ))}
            {/* Kepala */}
            <div className="absolute rounded-[22%] border-black/30 overflow-hidden" style={{ left: px(8), top: px(20), width: px(84), height: px(72), background: '#f59e0b', borderWidth: px(2.5) }}>
                {/* Belang dahi */}
                {[32, 42, 52].map((l) => (
                    <div key={l} className="absolute rounded-b-full" style={{ left: px(l - 8), top: 0, width: px(6), height: px(14), background: '#c2410c' }} />
                ))}
                {/* Moncong krem */}
                <div className="absolute rounded-[40%]" style={{ left: px(20), top: px(36), width: px(44), height: px(30), background: '#fef3c7' }} />
                {/* Mata */}
                {[16, 50].map((l) => (
                    <div key={l} className="absolute rounded-full bg-slate-900" style={{ left: px(l), top: px(22), width: px(14), height: px(talking ? 12 : 16) }}>
                        <div className="absolute rounded-full bg-white" style={{ left: px(3), top: px(3), width: px(5), height: px(5) }} />
                    </div>
                ))}
                {/* Hidung & mulut */}
                <div className="absolute" style={{ left: px(36), top: px(40), width: 0, height: 0, borderLeft: `${px(6)} solid transparent`, borderRight: `${px(6)} solid transparent`, borderTop: `${px(7)} solid #f43f5e` }} />
                <div
                    className={`absolute rounded-b-full border-slate-900 ${talking ? 'animate-pulse' : ''}`}
                    style={{ left: px(34), top: px(48), width: px(16), height: px(talking ? 10 : 6), borderWidth: `0 ${px(2)} ${px(2)} ${px(2)}`, background: talking ? '#be123c' : 'transparent' }}
                />
                {/* Kumis */}
                {[44, 52].map((t) => (
                    <React.Fragment key={t}>
                        <div className="absolute bg-slate-800/70" style={{ left: px(2), top: px(t), width: px(16), height: px(1.5) }} />
                        <div className="absolute bg-slate-800/70" style={{ right: px(2), top: px(t), width: px(16), height: px(1.5) }} />
                    </React.Fragment>
                ))}
                {/* Pipi */}
                <div className="absolute rounded-full bg-rose-400/50" style={{ left: px(6), top: px(38), width: px(10), height: px(6) }} />
                <div className="absolute rounded-full bg-rose-400/50" style={{ right: px(6), top: px(38), width: px(10), height: px(6) }} />
            </div>
            {/* Kalung toska + lonceng emas */}
            <div className="absolute rounded-full" style={{ left: px(24), top: px(88), width: px(52), height: px(7), background: '#0f8b8d' }} />
            <div className="absolute rounded-full border-amber-700" style={{ left: px(44), top: px(90), width: px(12), height: px(12), background: '#f2b43a', borderWidth: px(1.5) }} />
        </div>
    );
}
