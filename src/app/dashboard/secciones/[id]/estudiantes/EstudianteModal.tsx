"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { addEstudiante, updateEstudiante } from "@/lib/actions";
import { toast } from "sonner";
import { User, Hash, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface EstudianteModalProps {
    isOpen: boolean;
    onClose: () => void;
    seccionId: string;
    editingEstudiante?: any;
    nextNumeroLista?: number;
}

export function EstudianteModal({
    isOpen,
    onClose,
    seccionId,
    editingEstudiante,
    nextNumeroLista = 1
}: EstudianteModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    // ... rest of state ...
    const [formData, setFormData] = useState({
        nombre: "",
        cedula: "",
        numeroLista: 1,
        genero: "VARON" as "HEMBRA" | "VARON"
    });

    useEffect(() => {
        if (editingEstudiante) {
            setFormData({
                nombre: editingEstudiante.nombre || "",
                cedula: editingEstudiante.cedula || "",
                numeroLista: editingEstudiante.numeroLista || 1,
                genero: (editingEstudiante.genero as any) || "VARON"
            });
        } else {
            setFormData({
                nombre: "",
                cedula: "",
                numeroLista: nextNumeroLista,
                genero: "VARON"
            });
        }
    }, [editingEstudiante, isOpen, nextNumeroLista]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = { ...formData, seccionId };
        const res = editingEstudiante
            ? await updateEstudiante(editingEstudiante.id, data)
            : await addEstudiante(data);

        if (res.success) {
            toast.success(res.message);
            router.refresh();
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
            title={editingEstudiante ? "Editar Estudiante" : "Nuevo Estudiante"}
            description={editingEstudiante ? "Actualice la información del estudiante." : "Registre un nuevo estudiante en esta sección."}
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
                            Cédula / ID Escolar
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <Hash className="w-full h-full" />
                            </div>
                            <input
                                type="text"
                                placeholder="Ej: V-12345678"
                                value={formData.cedula}
                                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                                className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Numero Lista */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Nº Lista
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <Hash className="w-full h-full" />
                                </div>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={formData.numeroLista}
                                    onChange={(e) => setFormData({ ...formData, numeroLista: parseInt(e.target.value) })}
                                    className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold font-mono"
                                />
                            </div>
                        </div>

                        {/* Genero */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Género
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                                    <UserCircle className="w-full h-full" />
                                </div>
                                <select
                                    value={formData.genero}
                                    onChange={(e) => setFormData({ ...formData, genero: e.target.value as any })}
                                    className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none cursor-pointer"
                                >
                                    <option value="VARON">Varón</option>
                                    <option value="HEMBRA">Hembra</option>
                                </select>
                            </div>
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
                        {loading ? "PROCESANDO..." : editingEstudiante ? "GUARDAR CAMBIOS" : "REGISTRAR ESTUDIANTE"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
