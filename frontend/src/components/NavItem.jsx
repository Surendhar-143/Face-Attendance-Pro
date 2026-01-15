import React from 'react';
import clsx from 'clsx';

export function NavItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "flex items-center gap-4 w-full px-6 py-4 rounded-xl transition-all duration-200 text-left",
                active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:text-indigo-300 hover:bg-white/5"
            )}
        >
            <span className="relative z-10">{icon}</span>
            <span className="font-semibold relative z-10">{label}</span>
        </button>
    )
}
