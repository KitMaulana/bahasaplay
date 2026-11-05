import React from 'react';

const variants = {
    primary:
        'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 hover:brightness-110',
    secondary:
        'bg-slate-800 border border-slate-700 text-slate-100 font-semibold hover:border-cyan-400/60 hover:text-cyan-300',
    success:
        'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 hover:brightness-110',
    danger: 'bg-rose-500/15 border border-rose-500/40 text-rose-300 font-semibold hover:bg-rose-500/25',
    ghost: 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium',
};

const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-xl min-h-[36px]',
    md: 'px-4 py-2.5 text-sm rounded-xl min-h-[44px]',
    lg: 'px-6 py-3.5 text-base rounded-2xl min-h-[48px]',
};

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    type = 'button',
    ...props
}) {
    return (
        <button
            type={type}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                variants[variant] || variants.primary
            } ${sizes[size] || sizes.md} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
