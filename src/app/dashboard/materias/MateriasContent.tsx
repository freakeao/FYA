"use client";

import { useState } from "react";
import {
    BookOpen,
    Search,
    Edit2,
    Trash2,
    Library,
    Layers,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteMateria } from "@/lib/actions";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/components/common/DeleteConfirmModal";
import { MateriaModal } from "./MateriaModal";
import { Plus } from "lucide-react";

interface MateriasContentProps {
    initialMaterias: any[];
}

export function MateriasContent({ initialMaterias }: MateriasContentProps) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingMateria, setEditingMateria] = useState<any>(null);


    const handleDelete = async () => {
        if (!idToDelete) return;
        const formData = new FormData();
        formData.append("id", idToDelete);
        const res = await deleteMateria(formData);
        if (res.success) {
            toast.success(res.message);
        } else {
            toast.error(res.error);
        }
        setIsDeleteModalOpen(false);
        setIdToDelete(null);
    };

    const [search, setSearch] = useState("");

    const filteredMaterias = initialMaterias.filter(m =>
        m.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (m.codigo && m.codigo.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header (Moved here for state management) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                        <Library className="w-4 h-4" />
                        Catálogo Escolar
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Materias y Áreas</h2>
                    <p className="text-sm text-muted-foreground">Administre el listado oficial de asignaturas del plantel.</p>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-card border border-border/40 text-foreground px-6 py-4 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-accent transition-all active:scale-95 shadow-sm">
                        Asignación Masiva
                    </button>
                    <button
                        onClick={() => {
                            setEditingMateria(null);
                            setIsFormModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-4 rounded-3xl font-black text-sm uppercase tracking-widest hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Nueva Materia
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Buscar materia por nombre o código..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-card border border-border/40 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
            </div>

            {/* List */}
            <div className="grid gap-4">
                {filteredMaterias.map((m) => (
                    <div key={m.id} className="premium-card p-6 rounded-[1.75rem] flex items-center justify-between group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-6">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden", m.color || "bg-primary")}>
                                <div className="absolute inset-0 bg-white/10" />
                                <BookOpen className="w-7 h-7 text-white relative z-10" />
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-black text-lg tracking-tight">{m.nombre}</h3>
                                    {m.codigo && (
                                        <span className="text-[10px] font-black px-2 py-0.5 bg-accent/50 text-muted-foreground rounded-md uppercase">
                                            {m.codigo}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                        <Layers className="w-3 h-3" />
                                        Materia
                                    </p>
                                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-amber-500" />
                                        Activa
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col items-end mr-8">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Último ajuste</p>
                                <p className="text-xs font-bold font-mono">{new Date().toISOString().split('T')[0]}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setEditingMateria(m);
                                        setIsFormModalOpen(true);
                                    }}
                                    className="p-3 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        setIdToDelete(m.id);
                                        setIsDeleteModalOpen(true);
                                    }}
                                    className="p-3 hover:bg-destructive/10 rounded-xl text-destructive transition-all group/del"
                                >
                                    <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredMaterias.length === 0 && (
                <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto">
                        <Library className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-black text-lg">No se encontraron materias</p>
                        <p className="text-sm text-muted-foreground">Asegúrese de cargar el catálogo inicial de asignaturas.</p>
                    </div>
                </div>
            )}

            <MateriaModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setEditingMateria(null);
                }}
                editingMateria={editingMateria}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setIdToDelete(null);
                }}
                onConfirm={handleDelete}
                title="¿Eliminar Materia?"
                description="Esta acción eliminará la materia de forma permanente y la quitará de todos los horarios relacionados. No se puede deshacer."
            />
        </div>
    );
}
