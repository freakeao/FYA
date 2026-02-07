"use client";

import { useState } from "react";
import { changeOwnPassword } from "@/lib/actions";
import { toast } from "sonner";
import { Lock, ShieldCheck, Check, X, Loader2, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface CambiarPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CambiarPasswordModal({
    isOpen,
    onClose
}: CambiarPasswordModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Las nuevas contraseñas no coinciden");
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error("La nueva contraseña debe tener al menos 6 caracteres");
            return;
        }

        setLoading(true);

        const data = new FormData();
        data.append("currentPassword", formData.currentPassword);
        data.append("newPassword", formData.newPassword);

        const res = await changeOwnPassword(data);

        if (res.success) {
            toast.success(res.message);
            onClose();
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-background/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-card border border-border/40 rounded-[2.5rem] shadow-2xl shadow-primary/10 overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header with Gradient */}
                <div className="relative p-8 pb-6 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

                    <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <KeyRound className="w-6 h-6" />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-accent rounded-full transition-colors group"
                        >
                            <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>

                    <h2 className="text-2xl font-black uppercase tracking-tighter bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Nueva Contraseña
                    </h2>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                        Actualice sus credenciales de acceso de forma segura
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-6">
                    <div className="space-y-4">
                        {/* Contraseña Actual */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Contraseña Actual
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <Lock className="w-full h-full" />
                                </div>
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:bg-accent/50 focus:border-primary/20 transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent my-2" />

                        {/* Nueva Contraseña */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Nueva Contraseña
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <ShieldCheck className="w-full h-full" />
                                </div>
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:bg-accent/50 focus:border-primary/20 transition-all font-bold"
                                />
                            </div>
                        </div>

                        {/* Confirmar Nueva Contraseña */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Confirmar Contraseña
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <Check className="w-full h-full" />
                                </div>
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:bg-accent/50 focus:border-primary/20 transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Actualizar Credenciales
                                    <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
