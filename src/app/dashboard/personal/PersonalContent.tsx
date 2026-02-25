"use client";

import { useState, useEffect } from "react";
import { UserPlus, Users, UserCog, UserX, Shield, ShieldAlert, KeyRound, Search, Filter, Layers, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteUsuario } from "@/lib/actions";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/components/common/DeleteConfirmModal";
import { PersonalModal } from "./PersonalModal";
import { BulkUsuarioUploadModal } from "../usuarios/BulkUsuarioUploadModal";
import { DepartamentoManagerModal } from "./DepartamentoManagerModal";
import { useRouter } from "next/navigation";

interface PersonalContentProps {
    session: any;
    initialPersonal: any[];
}

export function PersonalContent({ session, initialPersonal }: PersonalContentProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState<string>("ALL");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingPersonal, setEditingPersonal] = useState<any>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Automatic Update: Poll every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setIsRefreshing(true);
            router.refresh();
            setTimeout(() => setIsRefreshing(false), 2000);
        }, 60000);
        return () => clearInterval(interval);
    }, [router]);

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
            router.refresh();
        } else {
            toast.error(res.error);
        }
        setIsDeleteModalOpen(false);
        setIdToDelete(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header & Action Toolbar */}
            <div className="flex flex-col gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                        <Users className="w-4 h-4" />
                        Recursos Humanos
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Personal</h2>
                    <p className="text-sm text-muted-foreground">Administre docentes, coordinadores y personal de apoyo.</p>
                </div>

                {/* Unified Action Toolbar */}
                <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-2 bg-card/40 border border-border/40 rounded-[2rem] backdrop-blur-md shadow-sm">
                    {/* Search & Filter */}
                    <div className="flex flex-col md:flex-row flex-1 w-full gap-2 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, cédula o usuario..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none py-3 pl-10 pr-4 text-sm focus:ring-0 outline-none font-medium placeholder:text-muted-foreground/60"
                            />
                        </div>
                        <div className="w-px h-8 bg-border/50 hidden md:block" />
                        <div className="w-full md:w-full h-px bg-border/50 md:hidden" />
                        <div className="relative w-full md:w-64">
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="w-full bg-transparent border-none py-3 pl-4 pr-10 text-sm appearance-none focus:ring-0 outline-none font-bold text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                            >
                                <option value="ALL">Todos los Roles</option>
                                <option value="DOCENTE">Docentes</option>
                                <option value="COORDINADOR">Coordinadores</option>
                                <option value="ADMINISTRATIVO">Administrativos</option>
                                <option value="OBRERO">Obreros / Ambientalistas</option>
                                <option value="ADMINISTRADOR">Administradores</option>
                            </select>
                            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    <div className="w-full h-px bg-border/50 xl:hidden" />
                    <div className="w-px h-8 bg-border/50 hidden xl:block" />

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto px-2 pb-2 xl:p-0">
                        <button
                            onClick={() => setIsDeptModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                        >
                            <Layers className="w-4 h-4" />
                            Deptos
                        </button>
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
                        >
                            Importar
                        </button>
                        <button
                            onClick={() => {
                                setEditingPersonal(null);
                                setIsFormModalOpen(true);
                            }}
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 group ml-auto xl:ml-2"
                        >
                            <UserPlus className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            Nuevo
                        </button>
                    </div>
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

                        {/* Card Hover Actions */}
                        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 p-1 shadow-sm">
                            <button
                                onClick={() => {
                                    setEditingPersonal(person);
                                    setIsFormModalOpen(true);
                                }}
                                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                title="Editar"
                            >
                                <UserCog className="w-4 h-4" />
                            </button>
                            {person.id !== session.user.id && (
                                <button
                                    onClick={() => {
                                        setIdToDelete(person.id);
                                        setIsDeleteModalOpen(true);
                                    }}
                                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    title="Eliminar"
                                >
                                    <UserX className="w-4 h-4" />
                                </button>
                            )}
                        </div>

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
                                    <p className="font-bold text-lg leading-tight line-clamp-1 pr-12">{person.nombre}</p>
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            {person.cedula ? `V-${person.cedula}` : "Sin Cédula"}
                                        </p>
                                        <p className="text-[10px] font-black text-primary/60 uppercase tracking-tighter italic">
                                            {person.departamento?.nombre || "Sin Asignar"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border",
                                "bg-accent/50 text-muted-foreground border-border/50"
                            )}>
                                {person.rol}
                            </span>

                            <div className="flex items-center gap-2">
                                {person.usuario ? (
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md">
                                        <Shield className="w-3 h-3" />
                                        @{person.usuario}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">
                                        <UserX className="w-3 h-3" />
                                        Sin Acceso
                                    </div>
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
                onManageDepartments={() => {
                    setIsFormModalOpen(false);
                    setIsDeptModalOpen(true);
                }}
            />

            <DepartamentoManagerModal
                isOpen={isDeptModalOpen}
                onClose={() => setIsDeptModalOpen(false)}
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

