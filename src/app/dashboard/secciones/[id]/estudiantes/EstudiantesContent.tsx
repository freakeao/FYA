"use client";

import { useState } from "react";
import {
    Users,
    UserPlus,
    Search,
    Edit2,
    Trash2,
    ArrowLeft,
    GraduationCap
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { deleteEstudiante } from "@/lib/actions";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/components/common/DeleteConfirmModal";
import { EstudianteModal } from "./EstudianteModal";
import { BulkUploadModal } from "./BulkUploadModal";

interface EstudiantesContentProps {
    seccion: any;
    initialAlumnos: any[];
}

export function EstudiantesContent({ seccion, initialAlumnos }: EstudiantesContentProps) {
    const [search, setSearch] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [editingEstudiante, setEditingEstudiante] = useState<any>(null);


    const handleDelete = async () => {
        if (!idToDelete) return;
        const formData = new FormData();
        formData.append("id", idToDelete);
        formData.append("seccionId", seccion.id);
        const res = await deleteEstudiante(formData);
        if (res.success) {
            toast.success(res.message);
        } else {
            toast.error(res.error);
        }
        setIsDeleteModalOpen(false);
        setIdToDelete(null);
    };

    const filteredAlumnos = initialAlumnos.filter(a =>
        a.nombre.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard/secciones"
                            className={cn(
                                "p-2 hover:bg-accent rounded-xl transition-all duration-300",
                                "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                            <Users className="w-4 h-4" />
                            Gestión de Alumnos
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight px-2">{seccion?.nombre || "Cargando..."}</h2>
                    <p className="text-sm text-muted-foreground px-2">Total: <span className="text-foreground font-bold">{initialAlumnos.length} Alumnos</span></p>
                </div>

                <button
                    onClick={() => {
                        setEditingEstudiante(null);
                        setIsFormModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 group"
                >
                    <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Nuevo Alumno
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar alumno por nombre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-card border border-border/40 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all shadow-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="px-4 py-3 bg-card border border-border/40 rounded-2xl text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all hover:bg-accent/50 group"
                    >
                        <span className="flex items-center gap-2">Importar Excel/CSV</span>
                    </button>
                    <button className="px-4 py-3 bg-card border border-border/40 rounded-2xl text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all">
                        Ordenar
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="premium-card rounded-[2rem] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-accent/10 border-b border-border/40">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Nº Lista</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Nombre del Estudiante</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Género</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                        {filteredAlumnos.map((alumno) => (
                            <tr key={alumno.id} className="group hover:bg-accent/5 transition-colors">
                                <td className="px-8 py-5">
                                    <span className="text-sm font-black text-muted-foreground/50 group-hover:text-primary transition-colors">
                                        {alumno.numeroLista?.toString().padStart(2, "0")}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                                            <GraduationCap className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <span className="text-sm font-bold">{alumno.nombre}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={cn(
                                        "text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider",
                                        alumno.genero === "HEMBRA"
                                            ? "bg-rose-50 border-rose-100 text-rose-600"
                                            : "bg-blue-50 border-blue-100 text-blue-600"
                                    )}>
                                        {alumno.genero === "HEMBRA" ? "Hembra" : "Varón"}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setEditingEstudiante(alumno);
                                                setIsFormModalOpen(true);
                                            }}
                                            className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIdToDelete(alumno.id);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors group/del"
                                        >
                                            <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredAlumnos.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold">No se encontraron alumnos</p>
                            <p className="text-sm text-muted-foreground">Todavía no hay alumnos cargados en esta sección.</p>
                        </div>
                    </div>
                )}
            </div>

            <EstudianteModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setEditingEstudiante(null);
                }}
                seccionId={seccion.id}
                editingEstudiante={editingEstudiante}
                nextNumeroLista={initialAlumnos.length + 1}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setIdToDelete(null);
                }}
                onConfirm={handleDelete}
                title="¿Eliminar Estudiante?"
                description="Esta acción eliminará al estudiante de forma permanente. No se puede deshacer."
            />

            <BulkUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                seccionId={seccion.id}
            />
        </div>
    );
}
