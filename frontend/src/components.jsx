import { useState } from 'react';

export function Button({ children, onClick, variant = 'primary', className = '' }) {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
    const variants = {
        primary: "bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/30",
        secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600",
        danger: "bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/30",
    };

    return (
        <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
            {children}
        </button>
    );
}

export function Card({ children, className = '' }) {
    return (
        <div className={`glass-card rounded-xl p-6 shadow-xl ${className}`}>
            {children}
        </div>
    );
}
