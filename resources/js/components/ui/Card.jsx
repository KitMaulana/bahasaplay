import React from 'react';

export default function Card({ children, className = '', title, subtitle, action }) {
    return (
        <div
            className={`rounded-2xl bg-slate-900/90 border border-slate-800/90 p-5 shadow-xl backdrop-blur ${className}`}
        >
            {(title || action) && (
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        {title && <h3 className="text-base font-bold text-white">{title}</h3>}
                        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </div>
    );
}
