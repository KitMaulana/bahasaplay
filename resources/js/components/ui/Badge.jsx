import React from 'react';

const styles = {
    info: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
};

export default function Badge({ children, variant = 'info', className = '' }) {
    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                styles[variant] || styles.info
            } ${className}`}
        >
            {children}
        </span>
    );
}
