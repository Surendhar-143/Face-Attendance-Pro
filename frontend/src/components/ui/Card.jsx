import React from 'react';

export function Card({ children, className = '' }) {
    return (
        <div className={`bg-slate-800/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl ${className}`}>
            {children}
        </div>
    )
}
