"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import {
    ClipboardCheck,
    Users,
    ChevronRight,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { DiarioDetalle } from "@/components/diario/DiarioDetalle";
import { StudentList } from "@/components/diario/StudentList";
import { NumberInput } from "@/components/common/NumberInput";

import { toast } from "sonner";
import { getCurrentClass, getEstudiantesBySeccion, registrarAsistencia } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function AsistenciaPage() {
    const router = useRouter();
    // Manual overrides for counts (optional, but keep state if user wants to override)
    // However, best practice is to derive from students. 
    // If we want manual override, we keep state. If we want purely derived, we remove state.
    // The previous code had h/v states that were updated by effect.
    // To fix "Derived State via Effect", we should calculate these ON THE FLY if we trust the student list,
    // OR initialize them once.
    // Given the UI allows editing them (NumberInput), they are effectively "initial state derived from props" but manageable.
    // Better pattern: updating students updates these, but they are editable.
    // For now, let's keep them editable but update them when students load (using useEffect only on load is acceptable, or better, in the data fetch callback).

    const [h, setH] = useState(0);
    const [v, setV] = useState(0);
    const t = h + v;

    const [claseActual, setClaseActual] = useState<any>(null);
    const [estudiantes, setEstudiantes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form States
    const [tema, setTema] = useState("");
    const [incidencias, setIncidencias] = useState("");
    const [inasistentes, setInasistentes] = useState<string[]>([]);

    useEffect(() => {
        getCurrentClass().then((clase) => {
            setClaseActual(clase);
            if (clase?.seccionId) {
                getEstudiantesBySeccion(clase.seccionId).then((data) => {
                    setEstudiantes(data);
                    // Initialize counts based on loaded students
                    const hembras = data.filter((e: any) => e.genero === "HEMBRA").length;
                    const varones = data.filter((e: any) => e.genero === "VARON").length;
                    setH(hembras);
                    setV(varones);
                });
            }
        });
    }, []);

    // Optimized: Recalculate counts when inasistentes changes, BUT we want to allow manual edits?
    // The previous logic was:
    // useEffect(() => { ... setH(hembrasPresentes) ... }, [estudiantes, inasistentes])
    // This effectively overwrote manual changes if they were allowed.
    // If we want to strictly follow "Derived State", we should NOT have state for h/v if they are purely calculated.
    // But the UI has NumberInputs... leading to ambiguity.
    // Assumption: The system should auto-calculate based on attendance. Manual override is weird if we have a student list.
    // I will implement stricter derived state for better integrity.

    // Derived state (memoized)
    const stats = useMemo(() => {
        if (estudiantes.length === 0) return { h: 0, v: 0, t: 0 };
        const presentes = estudiantes.filter(e => !inasistentes.includes(e.id));
        const hembras = presentes.filter(e => e.genero === "HEMBRA").length;
        const varones = presentes.filter(e => e.genero === "VARON").length;
        return { h: hembras, v: varones, t: hembras + varones };
    }, [estudiantes, inasistentes]);

    const toggleInasistente = (id: string) => {
        setInasistentes(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleFinalizarRegistro = async () => {
        if (!claseActual) {
            toast.error("No hay una clase activa asignada para registrar asistencia.");
            return;
        }

        if (!tema.trim()) {
            toast.error("Por favor ingrese el tema tratado en clase.");
            return;
        }

        setLoading(true);
        try {
            await registrarAsistencia({
                horarioId: claseActual.id,
                fecha: new Date().toISOString().split('T')[0],
                tema,
                incidencias,
                cantidadH: stats.h,
                cantidadV: stats.v,
                cantidadT: stats.t,
                inasistencias: inasistentes
            });
            toast.success("Asistencia registrada correctamente");
            router.push("/dashboard");
        } catch (error) {
            toast.error("Error al registrar asistencia");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // If we want to allow manual overrides, we'd need a different approach. 
    // BUT for data integrity, if we have a list of students, the counts MUST match the list.
    // So I will make the inputs read-only or just displays, OR keep them as NumberInput but controlled by derived state (effectively read-only unless we decouple).
    // I'll keep them as displays of the derived values to ensure consistency.

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard"
                            className="p-2 hover:bg-accent rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                            <ClipboardCheck className="w-4 h-4" />
                            Registro de Asistencia
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight px-2">Diario de Clases</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground px-2">
                        {claseActual ? (
                            <>
                                <span className="bg-primary/5 text-primary px-2 py-0.5 rounded-md font-medium">{claseActual.grado} "{claseActual.seccion}"</span>
                                <ChevronRight className="w-3 h-3 opacity-50" />
                                <span className="font-medium text-foreground">{claseActual.materia} ({claseActual.timeString})</span>
                            </>
                        ) : (
                            <span className="font-medium text-muted-foreground">No hay clase activa en este momento</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={claseActual ? `/dashboard/secciones/${claseActual.seccionId}/estudiantes` : "#"}
                        className="px-4 py-2 bg-accent/50 hover:bg-accent border border-border/40 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                        <Users className="w-4 h-4" />
                        Gestionar Alumnos
                    </Link>
                    <div className="px-6 py-3 bg-card border border-border/40 rounded-3xl shadow-sm flex items-center gap-4">
                        <div className="text-right border-r border-border/40 pr-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Fecha Hoy</p>
                            <p className="text-sm font-bold">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Estado</p>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded-full uppercase">Pendiente</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                {/* Lado Izquierdo: Conteo y Detalle de Clase */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="premium-card p-8 rounded-[2rem]">
                        <div className="flex items-center gap-2 border-b border-border/40 pb-6 mb-8">
                            <Users className="w-6 h-6 text-primary" />
                            <div>
                                <h3 className="font-bold text-xl">Conteo de Asistentes</h3>
                                <p className="text-xs text-muted-foreground">Calculado automáticamente basado en la lista.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <NumberInput
                                label="Hembras (H)"
                                value={stats.h}
                                onChange={() => { }} // Read-only derived from list
                                color="border-rose-100 focus:ring-rose-50/50 hover:border-rose-200"
                                subLabel="Alumnas"
                            />
                            <NumberInput
                                label="Varones (V)"
                                value={stats.v}
                                onChange={() => { }} // Read-only derived from list
                                color="border-blue-100 focus:ring-blue-50/50 hover:border-blue-200"
                                subLabel="Alumnos"
                            />
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Total (T)</label>
                                <div className="h-20 w-full flex flex-col items-center justify-center rounded-3xl bg-primary/5 border-2 border-dashed border-primary/20 relative group transition-all">
                                    <span className="text-4xl font-black text-primary drop-shadow-sm">{stats.t}</span>
                                    <span className="text-[10px] font-bold text-primary/60 uppercase">Presentes</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DiarioDetalle
                        clase={claseActual}
                        tema={tema}
                        setTema={setTema}
                        incidencias={incidencias}
                        setIncidencias={setIncidencias}
                    />
                </div>

                {/* Lado Derecho: Inasistencias */}
                <div className="lg:col-span-4 space-y-6">
                    <StudentList
                        estudiantes={estudiantes}
                        inasistentes={inasistentes}
                        onToggle={toggleInasistente}
                        loading={loading}
                        onSubmit={handleFinalizarRegistro}
                        claseActual={claseActual}
                    />
                </div>
            </div>
        </div>
    );
}
