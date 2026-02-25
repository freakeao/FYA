"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { createSeccion, updateSeccion } from "@/lib/actions";
import { toast } from "sonner";
import { GraduationCap, User, BookOpen, Users } from "lucide-react";

interface SeccionModalProps {
    isOpen: boolean;
    onClose: () => void;
    docentes: any[];
    departamentos: any[];
    editingSeccion?: any;
}

export function SeccionModal({
    isOpen,
    onClose,
    docentes,
    departamentos,
    editingSeccion
}: SeccionModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        grado: "",
        docenteGuiaId: "",
        departamentoId: ""
    });

    useEffect(() => {
        if (editingSeccion) {
            setFormData({
                nombre: editingSeccion.nombre || "",
                grado: editingSeccion.grado || "",
                docenteGuiaId: editingSeccion.docenteGuiaId || "",
                departamentoId: editingSeccion.departamentoId || ""
            });
        } else {
            setFormData({
                nombre: "",
                grado: "",
                docenteGuiaId: "",
                departamentoId: ""
            });
        }
    }, [editingSeccion, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = editingSeccion
            ? await updateSeccion(editingSeccion.id, formData)
            : await createSeccion(formData);

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
            title={editingSeccion ? "Editar Sección" : "Nueva Sección"}
            description={editingSeccion ? "Modifique los detalles de la sección." : "Cree una nueva sección para el año escolar."}
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    {/* Nombre */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Nombre de la Sección
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <GraduationCap className="w-full h-full" />
                            </div>
                            <input
                                required
                                type="text"
                                placeholder="Ej: 1er Año 'A'"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            />
                        </div>
                    </div>

                    {/* Grado / Nivel */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Grado / Nivel / Año
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <BookOpen className="w-full h-full" />
                            </div>
                            <input
                                required
                                type="text"
                                placeholder="Ej: 1er Año, 2do Año, etc."
                                value={formData.grado}
                                onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
                                className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            />
                        </div>
                    </div>

                    {/* Departamento / Coordinación */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Departamento / Coordinación
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                                <Users className="w-full h-full" />
                            </div>
                            <select
                                required
                                value={formData.departamentoId}
                                onChange={(e) => setFormData({ ...formData, departamentoId: e.target.value })}
                                className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none cursor-pointer"
                            >
                                <option value="">Seleccione coordinación...</option>
                                {departamentos.map((d) => (
                                    <option key={d.id} value={d.id} className="bg-card text-foreground">
                                        {d.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Docente Guia */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Docente Guía
                            </label>
                            <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest bg-muted/50 px-2 py-0.5 rounded-md">Opcional</span>
                        </div>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                                <User className="w-full h-full" />
                            </div>
                            <select
                                value={formData.docenteGuiaId}
                                onChange={(e) => setFormData({ ...formData, docenteGuiaId: e.target.value })}
                                className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none cursor-pointer hover:bg-accent/50"
                            >
                                <option value="">Sin asignar (Opcional)</option>
                                {docentes.map((d) => (
                                    <option key={d.id} value={d.id} className="bg-card text-foreground">
                                        {d.nombre}
                                    </option>
                                ))}
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
                        {loading ? "PROCESANDO..." : editingSeccion ? "GUARDAR CAMBIOS" : "CREAR SECCIÓN"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

