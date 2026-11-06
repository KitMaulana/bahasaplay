import React from 'react';

const styles = {
    info: 'bg-cyan-400/15 text-cyan-200 border-cyan-400/40',
    success: 'bg-lime-400/15 text-lime-200 border-lime-400/40',
    warning: 'bg-amber-400/15 text-amber-200 border-amber-400/40',
    danger: 'bg-rose-500/15 text-rose-200 border-rose-400/40',
    neutral: 'bg-slate-800 text-slate-300 border-slate-600',
    gold: 'bg-banten-gold text-banten-night border-banten-night/40',
};

export default function Badge({ children, variant = 'info', className = '' }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold tracking-wide border-2 ${styles[variant] || styles.info} ${className}`}>
            {children}
        </span>
    );
}
