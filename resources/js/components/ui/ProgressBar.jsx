import React from 'react';

/* Bilah progres gaya bar XP game: tebal, berbingkai, dengan kilau. */
export default function ProgressBar({ value = 0, label, showPercent = true, color = 'cyan', size = 'md' }) {
    const clamped = Math.max(0, Math.min(100, Number(value) || 0));
    const barColors = {
        cyan: 'from-cyan-300 to-blue-500',
        emerald: 'from-lime-300 to-emerald-500',
        amber: 'from-amber-200 to-orange-500',
        indigo: 'from-indigo-300 to-violet-500',
        gold: 'from-amber-200 via-banten-gold to-banten-copper',
    };
    const h = size === 'sm' ? 'h-2.5' : size === 'lg' ? 'h-5' : 'h-3.5';

    return (
        <div className="w-full space-y-1.5">
            {(label || showPercent) && (
                <div className="flex items-center justify-between text-xs">
                    {label && <span className="text-slate-300 font-bold">{label}</span>}
                    {showPercent && <span className="font-game text-sm text-banten-gold">{clamped.toFixed(0)}%</span>}
                </div>
            )}
            <div className={`w-full ${h} rounded-full bg-slate-950 border-2 border-white/10 overflow-hidden`}>
                <div className={`relative h-full rounded-full bg-gradient-to-r ${barColors[color] || barColors.cyan} transition-all duration-500`} style={{ width: `${clamped}%` }}>
                    <div className="absolute inset-x-1 top-0.5 h-1/3 rounded-full bg-white/35" />
                </div>
            </div>
        </div>
    );
}
