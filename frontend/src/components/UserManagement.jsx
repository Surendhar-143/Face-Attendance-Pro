import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Upload } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { API_URL, API_KEY } from '../config';

export function UserManagement() {
    const [name, setName] = useState("");
    const [images, setImages] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!name || !images) return toast.error("Complete all fields");
        setIsLoading(true);
        const formData = new FormData();
        formData.append("name", name);
        for (let i = 0; i < images.length; i++) formData.append("files", images[i]);

        try {
            await axios.post(`${API_URL}/users`, formData, {
                headers: { 'X-API-Key': API_KEY }
            });
            toast.success(`Registered ${name}`);
            setName(""); setImages(null); fileInputRef.current.value = "";
        } catch { toast.error("Error"); }
        setIsLoading(false);
    }

    return (
        <div className="max-w-4xl mx-auto pt-10">
            <Card>
                <h2 className="text-3xl font-bold mb-8 text-white">Registration</h2>
                <form onSubmit={handleRegister} className="space-y-8">
                    <Input label="Full Identity Name" placeholder="e.g. Sarah Connor" value={name} onChange={e => setName(e.target.value)} />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 ml-1">Biometric Data</label>
                        <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-slate-700 rounded-xl p-10 hover:border-indigo-500 hover:bg-slate-800/50 transition-all cursor-pointer text-center group bg-slate-900/30">
                            <Upload className="mx-auto text-slate-500 mb-4" size={32} />
                            <p className="font-medium text-slate-300">Click to upload face samples</p>
                            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={e => setImages(e.target.files)} />
                        </div>
                        {images && <div className="text-center text-sm text-indigo-400 font-medium py-2">{images.length} samples loaded</div>}
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full py-4 text-lg">
                        {isLoading ? "Processing..." : "Register User"}
                    </Button>
                </form>
            </Card>
        </div>
    )
}
