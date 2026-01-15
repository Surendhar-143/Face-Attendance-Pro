import React from 'react';

export function Input({ label, ...props }) {
    return (
        <div className="space-y-1.5 ">
            <label className="text-sm font-medium text-slate-400 ml-1">{label}</label>
            <div className="relative">
                <input
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    {...props}
                />
            </div>
        </div>
    )
}
