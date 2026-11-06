import React from 'react';

/* Tombol bergaya game ("chunky"): gradien cerah, bayangan bawah tebal yang tertekan saat diklik. */
const variants = {
    primary: 'bg-gradient-to-b from-cyan-300 to-blue-600 text-white border-blue-900/60',
    secondary: 'bg-slate-800 text-slate-100 border-slate-950/60 hover:text-cyan-200',
    success: 'bg-gradient-to-b from-lime-300 to-emerald-600 text-white border-emerald-900/60',
    warning: 'bg-gradient-to-b from-amber-200 to-banten-copper text-banten-night border-amber-900/60',
    danger: 'bg-gradient-to-b from-rose-400 to-rose-600 text-white border-rose-900/60',
    ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5 border-transparent',
};

const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-xl min-h-[36px]',
    md: 'px-4 py-2.5 text-sm rounded-2xl min-h-[44px]',
    lg: 'px-6 py-3.5 text-lg rounded-2xl min-h-[52px]',
};

export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled = false, type = 'button', ...props }) {
    const chunky = variant === 'ghost' ? '' : 'btn-chunky';
    return (
        <button
            type={type}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 border-2 font-extrabold tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${chunky} ${
                variants[variant] || variants.primary
            } ${sizes[size] || sizes.md} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
