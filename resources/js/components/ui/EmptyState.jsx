import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Belum ada data', description, action }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-3xl border-2 border-dashed border-white/15 bg-slate-900/40">
            <div className="w-14 h-14 rounded-2xl bg-banten-gold text-banten-night flex items-center justify-center mb-3 -rotate-6 shadow-[0_4px_0_0_rgba(0,0,0,0.35)]">
                <Inbox className="w-7 h-7" />
            </div>
            <h4 className="font-game text-lg text-white">{title}</h4>
            {description && <p className="text-xs text-slate-400 mt-1 max-w-md">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
