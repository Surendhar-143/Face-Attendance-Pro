import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Scan, CheckCircle2, AlertOctagon, Activity, Clock, User } from 'lucide-react';
import { API_URL } from '../config';
import { cn } from '../lib/utils';

export function LiveMonitor() {
    const webcamRef = useRef(null);
    const [status, setStatus] = useState('idle'); // idle, scanning, success, error
    const [scannedUser, setScannedUser] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [videoConstraints, setVideoConstraints] = useState({
        width: 1280,
        height: 720,
        facingMode: "user"
    });

    const capture = useCallback(async () => {
        if (!webcamRef.current) return;
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        setStatus('scanning');

        const blob = await fetch(imageSrc).then(res => res.blob());
        const formData = new FormData();
        formData.append("file", blob, "capture.jpg");

        try {
            const res = await axios.post(`${API_URL}/recognize`, formData);
            if (res.data.status === 'success') {
                const user = res.data.user;
                setStatus('success');
                setScannedUser({
                    name: user,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: res.data.message.includes('Late') ? 'Late' : 'On Time'
                });

                // Reset after 3 seconds
                setTimeout(() => setStatus('idle'), 3000);
            } else if (res.data.status === 'failed') {
                setErrorMessage(res.data.message || "Access Denied");
                setStatus('error');
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('idle');
            }
        } catch (err) {
            setStatus('idle');
        }
    }, [webcamRef]);

    useEffect(() => {
        const interval = setInterval(capture, 2000); // Check every 2 seconds
        return () => clearInterval(interval);
    }, [capture]);

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Kiosk Header */}
            <header className="absolute top-0 left-0 w-full p-8 z-20 flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">
                        Main Entrance <span className="text-cyan-400">Scanner_01</span>
                    </h2>
                    <p className="text-cyan-200/60 font-mono text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                        SYSTEM OPERATIONAL
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-4xl font-light tracking-tighter text-white">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-cyan-500 font-bold tracking-widest text-xs uppercase mt-1">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </header>

            {/* Main Camera HUD */}
            <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden bg-black/80 backdrop-blur-sm shadow-[0_0_80px_rgba(6,182,212,0.2)] border border-white/10 ring-1 ring-white/5">
                {/* Webcam Feed */}
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="w-full h-full object-cover opacity-90"
                />

                {/* Overlays */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {/* Corner Brackets (HUD) */}
                    <div className="absolute top-8 left-8 w-16 h-16 border-l-4 border-t-4 border-cyan-500/50 rounded-tl-lg" />
                    <div className="absolute top-8 right-8 w-16 h-16 border-r-4 border-t-4 border-cyan-500/50 rounded-tr-lg" />
                    <div className="absolute bottom-8 left-8 w-16 h-16 border-l-4 border-b-4 border-cyan-500/50 rounded-bl-lg" />
                    <div className="absolute bottom-8 right-8 w-16 h-16 border-r-4 border-b-4 border-cyan-500/50 rounded-br-lg" />

                    {/* Scanning Animation */}
                    <motion.div
                        initial={{ top: "0%", opacity: 0 }}
                        animate={{ top: "100%", opacity: [0, 1, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)]"
                    />

                    {/* Status Indicator Center */}
                    <AnimatePresence>
                        {status === 'success' && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                            >
                                <div className="text-center">
                                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                                        <CheckCircle2 className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white tracking-tight">Access Granted</h3>
                                </div>
                            </motion.div>
                        )}
                        {status === 'error' && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                            >
                                <div className="text-center">
                                    <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                                        <AlertOctagon className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white tracking-tight">Access Denied</h3>
                                    <p className="text-red-200 mt-2 text-lg font-medium">{errorMessage}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Success Card (Slides up) */}
            <AnimatePresence>
                {status === 'success' && scannedUser && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-12 w-full max-w-lg"
                    >
                        <div className="glass-panel p-6 rounded-2xl border-l-4 border-emerald-500 flex items-center gap-6">
                            <div className="h-16 w-16 rounded-full bg-slate-800 border-2 border-emerald-500/50 overflow-hidden flex items-center justify-center text-2xl font-bold text-white">
                                {scannedUser.name[0]}
                            </div>
                            <div>
                                <p className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-1">Authenticated</p>
                                <h2 className="text-3xl font-bold text-white leading-none mb-1">{scannedUser.name}</h2>
                                <div className="flex items-center gap-4 text-slate-400 text-sm">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {scannedUser.time}</span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-xs font-bold uppercase",
                                        scannedUser.status === 'Late' ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                                    )}>
                                        {scannedUser.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Idle State / Instructions */}
            {
                status === 'idle' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute bottom-12 text-slate-500 text-center font-mono text-sm uppercase tracking-widest"
                    >
                        Look at the camera sensor to verify identity
                    </motion.div>
                )
            }
        </div >
    );
}
