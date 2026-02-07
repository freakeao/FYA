"use client";

import { useState } from "react";
import {
    Plus,
    Users,
    BookOpen,
    Edit2,
    Trash2,
    ChevronRight,
    Search,
    GraduationCap
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
}

export function SeccionesContent({ initialSecciones, docentes }: SeccionesContentProps) {
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Toolbar */}
            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Buscar sección o docente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-card border border-border/40 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
            </div>

            {/* Grid */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredSecciones.map((s: any) => (
                    <div key={s.id} className="premium-card p-8 rounded-[2.5rem] space-y-6 group hover:border-primary/30 transition-all">
                        <div className="flex items-start justify-between">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                                <GraduationCap className="w-7 h-7" />
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => {
                                        setEditingSeccion(s);
                                        setIsFormModalOpen(true);
                                    }}
                                    className="p-2 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        setIdToDelete(s.id);
                                        setIsDeleteModalOpen(true);
                                    }}
                                    className="p-2 hover:bg-destructive/10 rounded-xl text-destructive transition-colors group/del"
                                >
                                    <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-2xl font-black tracking-tight">{s.nombre}</h3>
                            <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    s.docenteGuia ? "bg-emerald-500" : "bg-muted-foreground/30"
                                )} />
                                {s.docenteGuia || "Sin docente guía"}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-accent/30 p-4 rounded-2xl space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                                    <Users className="w-3 h-3" />
                                    Alumnos
                                </div>
                                <p className="text-xl font-black">{s.alumnosCount}</p>
                            </div>
                            <div className="bg-accent/30 p-4 rounded-2xl space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                                    <BookOpen className="w-3 h-3" />
                                    Materias
                                </div>
                                <p className="text-xl font-black">{s.materiasCount}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Link
                                href={`/dashboard/secciones/${s.id}/estudiantes`}
                                className="w-full py-3 bg-foreground text-background rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]"
                            >
                                Ver Alumnos
                                <ChevronRight className="w-3 h-3" />
                            </Link>
                            <Link
                                href={`/dashboard/horarios?seccionId=${s.id}`}
                                className="w-full py-3 bg-accent/50 hover:bg-accent rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                Ver Horarios
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
        </div>
    );
}
