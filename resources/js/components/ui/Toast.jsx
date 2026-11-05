import React from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
    if (!message) return null;

    const isError = type === 'error';

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur bg-slate-900/95 border-slate-700 text-slate-100">
            {isError ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <p className="text-xs font-medium flex-1">{message}</p>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
