"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { createMateria, updateMateria } from "@/lib/actions";
import { toast } from "sonner";
import { BookOpen, Hash, Palette } from "lucide-react";

interface MateriaModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingMateria?: any;
}

const COLORS = [
    { name: "Principal", value: "bg-primary" },
    { name: "Azul", value: "bg-blue-500" },
    { name: "Esmeralda", value: "bg-emerald-500" },
    { name: "Violeta", value: "bg-violet-500" },
    { name: "Ambar", value: "bg-amber-500" },
    { name: "Rosa", value: "bg-rose-500" },
    { name: "Cian", value: "bg-cyan-500" },
];

export function MateriaModal({
    isOpen,
    onClose,
    editingMateria
}: MateriaModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        codigo: "",
        color: "bg-primary"
    });

    useEffect(() => {
        if (editingMateria) {
            setFormData({
                nombre: editingMateria.nombre || "",
                codigo: editingMateria.codigo || "",
                color: editingMateria.color || "bg-primary"
            });
        } else {
            setFormData({
                nombre: "",
                codigo: "",
                color: "bg-primary"
            });
        }
    }, [editingMateria, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = editingMateria
            ? await updateMateria(editingMateria.id, formData)
            : await createMateria(formData);

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
            title={editingMateria ? "Editar Materia" : "Nueva Materia"}
            description={editingMateria ? "Actualice los datos de la asignatura." : "Agregue una nueva materia al catálogo escolar."}
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    {/* Nombre */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Nombre de la Materia
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <BookOpen className="w-full h-full" />
                            </div>
                            <input
                                required
                                type="text"
                                placeholder="Ej: Matemática I"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            />
                        </div>
                    </div>

                    {/* Codigo */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Código (Opcional)
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <Hash className="w-full h-full" />
                            </div>
                            <input
                                type="text"
                                placeholder="Ej: MAT-01"
                                value={formData.codigo}
                                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            />
                        </div>
                    </div>

                    {/* Color */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Identificador Visual (Color)
                        </label>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color: c.value })}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${c.value} ${formData.color === c.value ? "border-foreground scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"}`}
                                    title={c.name}
                                />
                            ))}
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
                        {loading ? "PROCESANDO..." : editingMateria ? "GUARDAR CAMBIOS" : "CREAR MATERIA"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
