"use client";

import { useState } from "react";
import { loginUser } from "@/lib/actions";
import {
    Lock,
    Mail,
    ArrowRight,
    ShieldCheck,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await loginUser(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="h-screen bg-[#fcfcfd] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Developer Credit */}
            <div className="absolute top-6 right-8 z-50 animate-in fade-in slide-in-from-right-4 duration-1000">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="opacity-50">Desarrollado Por:</span>
                    <span className="text-[#e31b23] font-black group-hover:scale-110 transition-transform cursor-default">freakeao</span>
                </p>
            </div>

            {/* Ambient Background Lights - Softer and brand-aligned */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#e31b23]/5 rounded-full blur-[140px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#e31b23]/3 rounded-full blur-[140px] animate-pulse delay-700" />

            {/* Mesh Gradient Effect */}
            <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{
                backgroundImage: `radial-gradient(at 0% 0%, hsla(0,100%,95%,1) 0, transparent 50%),
                                 radial-gradient(at 100% 100%, hsla(0,100%,98%,1) 0, transparent 50%)`
            }} />

            <div className="w-full max-w-[400px] relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-1000">
                {/* Logo & Header */}
                <div className="text-center space-y-4">
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="relative w-20 h-20 drop-shadow-2xl animate-in slide-in-from-bottom-4 duration-1000">
                            <Image
                                src="/logoFYA.png"
                                alt="Logo Fe y Alegría"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-3xl font-black tracking-tight text-[#1a1a1a]">
                                Asistencia
                            </h1>
                            <p className="text-[#e31b23] font-bold text-[9px] uppercase tracking-[0.4em]">
                                Fe y Alegría • Diario Digital
                            </p>
                        </div>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white/70 border border-white/40 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#e31b23]" />

                    <form action={handleSubmit} className="space-y-5">
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-[#666] uppercase tracking-widest pl-1">
                                    Nombre de Usuario
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#e31b23] transition-colors" />
                                    <input
                                        name="usuario"
                                        type="text"
                                        required
                                        placeholder="usuario"
                                        className="w-full h-12 bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 text-sm text-[#1a1a1a] placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-[#e31b23]/10 focus:border-[#e31b23]/30 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-[#666] uppercase tracking-widest pl-1">
                                    Contraseña
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#e31b23] transition-colors" />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full h-12 bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 text-sm text-[#1a1a1a] placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-[#e31b23]/10 focus:border-[#e31b23]/30 transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-[#e31b23] text-[10px] font-bold p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                                <ShieldCheck className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            disabled={loading}
                            className="w-full h-12 bg-[#1a1a1a] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#e31b23] hover:shadow-2xl hover:shadow-[#e31b23]/20 transition-all active:scale-[0.98] disabled:opacity-50 group shadow-lg"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Ingresar al Sistema
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-50 text-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-loose">
                            Acceso seguro restringido a<br /> personal autorizado
                        </p>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-6 opacity-20">
                        <div className="h-px w-12 bg-[#1a1a1a]" />
                        <p className="text-[10px] font-black text-[#1a1a1a] uppercase tracking-widest">v1.2 Premium</p>
                        <div className="h-px w-12 bg-[#1a1a1a]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
