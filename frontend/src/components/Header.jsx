import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function Header() {
    return (
        <header className="flex justify-between items-center py-6 mb-8">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
                        <ShieldCheck className="text-white" size={28} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0B1120]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">FaceAttend<span className="text-indigo-400">Pro</span></h1>
                    <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">Enterprise Security System</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-emerald-400">System Operational</span>
                </div>
            </div>
        </header>
    )
}
