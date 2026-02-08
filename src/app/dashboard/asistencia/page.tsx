"use client";

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
import { getCurrentClass, getEstudiantesBySeccion, registrarAsistencia, getClassesToday } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ClaseActual {
    id: string;
    seccion: string;
    seccionId: string;
    grado: string;
    materia: string;
    horaInicio: string;
    horaFin: string;
    timeString: string;
}

interface Estudiante {
    id: string;
    seccionId: string;
    nombre: string;
    numeroLista: number;
    genero: "HEMBRA" | "VARON";
    cedula: string | null;
}

export default function AsistenciaPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const [h, setH] = useState(0);
    const [v, setV] = useState(0);

    const [claseActual, setClaseActual] = useState<ClaseActual | null>(null);
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [loading, setLoading] = useState(false);
    const [allClassesToday, setAllClassesToday] = useState<any[]>([]);

    // Form States
    const [tema, setTema] = useState("");
    const [incidencias, setIncidencias] = useState("");
    const [inasistentes, setInasistentes] = useState<string[]>([]);

    useEffect(() => {
        setMounted(true);
        refreshClassData();
    }, []);

    async function refreshClassData() {
        const [clase, allToday] = await Promise.all([
            getCurrentClass(),
            getClassesToday()
        ]);

        setAllClassesToday(allToday);
        if (clase) {
            handleClassSelected(clase);
        } else if (allToday.length > 0) {
            // Default to the first one if none currently active? 
            // Better to let user pick.
        }
    }

    const handleClassSelected = (clase: any) => {
        setClaseActual(clase);
        setInasistentes([]); // Reset inasistencias when class changes
        if (clase?.seccionId) {
            getEstudiantesBySeccion(clase.seccionId).then((data) => {
                setEstudiantes(data);
                const hembras = data.filter((e: any) => e.genero === "HEMBRA").length;
                const varones = data.filter((e: any) => e.genero === "VARON").length;
                setH(hembras);
                setV(varones);
            });
        }
    };

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
            // Obtener fecha actual en Venezuela para el registro
            const venezuelaDate = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'America/Caracas',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(new Date());

            await registrarAsistencia({
                horarioId: claseActual.id,
                fecha: venezuelaDate,
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

    if (!mounted) return null;

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
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight px-2">Diario de Clases</h2>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground px-2">
                        {claseActual ? (
                            <>
                                <span className="bg-primary/5 text-primary px-2 py-0.5 rounded-md font-medium">{claseActual.grado} &quot;{claseActual.seccion}&quot;</span>
                                <ChevronRight className="w-3 h-3 opacity-50" />
                                <span className="font-medium text-foreground">{claseActual.materia} ({claseActual.timeString})</span>
                                {(claseActual as any).docente && (
                                    <>
                                        <ChevronRight className="w-3 h-3 opacity-50" />
                                        <span className="font-bold text-primary/70 italic text-[10px] uppercase tracking-tighter self-center ml-1">
                                            Docente: {(claseActual as any).docente}
                                        </span>
                                    </>
                                )}
                            </>
                        ) : (
                            <span className="font-medium text-muted-foreground">No hay clase activa en este momento</span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    {allClassesToday.length > 0 && (
                        <div className="relative group w-full md:w-64">
                            <select
                                onChange={(e) => {
                                    const selected = allClassesToday.find(c => c.id === e.target.value);
                                    if (selected) handleClassSelected(selected);
                                }}
                                value={claseActual?.id || ""}
                                className="w-full h-12 bg-white/70 backdrop-blur-xl border border-border/40 rounded-2xl px-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Seleccionar clase...</option>
                                {allClassesToday.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.grado} "{c.seccion}" - {c.materia} ({c.docente})
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                <ChevronRight className="w-4 h-4 rotate-90" />
                            </div>
                        </div>
                    )}

                    <Link
                        href={claseActual?.seccionId ? `/dashboard/secciones/${claseActual.seccionId}/estudiantes` : "/dashboard/secciones"}
                        className="px-4 py-2 bg-accent/50 hover:bg-accent border border-border/40 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all w-full md:w-auto justify-center h-12"
                    >
                        <Users className="w-4 h-4" />
                        Gestionar Alumnos
                    </Link>

                    <div className="px-4 py-2 bg-card border border-border/40 rounded-3xl shadow-sm flex items-center justify-between gap-4 w-full md:w-auto h-12">
                        <div className="text-right border-r border-border/40 pr-4 flex-1 md:flex-none">
                            <p className="text-[8px] font-bold text-muted-foreground uppercase leading-tight">Fecha Hoy</p>
                            <p className="text-[11px] font-black uppercase">
                                {new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] font-bold text-muted-foreground uppercase leading-tight">Estado</p>
                            <span className={cn(
                                "text-[9px] font-black px-2 py-0.5 rounded-full uppercase",
                                (claseActual as any)?.estado === 'Completado' ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                            )}>
                                {(claseActual as any)?.estado || 'Pendiente'}
                            </span>
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
