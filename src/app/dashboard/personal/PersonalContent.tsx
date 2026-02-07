"use client";

import { useState } from "react";
import { UserPlus, Users, UserCog, UserX, Shield, ShieldAlert, KeyRound, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteUsuario } from "@/lib/actions";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/components/common/DeleteConfirmModal";
import { PersonalModal } from "./PersonalModal";
import { BulkUsuarioUploadModal } from "../usuarios/BulkUsuarioUploadModal";

interface PersonalContentProps {
    session: any;
    initialPersonal: any[];
}

export function PersonalContent({ session, initialPersonal }: PersonalContentProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState<string>("ALL");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingPersonal, setEditingPersonal] = useState<any>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const filteredPersonal = initialPersonal.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.cedula && p.cedula.includes(searchTerm)) ||
            (p.usuario && p.usuario.includes(searchTerm));
        const matchesRole = filterRole === "ALL" || p.rol === filterRole;
        return matchesSearch && matchesRole;
    });

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
                        <Users className="w-4 h-4" />
                        Recursos Humanos
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Personal</h2>
                    <p className="text-sm text-muted-foreground">Administre docentes, administrativos y obreros.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 bg-card border border-border/40 text-muted-foreground px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-foreground hover:bg-accent/50 transition-all active:scale-95"
                    >
                        Importar
                    </button>
                    <button
                        onClick={() => {
                            setEditingPersonal(null);
                            setIsFormModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 group"
                    >
                        <UserPlus className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        Nuevo Personal
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, cédula o usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-card border border-border/40 rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <div className="relative w-full md:w-64">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="w-full bg-card border border-border/40 rounded-2xl py-3 pl-10 pr-10 text-sm appearance-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                        <option value="ALL">Todos los Roles</option>
                        <option value="DOCENTE">Docentes</option>
                        <option value="COORDINADOR">Coordinadores</option>
                        <option value="ADMINISTRATIVO">Administrativos</option>
                        <option value="OBRERO">Obreros / Ambientalistas</option>
                        <option value="ADMINISTRADOR">Administradores</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredPersonal.map((person: any) => (
                    <div key={person.id} className="premium-card p-6 rounded-[2rem] flex flex-col gap-4 group hover:border-primary/30 transition-all relative overflow-hidden">
                        {/* Status Indicator Stripe */}
                        <div className={cn(
                            "absolute top-0 left-0 w-full h-1.5",
                            person.usuario ? "bg-emerald-500" : "bg-gray-200"
                        )} />

                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg uppercase transition-colors",
                                    person.usuario
                                        ? "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500/20"
                                        : "bg-accent text-muted-foreground group-hover:bg-accent/80"
                                )}>
                                    {person.nombre[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-lg leading-tight line-clamp-1">{person.nombre}</p>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                        {person.cedula ? `V-${person.cedula}` : "Sin Cédula"}
                                    </p>
                                </div>
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border",
                                "bg-accent/50 text-muted-foreground border-border/50"
                            )}>
                                {person.rol}
                            </span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/40">
                            <div className="flex items-center gap-2">
                                {person.usuario ? (
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md">
                                        <Shield className="w-3 h-3" />
                                        Acceso: @{person.usuario}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">
                                        <UserX className="w-3 h-3" />
                                        Sin Acceso
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => {
                                        setEditingPersonal(person);
                                        setIsFormModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 bg-accent/50 hover:bg-primary/10 rounded-xl text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-primary/20 group/edit"
                                >
                                    <UserCog className="w-4 h-4 group-hover/edit:rotate-12 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Editar</span>
                                </button>
                                {person.id !== session.user.id && (
                                    <button
                                        onClick={() => {
                                            setIdToDelete(person.id);
                                            setIsDeleteModalOpen(true);
                                        }}
                                        className="p-2 hover:bg-destructive/10 rounded-xl text-destructive transition-colors group/del"
                                    >
                                        <UserX className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <PersonalModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setEditingPersonal(null);
                }}
                editingPersonal={editingPersonal}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setIdToDelete(null);
                }}
                onConfirm={handleDelete}
                title="¿Eliminar Personal?"
                description="Esta acción eliminará al registro del sistema. Si tiene clases o asistencias asociadas, podría causar inconsistencias."
            />

            <BulkUsuarioUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />
        </div>
    );
}
