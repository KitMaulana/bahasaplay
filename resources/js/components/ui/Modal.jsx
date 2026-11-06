import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const SIZES = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };

/* Jendela dialog bergaya panel game. Menerima `isOpen` atau `open`, dan `maxWidth` atau `size`. */
export default function Modal({ isOpen, open, onClose, title, children, maxWidth, size }) {
    const visible = Boolean(isOpen ?? open);
    useEffect(() => {
        if (!visible) return undefined;
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [visible, onClose]);
    if (!visible) return null;
    const width = maxWidth || SIZES[size] || SIZES.md;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
            <div
                className={`animate-pop w-full ${width} max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-slate-900 border-4 border-white shadow-[0_8px_0_0_#10213a] overflow-hidden`}
            >
                <div className="relative flex items-center justify-between gap-3 px-5 py-3.5 bg-banten-night border-b-2 border-banten-gold/40">
                    <div className="absolute inset-0 bg-batik-banten opacity-10 pointer-events-none" />
                    <h3 className="relative font-game text-lg text-white tracking-wide">{title}</h3>
                    <button type="button" onClick={onClose} className="relative p-1.5 rounded-xl bg-slate-800 border-2 border-white/10 text-slate-300 hover:text-white cursor-pointer" aria-label="Tutup">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5 overflow-y-auto flex-1">{children}</div>
            </div>
        </div>
    );
}
