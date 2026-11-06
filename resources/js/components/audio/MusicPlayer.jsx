import React, { useEffect, useState } from 'react';
import { Music2, Volume2, VolumeX } from 'lucide-react';
import { initMusic, MUSIC_CREDIT, useMusic } from '../../lib/music';

/* Tombol bisu/nyalakan musik. `compact` = versi kecil untuk HUD game. */
export function MusicToggle({ compact = false, className = '' }) {
    const muted = useMusic((s) => s.muted);
    const toggle = useMusic((s) => s.toggleMute);
    return (
        <button
            type="button"
            onClick={toggle}
            title={`${muted ? 'Nyalakan' : 'Matikan'} musik · Lagu: ${MUSIC_CREDIT}`}
            aria-label={muted ? 'Nyalakan musik latar' : 'Matikan musik latar'}
            aria-pressed={!muted}
            className={`inline-flex items-center justify-center rounded-2xl border cursor-pointer transition ${
                compact
                    ? 'w-9 h-9 bg-slate-900/90 border-slate-700 text-cyan-300 hover:border-cyan-400 backdrop-blur'
                    : 'w-10 h-10 bg-banten-night border-2 border-banten-gold text-amber-100 btn-chunky'
            } ${className}`}
        >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
    );
}

/* Pemutar global: memulai musik sekali dan menampilkan kredit lagu. */
export default function MusicPlayer() {
    const hudEmbedded = useMusic((s) => s.hudEmbedded);
    const muted = useMusic((s) => s.muted);
    const [showCredit, setShowCredit] = useState(true);

    useEffect(() => {
        initMusic();
        const t = setTimeout(() => setShowCredit(false), 7000);
        return () => clearTimeout(t);
    }, []);

    // Di dalam game, tombol tampil di HUD atas (tidak menutupi kontrol)
    if (hudEmbedded) return null;

    return (
        <div className="fixed left-3 bottom-[78px] lg:bottom-3 z-40 flex items-center gap-2 pointer-events-none print:hidden">
            <div className="pointer-events-auto">
                <MusicToggle />
            </div>
            <button
                type="button"
                onClick={() => setShowCredit((v) => !v)}
                className={`pointer-events-auto items-center gap-1.5 max-w-[210px] sm:max-w-none px-2.5 py-1.5 rounded-xl bg-banten-night/90 border-2 border-banten-gold/60 text-amber-100 text-[10px] sm:text-[11px] font-bold leading-tight text-left cursor-pointer backdrop-blur ${
                    showCredit ? 'flex' : 'hidden sm:flex'
                }`}
                aria-label="Keterangan lagu"
            >
                <Music2 className="w-3.5 h-3.5 shrink-0 text-banten-gold" />
                <span>
                    Lagu: {MUSIC_CREDIT}
                    {muted && <span className="text-rose-300"> · dibisukan</span>}
                </span>
            </button>
        </div>
    );
}
