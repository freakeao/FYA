"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { createHorario, updateHorario } from "@/lib/actions";
import { toast } from "sonner";
import { Clock, BookOpen, GraduationCap, User, Calendar } from "lucide-react";

interface HorarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    secciones: any[];
    materias: any[];
    docentes: any[];
    editingHorario?: any;
    day: string;
}

export function HorarioModal({
    isOpen,
    onClose,
    secciones,
    materias,
    docentes,
    editingHorario,
    day
}: HorarioModalProps) {
    const [loading, setLoading] = useState(false);
    const [tipoBloque, setTipoBloque] = useState<"CLASE" | "ACTIVIDAD">("CLASE");
    const [formData, setFormData] = useState({
        seccionId: "",
        materiaId: "",
        docenteId: "",
        horaInicio: "",
        horaFin: "",
        diaSemana: day,
        descripcion: ""
    });

    useEffect(() => {
        setFormData(prev => ({ ...prev, diaSemana: day }));
    }, [day]);

    useEffect(() => {
        if (editingHorario) {
            const isClase = !!editingHorario.materiaId;
            setTipoBloque(isClase ? "CLASE" : "ACTIVIDAD");

            setFormData({
                seccionId: editingHorario.seccionId || "",
                materiaId: editingHorario.materiaId || "",
                docenteId: editingHorario.docenteId || "",
                horaInicio: editingHorario.horaInicio || "",
                horaFin: editingHorario.horaFin || "",
                diaSemana: editingHorario.diaSemana || day,
                descripcion: editingHorario.descripcion || ""
            });
        } else {
            setTipoBloque("CLASE");
            setFormData({
                seccionId: "",
                materiaId: "",
                docenteId: "",
                horaInicio: "",
                horaFin: "",
                diaSemana: day,
                descripcion: ""
            });
        }
    }, [editingHorario, isOpen, day]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload: any = {
            ...formData,
            seccionId: tipoBloque === "CLASE" ? formData.seccionId : null,
            materiaId: tipoBloque === "CLASE" ? formData.materiaId : null,
            descripcion: tipoBloque === "ACTIVIDAD" ? formData.descripcion : null
        };

        const res = editingHorario
            ? await updateHorario(editingHorario.id, payload)
            : await createHorario(payload);

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
            title={editingHorario ? "Editar Bloque" : "Nuevo Bloque"}
            description={editingHorario ? "Modifique los detalles." : `Agregue una actividad al horario del ${day.toLowerCase()}.`}
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Selector de Tipo */}
                <div className="flex bg-accent/30 p-1 rounded-2xl border border-border/40 mb-6">
                    <button
                        type="button"
                        onClick={() => setTipoBloque("CLASE")}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tipoBloque === "CLASE"
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-muted-foreground hover:bg-accent"
                            }`}
                    >
                        Clase Académica
                    </button>
                    <button
                        type="button"
                        onClick={() => setTipoBloque("ACTIVIDAD")}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tipoBloque === "ACTIVIDAD"
                                ? "bg-indigo-600 text-white shadow-md"
                                : "text-muted-foreground hover:bg-accent"
                            }`}
                    >
                        Actividad / Otro
                    </button>
                </div>

                <div className="space-y-4">

                    {tipoBloque === "CLASE" ? (
                        <>
                            {/* Seccion */}
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                    Sección / Grado
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                                        <GraduationCap className="w-full h-full" />
                                    </div>
                                    <select
                                        required={tipoBloque === "CLASE"}
                                        value={formData.seccionId}
                                        onChange={(e) => setFormData({ ...formData, seccionId: e.target.value })}
                                        className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="">Seleccione una sección...</option>
                                        {secciones.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.nombre} - {s.grado}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Materia */}
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                    Materia
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                                        <BookOpen className="w-full h-full" />
                                    </div>
                                    <select
                                        required={tipoBloque === "CLASE"}
                                        value={formData.materiaId}
                                        onChange={(e) => setFormData({ ...formData, materiaId: e.target.value })}
                                        className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="">Seleccione una materia...</option>
                                        {materias.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.nombre} {m.codigo ? `(${m.codigo})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Descripcion (Actividad) */
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Descripción de la Actividad
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                                    <BookOpen className="w-full h-full" />
                                </div>
                                <input
                                    type="text"
                                    required={tipoBloque === "ACTIVIDAD"}
                                    placeholder="Ej: Supervisión, Administrativo, Guardia..."
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
                                />
                            </div>
                        </div>
                    )}

                    {/* Dia de la Semana */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Día de la Semana
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                                <Calendar className="w-full h-full" />
                            </div>
                            <select
                                required
                                value={formData.diaSemana}
                                onChange={(e) => setFormData({ ...formData, diaSemana: e.target.value })}
                                className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none cursor-pointer"
                            >
                                {["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"].map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Responsable (Docente / Personal) */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Responsable (Docente / Personal)
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                                <User className="w-full h-full" />
                            </div>
                            <select
                                required
                                value={formData.docenteId}
                                onChange={(e) => setFormData({ ...formData, docenteId: e.target.value })}
                                className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none cursor-pointer"
                            >
                                <option value="">Seleccione un responsable...</option>
                                {docentes.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.nombre} ({d.rol})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Horas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Hora Inicio
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <Clock className="w-full h-full" />
                                </div>
                                <input
                                    required
                                    type="time"
                                    value={formData.horaInicio}
                                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                                    className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Hora Fin
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <Clock className="w-full h-full" />
                                </div>
                                <input
                                    required
                                    type="time"
                                    value={formData.horaFin}
                                    onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                                    className="w-full bg-accent/30 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                />
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
                        {loading ? "PROCESANDO..." : editingHorario ? "GUARDAR CAMBIOS" : "AGREGAR BLOQUE"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
