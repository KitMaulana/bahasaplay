import React from 'react';

export default function Table({ columns = [], data = [], emptyMessage = 'Belum ada data.' }) {
    return (
        <div className="overflow-x-auto rounded-2xl border-2 border-white/10">
            <table className="w-full text-left text-sm">
                <thead className="bg-banten-night text-[11px] uppercase tracking-wider text-amber-200/90 border-b-2 border-banten-gold/30">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key || col.label} className="px-4 py-3 font-extrabold">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-slate-950/40">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length || 1} className="px-4 py-8 text-center text-slate-400 text-xs">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, idx) => (
                            <tr key={row.id || idx} className="hover:bg-white/5 transition">
                                {columns.map((col) => (
                                    <td key={col.key || col.label} className="px-4 py-3 text-slate-200">
                                        {col.render ? col.render(row, idx) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
