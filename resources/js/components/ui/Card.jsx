import React from 'react';

/*
 * Kartu panel bergaya menu game: sudut membulat besar, bingkai tebal, bayangan bawah "chunky".
 * Menerima `action` maupun `actions` (keduanya dipakai di halaman yang berbeda).
 */
export default function Card({ children, className = '', title, subtitle, action, actions, icon: Icon }) {
    const headerAction = action ?? actions;
    return (
        <div className={`relative rounded-3xl bg-banten-night border-4 border-white p-4 sm:p-5 shadow-[0_7px_0_0_#10213a] ${className}`}>
            {(title || headerAction) && (
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-2.5 min-w-0">
                        {Icon && (
                            <span className="w-9 h-9 shrink-0 rounded-xl bg-banten-gold text-banten-night flex items-center justify-center -rotate-3 shadow-[0_3px_0_0_rgba(0,0,0,0.35)]">
                                <Icon className="w-5 h-5" />
                            </span>
                        )}
                        <div className="min-w-0">
                            {title && <h3 className="font-game text-lg sm:text-xl text-white tracking-wide leading-tight">{title}</h3>}
                            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
                        </div>
                    </div>
                    {headerAction && <div className="flex flex-wrap items-center gap-2">{headerAction}</div>}
                </div>
            )}
            {children}
        </div>
    );
}
