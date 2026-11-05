import React from 'react';

export default function Table({ columns = [], data = [], emptyMessage = 'Belum ada data.' }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/90 text-xs uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key || col.label} className="px-4 py-3 font-semibold">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length || 1}
                                className="px-4 py-8 text-center text-slate-400 text-xs"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, idx) => (
                            <tr key={row.id || idx} className="hover:bg-slate-900/50 transition">
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
