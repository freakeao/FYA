"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Users,
    User,
    BookOpen,
    Edit2,
    Trash2,
    ChevronRight,
    Search,
    GraduationCap,
    Settings2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { deleteSeccion } from "@/lib/actions";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/components/common/DeleteConfirmModal";
import { SeccionModal } from "./SeccionFormModal";

interface SeccionesContentProps {
    initialSecciones: any[];
    docentes: any[];
    departamentos: any[];
}

export function SeccionesContent({ initialSecciones, docentes, departamentos }: SeccionesContentProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [search, setSearch] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingSeccion, setEditingSeccion] = useState<any>(null);

    const handleDelete = async () => {
        if (!idToDelete) return;
        const formData = new FormData();
        formData.append("id", idToDelete);
        const res = await deleteSeccion(formData);
        if (res.success) {
            toast.success(res.message);
        } else {
            toast.error(res.error);
        }
        setIsDeleteModalOpen(false);
        setIdToDelete(null);
    };

    const filteredSecciones = initialSecciones.filter(s =>
        s.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (s.docenteGuia && s.docenteGuia.toLowerCase().includes(search.toLowerCase()))
    );

    if (!mounted) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header & Action Toolbar */}
            <div className="flex flex-col gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                        <GraduationCap className="w-4 h-4" />
                        Aulas Virtuales
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Secciones</h2>
                    <p className="text-sm text-muted-foreground">Administre los grados y aulas disponibles en la institución.</p>
                </div>

                {/* Unified Action Toolbar */}
                <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-2 bg-card/40 border border-border/40 rounded-[2rem] backdrop-blur-md shadow-sm">
                    {/* Search & Stats */}
                    <div className="flex flex-col md:flex-row flex-1 w-full gap-2 items-center px-2">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar sección, docente o guía..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent border-none py-3 pl-8 pr-4 text-sm focus:ring-0 outline-none font-medium placeholder:text-muted-foreground/60"
                            />
                        </div>
                        <div className="w-px h-8 bg-border/50 hidden md:block mx-2" />
                        <div className="flex items-center px-4 py-2 w-full md:w-auto">
                            <span className="text-sm font-bold text-muted-foreground/70 uppercase tracking-widest">
                                {initialSecciones.length} Secciones
                            </span>
                        </div>
                    </div>

                    <div className="w-full h-px bg-border/50 xl:hidden" />
                    <div className="w-px h-8 bg-border/50 hidden xl:block" />

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto px-2 pb-2 xl:p-0">
                        <button
                            onClick={() => {
                                setEditingSeccion(null);
                                setIsFormModalOpen(true);
                            }}
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 group ml-auto xl:ml-2"
                        >
                            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                            Nueva Sección
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredSecciones.map((s: any) => (
                    <div key={s.id} className="premium-card p-6 md:p-8 rounded-[2.5rem] space-y-6 flex flex-col justify-between group hover:border-primary/30 transition-all relative overflow-hidden">

                        {/* Card Hover Actions */}
                        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 p-1 shadow-sm">
                            <button
                                onClick={() => {
                                    setEditingSeccion(s);
                                    setIsFormModalOpen(true);
                                }}
                                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                title="Editar"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    setIdToDelete(s.id);
                                    setIsDeleteModalOpen(true);
                                }}
                                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors group/del"
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                            </button>
                        </div>

                        <div className="flex items-start justify-between">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                                <GraduationCap className="w-7 h-7" />
                            </div>
                        </div>

                        {/* Title Section */}
                        <div className="space-y-1 py-1">
                            <h3 className="text-xl font-black tracking-tight leading-tight pr-12">{s.nombre}</h3>
                            <div className="flex flex-col gap-0.5 mt-1">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                                    Guía: {s.docenteGuia || "Sin Asignar"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-accent/30 p-3 rounded-2xl flex flex-col items-center justify-center space-y-1">
                                <p className="text-lg font-black">{s.alumnosCount}</p>
                                <div className="flex items-center gap-1 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                    <Users className="w-3 h-3" />
                                    Alums
                                </div>
                            </div>
                            <div className="bg-accent/30 p-3 rounded-2xl flex flex-col items-center justify-center space-y-1">
                                <p className="text-lg font-black">{s.materiasCount}</p>
                                <div className="flex items-center gap-1 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                    <BookOpen className="w-3 h-3" />
                                    Mats
                                </div>
                            </div>
                            <div className="bg-primary/5 border border-primary/10 p-3 rounded-2xl flex flex-col items-center justify-center space-y-1">
                                <p className="text-lg font-black text-primary">{s.docentesCount || 0}</p>
                                <div className="flex items-center gap-1 text-[9px] font-black text-primary uppercase tracking-widest">
                                    <User className="w-3 h-3 text-primary" />
                                    Docs
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-auto pt-2">
                            <Link
                                href={`/dashboard/secciones/${s.id}/estudiantes`}
                                className="flex-1 py-3 bg-foreground text-background rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]"
                            >
                                <Settings2 className="w-3.5 h-3.5" />
                                Gestionar
                            </Link>
                            <Link
                                href={`/dashboard/horarios?seccionId=${s.id}`}
                                className="flex-1 py-3 bg-accent/50 hover:bg-accent rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-muted-foreground"
                            >
                                Horarios
                            </Link>
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => {
                        setEditingSeccion(null);
                        setIsFormModalOpen(true);
                    }}
                    className="border-2 border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/[0.02] rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 transition-all group min-h-[350px]"
                >
                    <div className="w-16 h-16 rounded-3xl bg-accent flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                        <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="text-center">
                        <p className="font-black text-lg">Nueva Sección</p>
                        <p className="text-xs text-muted-foreground max-w-[150px]">Cree un nuevo grado para este año escolar.</p>
                    </div>
                </button>
            </div>

            <SeccionModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setEditingSeccion(null);
                }}
                docentes={docentes}
                departamentos={departamentos}
                editingSeccion={editingSeccion}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setIdToDelete(null);
                }}
                onConfirm={handleDelete}
                title="¿Eliminar Sección?"
                description="Esta acción eliminará la sección y a todos los estudiantes inscritos en ella. No se puede deshacer."
            />
        </div >
    );
}

