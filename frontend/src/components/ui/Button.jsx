import React from 'react';

export function Button({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) {
    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25",
        secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-white/10",
        danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/25",
        success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            type={type}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}
