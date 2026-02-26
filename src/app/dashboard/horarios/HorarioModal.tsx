"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { createHorario, updateHorario } from "@/lib/actions";
import { toast } from "sonner";
import { Clock, BookOpen, GraduationCap, User, Calendar } from "lucide-react";
import { CustomTimeSelect } from "@/components/ui/custom-time-select";
import { SearchableSelect } from "@/components/ui/searchable-select";

const TIME_OPTIONS = [
    { label: "07:00 a.m.", value: "07:00" },
    { label: "07:40 a.m.", value: "07:40" },
    { label: "08:20 a.m.", value: "08:20" },
    { label: "09:00 a.m.", value: "09:00" },
    { label: "09:10 a.m.", value: "09:10" },
    { label: "09:50 a.m.", value: "09:50" },
    { label: "10:30 a.m.", value: "10:30" },
    { label: "11:10 a.m.", value: "11:10" },
    { label: "11:50 a.m.", value: "11:50" },
    { label: "12:20 p.m.", value: "12:20" },
    { label: "01:00 p.m.", value: "13:00" },
    { label: "01:40 p.m.", value: "13:40" },
    { label: "02:20 p.m.", value: "14:20" },
    { label: "02:30 p.m.", value: "14:30" },
    { label: "03:10 p.m.", value: "15:10" },
    { label: "03:50 p.m.", value: "15:50" },
    { label: "04:30 p.m.", value: "16:30" },
    { label: "05:10 p.m.", value: "17:10" },
    { label: "05:50 p.m.", value: "17:50" },
];

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
                                <SearchableSelect
                                    required={tipoBloque === "CLASE"}
                                    value={formData.seccionId}
                                    onChange={(val) => setFormData({ ...formData, seccionId: val })}
                                    placeholder="Seleccione una sección..."
                                    icon={<GraduationCap className="w-full h-full" />}
                                    options={secciones.map((s) => ({ value: s.id, label: `${s.nombre} - ${s.grado}` }))}
                                />
                            </div>

                            {/* Materia */}
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                    Materia
                                </label>
                                <SearchableSelect
                                    required={tipoBloque === "CLASE"}
                                    value={formData.materiaId}
                                    onChange={(val) => setFormData({ ...formData, materiaId: val })}
                                    placeholder="Seleccione una materia..."
                                    icon={<BookOpen className="w-full h-full" />}
                                    options={materias.map((m) => ({ value: m.id, label: `${m.nombre} ${m.codigo ? `(${m.codigo})` : ''}` }))}
                                />
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
                        <SearchableSelect
                            required
                            value={formData.docenteId}
                            onChange={(val) => setFormData({ ...formData, docenteId: val })}
                            placeholder="Seleccione un responsable..."
                            icon={<User className="w-full h-full" />}
                            options={docentes.map((d) => ({ value: d.id, label: `${d.nombre} (${d.rol})` }))}
                        />
                    </div>

                    {/* Horas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Hora Inicio
                            </label>
                            <CustomTimeSelect
                                required
                                value={formData.horaInicio}
                                onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                                options={TIME_OPTIONS}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Hora Fin
                            </label>
                            <CustomTimeSelect
                                required
                                value={formData.horaFin}
                                onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                                options={TIME_OPTIONS}
                            />
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
