"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { createUsuario, updateUsuario } from "@/lib/actions";
import { toast } from "sonner";
import { User, Lock, Mail, UserCog } from "lucide-react";

interface UsuarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingUsuario?: any;
}

export function UsuarioModal({
    isOpen,
    onClose,
    editingUsuario
}: UsuarioModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        usuario: "",
        password: "",
        rol: "DOCENTE" as "ADMINISTRADOR" | "COORDINADOR" | "DOCENTE",
        cedula: ""
    });

    useEffect(() => {
        if (editingUsuario) {
            setFormData({
                nombre: editingUsuario.nombre || "",
                usuario: editingUsuario.usuario || "",
                password: "", // Password is optional on edit
                rol: editingUsuario.rol || "DOCENTE",
                cedula: editingUsuario.cedula || ""
            });
        } else {
            setFormData({
                nombre: "",
                usuario: "",
                password: "",
                rol: "DOCENTE",
                cedula: ""
            });
        }
    }, [editingUsuario, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append("nombre", formData.nombre);
        data.append("usuario", formData.usuario);
        data.append("password", formData.password);
        data.append("rol", formData.rol);
        data.append("cedula", formData.cedula);
        data.append("grantAccess", "true"); // Usuarios in this modal always have access

        const res = editingUsuario
            ? await updateUsuario(editingUsuario.id, data)
            : await createUsuario(data);

        if (res.success) {
            toast.success(res.message);
            onClose();
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}
            description={editingUsuario ? "Modifique los datos del usuario. Deje la contraseña en blanco para mantener la actual." : "Registre un nuevo usuario en el sistema."}
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    {/* Nombre */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Nombre Completo
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <User className="w-full h-full" />
                            </div>
                            <input
                                required
                                type="text"
                                placeholder="Ej: Juan Pérez"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            />
                        </div>
                    </div>

                    {/* Cédula */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Cédula de Identidad
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <User className="w-full h-full" />
                            </div>
                            <input
                                required
                                type="text"
                                placeholder="Ej: V-12345678"
                                value={formData.cedula}
                                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                                className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            />
                        </div>
                    </div>

                    {/* Usuario/Email */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Nombre de Usuario
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <Mail className="w-full h-full" />
                            </div>
                            <input
                                required
                                type="text"
                                placeholder="Ej: juan.perez"
                                value={formData.usuario}
                                onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                                className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            {editingUsuario ? "Nueva Contraseña (Opcional)" : "Contraseña"}
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <Lock className="w-full h-full" />
                            </div>
                            <input
                                type="password"
                                required={!editingUsuario}
                                placeholder={editingUsuario ? "••••••••" : "Ingrese contraseña"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            />
                        </div>
                    </div>

                    {/* Rol */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Rol en el Sistema
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                                <UserCog className="w-full h-full" />
                            </div>
                            <select
                                value={formData.rol}
                                onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                                className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none cursor-pointer"
                            >
                                <option value="DOCENTE">DOCENTE</option>
                                <option value="COORDINADOR">COORDINADOR</option>
                                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-14 rounded-2xl border border-border bg-card text-foreground font-black text-[10px] uppercase tracking-widest hover:bg-accent transition-all active:scale-[0.98]"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="h-14 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "PROCESANDO..." : editingUsuario ? "GUARDAR CAMBIOS" : "REGISTRAR USUARIO"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
