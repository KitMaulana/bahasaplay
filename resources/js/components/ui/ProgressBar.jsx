import React from 'react';

export default function ProgressBar({ value = 0, label, showPercent = true, color = 'cyan' }) {
    const clamped = Math.max(0, Math.min(100, Number(value) || 0));
    const barColors = {
        cyan: 'from-cyan-400 to-blue-500',
        emerald: 'from-emerald-400 to-teal-500',
        amber: 'from-amber-400 to-orange-500',
        indigo: 'from-indigo-400 to-purple-500',
    };

    return (
        <div className="w-full space-y-1.5">
            {(label || showPercent) && (
                <div className="flex items-center justify-between text-xs">
                    {label && <span className="text-slate-300 font-medium">{label}</span>}
                    {showPercent && <span className="text-cyan-300 font-bold">{clamped.toFixed(0)}%</span>}
                </div>
            )}
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                    className={`h-full rounded-full bg-gradient-to-r ${
                        barColors[color] || barColors.cyan
                    } transition-all duration-300`}
                    style={{ width: `${clamped}%` }}
                />
            </div>
        </div>
    );
}
