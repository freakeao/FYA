"use client";

import { useState, useEffect } from "react";
import { X, Check, Loader2, User, Lock, KeyRound, Shield, FileText } from "lucide-react";
import { createUsuario, updateUsuario } from "@/lib/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PersonalModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingPersonal?: any;
}

export function PersonalModal({ isOpen, onClose, editingPersonal }: PersonalModalProps) {
    const [loading, setLoading] = useState(false);
    const [grantAccess, setGrantAccess] = useState(false);

    // Form States
    const [nombre, setNombre] = useState("");
    const [cedula, setCedula] = useState("");
    const [rol, setRol] = useState("DOCENTE");
    const [departamento, setDepartamento] = useState("MEDIA_GENERAL");

    // Access States
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (editingPersonal) {
            setNombre(editingPersonal.nombre);
            setCedula(editingPersonal.cedula || "");
            setRol(editingPersonal.rol);
            setDepartamento(editingPersonal.departamento || "MEDIA_GENERAL");

            if (editingPersonal.usuario) {
                setGrantAccess(true);
                setUsuario(editingPersonal.usuario);
                setPassword(""); // Allow password reset
            } else {
                setGrantAccess(false);
                setUsuario("");
                setPassword("");
            }
        } else {
            // Reset for new
            setNombre("");
            setCedula("");
            setRol("DOCENTE");
            setDepartamento("MEDIA_GENERAL");
            setGrantAccess(false);
            setUsuario("");
            setPassword("");
        }
    }, [editingPersonal, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("nombre", nombre);
        formData.append("cedula", cedula);
        formData.append("rol", rol);
        formData.append("departamento", departamento);
        formData.append("grantAccess", grantAccess.toString());

        if (grantAccess) {
            formData.append("usuario", usuario);
            formData.append("password", password);
        }

        let res;
        if (editingPersonal) {
            res = await updateUsuario(editingPersonal.id, formData);
        } else {
            res = await createUsuario(formData);
        }

        if (res.success) {
            toast.success(res.message);
            onClose();
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-card border border-border/40 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 h-[90vh] flex flex-col">
                <div className="p-6 border-b border-border/40 flex items-center justify-between bg-accent/5">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                            {editingPersonal ? "Editar Personal" : "Registrar Personal"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            <User className="w-4 h-4" /> Información Básica
                        </h3>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nombre Completo</label>
                            <input
                                required
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                className="w-full bg-accent/20 border border-border/40 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="Ej. Juan Pérez"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Cédula</label>
                                <input
                                    value={cedula}
                                    onChange={e => setCedula(e.target.value)}
                                    className="w-full bg-accent/20 border border-border/40 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="V-12345678"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Rol</label>
                                <select
                                    required
                                    value={rol}
                                    onChange={e => setRol(e.target.value)}
                                    className="w-full bg-accent/20 border border-border/40 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                                >
                                    <option value="DOCENTE">Docente</option>
                                    <option value="COORDINADOR">Coordinador</option>
                                    <option value="ADMINISTRATIVO">Administrativo</option>
                                    <option value="OBRERO">Obrero / Ambientalista</option>
                                    <option value="ADMINISTRADOR">Administrador</option>
                                </select>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Departamento / Coordinación</label>
                                <select
                                    required
                                    value={departamento}
                                    onChange={e => setDepartamento(e.target.value)}
                                    className="w-full bg-accent/20 border border-border/40 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                                >
                                    <option value="MEDIA_GENERAL">Media General (1er a 5to Año)</option>
                                    <option value="MEDIA_BASICA">Media Básica / Especial</option>
                                    <option value="ADMINISTRACION">Administración y Servicios</option>
                                    <option value="DOCUMENTAL">Control de Estudios / Documental</option>
                                    <option value="TODOS">Global (Acceso a todo)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border/40 my-6" />

                    {/* Access Control */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                <KeyRound className="w-4 h-4" /> Acceso al Sistema
                            </h3>
                            <button
                                type="button"
                                onClick={() => setGrantAccess(!grantAccess)}
                                className={cn(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                    grantAccess ? "bg-primary" : "bg-input"
                                )}
                            >
                                <span
                                    className={cn(
                                        "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
                                        grantAccess ? "translate-x-6" : "translate-x-1"
                                    )}
                                />
                            </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            Habilite esta opción si esta persona necesita iniciar sesión en la plataforma (ej. Docentes, Coordinadores).
                            Personas como obreros o vigilantes usualmente no requieren acceso.
                        </p>

                        {grantAccess && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 pt-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nombre de Usuario</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            required={grantAccess}
                                            value={usuario}
                                            onChange={e => setUsuario(e.target.value)}
                                            className="w-full bg-accent/20 border border-border/40 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="usuario.sistema"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                                        {editingPersonal && editingPersonal.usuario ? "Nueva Contraseña (Opcional)" : "Contraseña"}
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="password"
                                            required={grantAccess && !editingPersonal?.usuario}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-accent/20 border border-border/40 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </form>

                <div className="p-6 border-t border-border/40 bg-accent/5 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-accent rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {editingPersonal ? "Guardar Cambios" : "Registrar Personal"}
                    </button>
                </div>
            </div>
        </div>
    );
}
