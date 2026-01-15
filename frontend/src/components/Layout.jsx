import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Shield, Lock, ScanLine, Maximize2, Minimize2 } from 'lucide-react';

export function Layout({ children, sidebarOpen, setSidebarOpen, activeTab, setActiveTab }) {
    return (
        <div className="min-h-screen bg-slate-900 text-white selection:bg-cyan-500/30 overflow-hidden relative">
            {/* Lighter, Richer Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(6,182,212,0.15),_rgba(15,23,42,1))]" />

            {/* Massive Ambient Glows for 'Daylight' feel in dark mode */}
            <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-cyan-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute -bottom-[10%] left-[20%] w-[900px] h-[600px] bg-indigo-500/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />

            <div className="flex h-screen relative z-10">
                {/* Enterpise Sidebar */}
                <motion.aside
                    initial={{ x: -300 }}
                    animate={{ x: sidebarOpen ? 0 : -300 }}
                    className="fixed left-0 top-0 h-full w-72 glass-panel z-50 flex flex-col border-r border-white/5"
                >
                    <div className="p-8 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg tracking-tight">FaceAttend<span className="text-cyan-400">Pro</span></h1>
                                <p className="text-xs text-slate-400">Enterprise Security v2.0</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        {[
                            { id: 'live', label: 'Kiosk Monitor', icon: ScanLine },
                            { id: 'dashboard', label: 'Dashboard', icon: Shield },
                            { id: 'users', label: 'User Directory', icon: Lock },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium group",
                                    activeTab === item.id
                                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5"
                                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5 transition-colors", activeTab === item.id ? "text-cyan-400" : "text-slate-500 group-hover:text-white")} />
                                {item.label}
                                {activeTab === item.id && (
                                    <motion.div layoutId="sidebar-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_currentColor]" />
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-white/5">
                        <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-slate-500 text-center">
                            System Status: <span className="text-emerald-500">Online</span>
                        </div>
                    </div>
                </motion.aside>

                {/* Main Content Area */}
                <main className={cn(
                    "flex-1 relative transition-all duration-500 ease-in-out",
                    sidebarOpen ? "pl-72" : "pl-0"
                )}>
                    {children}

                    {/* Toggle Sidebar (Hidden trigger area for Kiosk mode) */}
                    {!sidebarOpen && (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="fixed bottom-4 left-4 p-3 bg-slate-900/50 backdrop-blur-md text-slate-500 rounded-full hover:bg-cyan-500/20 hover:text-cyan-400 transition-all z-40 opacity-20 hover:opacity-100"
                        >
                            <Shield className="h-5 w-5" />
                        </button>
                    )}
                </main>
            </div>
        </div>
    );
}
