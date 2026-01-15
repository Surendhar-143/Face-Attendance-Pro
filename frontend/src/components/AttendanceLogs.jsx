import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from './ui/Card';
import { API_URL, API_KEY } from '../config';

import { Trash2 } from 'lucide-react';
import { cn } from '../lib/utils'; // Assuming you have this utility

export function AttendanceLogs() {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = () => {
        axios.get(`${API_URL}/attendance`, {
            headers: { 'X-API-Key': API_KEY }
        }).then(res => setLogs(res.data)).catch(console.error);
    };

    const deleteLog = (id) => {
        if (!confirm("Are you sure you want to delete this log? This breaks the audit chain.")) return;

        axios.delete(`${API_URL}/attendance/${id}`, {
            headers: { 'X-API-Key': API_KEY }
        }).then(() => {
            // Optimistic update
            setLogs(logs.filter(l => l.id !== id));
        }).catch(err => alert("Failed to delete log"));
    };

    return (
        <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                <h3 className="font-bold text-white">System Logs</h3>
            </div>
            <table className="w-full text-left">
                <thead className="bg-slate-950/30 text-xs uppercase text-slate-500 font-bold tracking-wider">
                    <tr>
                        <th className="p-6">Identity</th>
                        <th className="p-6">Timestamp</th>
                        <th className="p-6">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    {logs.map(log => (
                        <tr key={log.id} className="hover:bg-indigo-500/5">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                                        {log.proof_image ? (
                                            <img src={`data:image/jpeg;base64,${log.proof_image}`} alt="Proof" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-xs text-slate-500">N/A</div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">{log.user_name}</div>
                                        <div className="text-xs text-slate-500">ID: {log.user_id}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-6 text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</td>
                            <td className="p-6">
                                <span className={cn(
                                    "px-2 py-1 rounded text-xs font-bold",
                                    log.status === 'Late' ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                                )}>{log.status}</span>
                            </td>
                            <td className="p-6 text-right">
                                <button
                                    onClick={() => deleteLog(log.id)}
                                    className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded transition-colors"
                                    title="Delete Log"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    )
}
