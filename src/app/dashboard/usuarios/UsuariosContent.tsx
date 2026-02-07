"use client";

import { useState } from "react";
import { UserPlus, UserRound, ShieldCheck, Mail, Lock, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteUsuario } from "@/lib/actions";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/components/common/DeleteConfirmModal";

import { UsuarioModal } from "./UsuarioModal";
import { BulkUsuarioUploadModal } from "./BulkUsuarioUploadModal";

interface UsuariosContentProps {
    session: any;
    initialUsers: any[];
}

export function UsuariosContent({ session, initialUsers }: UsuariosContentProps) {
    const [loading, setLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [editingUsuario, setEditingUsuario] = useState<any>(null);

    const handleDelete = async () => {
        if (!idToDelete) return;

        const formData = new FormData();
        formData.append("id", idToDelete);
        const res = await deleteUsuario(formData);
        if (res.success) {
            toast.success(res.message);
        } else {
            toast.error(res.error);
        }
        setIsDeleteModalOpen(false);
        setIdToDelete(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                        <UserRound className="w-4 h-4" />
                        Gestión de Acceso
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Usuarios del Sistema</h2>
                    <p className="text-sm text-muted-foreground">Administre las cuentas de acceso para docentes y coordinadores.</p>
                </div>

                <button
                    onClick={() => {
                        setEditingUsuario(null);
                        setIsFormModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-4 rounded-3xl font-black text-sm uppercase tracking-widest hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 group"
                >
                    <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Nuevo Usuario
                </button>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 bg-card border border-border/40 text-muted-foreground px-6 py-4 rounded-3xl font-black text-sm uppercase tracking-widest hover:text-foreground hover:bg-accent/50 transition-all active:scale-95 group"
                >
                    <span className="flex items-center gap-2">Importar Personal</span>
                </button>
            </div>

            {/* User List */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {initialUsers.map((user) => (
                    <div key={user.id} className="premium-card p-6 rounded-[2rem] flex flex-col justify-between gap-4 group hover:border-primary/30 transition-all">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center font-black text-lg uppercase text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                    {user.nombre[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-lg leading-tight">{user.nombre}</p>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">@{user.usuario}</p>
                                </div>
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border",
                                user.rol === 'ADMINISTRADOR'
                                    ? "bg-primary/5 text-primary border-primary/20"
                                    : "bg-accent/50 text-muted-foreground border-border/50"
                            )}>
                                {user.rol}
                            </span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/40">
                            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                <ShieldCheck className="w-3 h-3" />
                                Acceso Permitido
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => {
                                        setEditingUsuario(user);
                                        setIsFormModalOpen(true);
                                    }}
                                    className="p-2 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                {user.id !== session.user.id && (
                                    <button
                                        onClick={() => {
                                            setIdToDelete(user.id);
                                            setIsDeleteModalOpen(true);
                                        }}
                                        className="p-2 hover:bg-destructive/10 rounded-xl text-destructive transition-colors group/del"
                                    >
                                        <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <UsuarioModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setEditingUsuario(null);
                }}
                editingUsuario={editingUsuario}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setIdToDelete(null);
                }}
                onConfirm={handleDelete}
                title="¿Eliminar Usuario?"
                description="Esta acción eliminará permanentemente al usuario y su acceso al sistema. No se puede deshacer."
            />

            <BulkUsuarioUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />
        </div>
    );
}
