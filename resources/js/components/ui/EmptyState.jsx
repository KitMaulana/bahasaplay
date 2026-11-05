import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Belum ada data', description, action }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-cyan-400 mb-3">
                <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">{title}</h4>
            {description && <p className="text-xs text-slate-400 mt-1 max-w-md">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
