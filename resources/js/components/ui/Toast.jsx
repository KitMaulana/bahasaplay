import React, { useEffect, useRef } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

/* Notifikasi pojok ala game; menutup sendiri setelah 4,5 detik. */
export default function Toast({ message, type = 'success', onClose }) {
    const closeRef = useRef(onClose);
    closeRef.current = onClose;
    useEffect(() => {
        if (!message) return undefined;
        const t = setTimeout(() => closeRef.current?.(), 4500);
        return () => clearTimeout(t);
    }, [message]);
    if (!message) return null;

    const isError = type === 'error';

    return (
        <div
            className={`animate-bubble-in fixed top-4 right-4 left-4 sm:left-auto z-[70] sm:max-w-sm flex items-center gap-3 px-4 py-3 rounded-2xl border-2 shadow-[0_6px_0_0_rgba(2,6,23,0.6)] bg-slate-900 text-slate-100 ${
                isError ? 'border-rose-400/70' : 'border-lime-400/70'
            }`}
        >
            {isError ? <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" /> : <CheckCircle2 className="w-6 h-6 text-lime-400 shrink-0" />}
            <p className="text-xs font-bold flex-1">{message}</p>
            {onClose && (
                <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer" aria-label="Tutup notifikasi">
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
