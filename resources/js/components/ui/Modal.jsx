import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div
                className={`w-full ${maxWidth} max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                    <h3 className="text-base font-bold text-white">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        aria-label="Tutup modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5 overflow-y-auto flex-1">{children}</div>
            </div>
        </div>
    );
}
