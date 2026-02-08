"use client";

import { useState, useEffect, useMemo } from "react";
import {
    ClipboardCheck,
    Users,
    ChevronRight,
    ArrowLeft,
    Calendar,
    ChevronLeft,
    Clock,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { DiarioDetalle } from "@/components/diario/DiarioDetalle";
import { StudentList } from "@/components/diario/StudentList";
import { NumberInput } from "@/components/common/NumberInput";

import { toast } from "sonner";
import { getCurrentClass, getEstudiantesBySeccion, registrarAsistencia, getClassesByDate } from "@/lib/actions";
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
    estado?: string;
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

    // Date State
    const [date, setDate] = useState(() => {
        // Initialize with today in YYYY-MM-DD format
        const now = new Date();
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Caracas',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(now);
    });

    const [h, setH] = useState(0);
    const [v, setV] = useState(0);

    const [claseActual, setClaseActual] = useState<ClaseActual | null>(null);
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [loading, setLoading] = useState(false);
    const [allClassesToday, setAllClassesToday] = useState<any[]>([]);

    // Form States
    const [tema, setTema] = useState("");
    const [incidencias, setIncidencias] = useState("");
    const [inasistencias, setInasistencias] = useState<Record<string, string>>({});

    useEffect(() => {
        setMounted(true);
        refreshClassData(date);
    }, [date]);

    async function refreshClassData(selectedDate: string) {
        setLoading(true);
        try {
            // First, try to see if there is an ACTIVE class right now (only if date is today)
            // But user might want to see the list first? 
            // Let's just fetch all classes for the selected date.

            const allToday = await getClassesByDate(selectedDate);
            setAllClassesToday(allToday);

            // Logic: If date is TODAY, maybe auto-select current class?
            // Only if user hasn't manually navigated away or deselected.
            // For now, let's auto-select only if it's the initial load.
            if (!claseActual) {
                const now = new Date();
                const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Caracas', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);

                if (selectedDate === todayStr) {
                    const current = await getCurrentClass();
                    if (current) {
                        handleClassSelected(current);
                    }
                }
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleDateChange = (newDate: string) => {
        setDate(newDate);
        setClaseActual(null); // Reset selection when changing date
    };

    const handlePrevDay = () => {
        const d = new Date(date + 'T12:00:00');
        d.setDate(d.getDate() - 1);
        handleDateChange(d.toISOString().split('T')[0]);
    };

    const handleNextDay = () => {
        const d = new Date(date + 'T12:00:00');
        d.setDate(d.getDate() + 1);
        handleDateChange(d.toISOString().split('T')[0]);
    };

    const handleClassSelected = (clase: any) => {
        setClaseActual(clase);
        setInasistencias({}); // Reset inasistencias when class changes
        setTema("");
        setIncidencias("");
        if (clase?.seccionId) {
            getEstudiantesBySeccion(clase.seccionId).then((data) => {
                setEstudiantes(data);
                const hembras = data.filter((e: any) => e.genero === "HEMBRA").length;
                const varones = data.filter((e: any) => e.genero === "VARON").length;

                // If the class is already completed, we might want to fetch the existing attendance record...
                // But for now, we assume we want to VIEW/EDIT if it allows? 
                // Or just show stats? The requirement is to report if forgotten.

                setH(hembras);
                setV(varones);
            });
        }
    };

    // Derived state (memoized)
    const stats = useMemo(() => {
        if (estudiantes.length === 0) return { h: 0, v: 0, t: 0 };
        const inasistentesIds = Object.keys(inasistencias);
        const presentes = estudiantes.filter(e => !inasistentesIds.includes(e.id));
        const hembras = presentes.filter(e => e.genero === "HEMBRA").length;
        const varones = presentes.filter(e => e.genero === "VARON").length;
        return { h: hembras, v: varones, t: hembras + varones };
    }, [estudiantes, inasistencias]);

    const toggleInasistente = (id: string) => {
        setInasistencias(prev => {
            const next = { ...prev };
            if (next[id] !== undefined) {
                delete next[id];
            } else {
                next[id] = "";
            }
            return next;
        });
    };

    const updateInasistenciaNota = (id: string, nota: string) => {
        setInasistencias(prev => ({
            ...prev,
            [id]: nota
        }));
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
                fecha: date, // Use the SELECTED date, not necessarily today
                tema,
                incidencias,
                cantidadH: stats.h,
                cantidadV: stats.v,
                cantidadT: stats.t,
                inasistencias: Object.entries(inasistencias).map(([estudianteId, observacion]) => ({
                    estudianteId,
                    observacion
                }))
            });
            toast.success("Asistencia registrada correctamente");

            // Refund fetching to update status
            refreshClassData(date);
            setInasistencias({}); // Go back to list?

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

                    {/* Date Navigation */}
                    <div className="flex items-center gap-2 px-2 pt-2">
                        <button onClick={handlePrevDay} className="p-1 hover:bg-accent rounded-lg transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="relative group">
                            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="pl-9 pr-3 py-1 bg-transparent border border-border/40 rounded-lg text-sm font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <button onClick={handleNextDay} className="p-1 hover:bg-accent rounded-lg transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Only show select if we are in detail view */}
                    {claseActual && allClassesToday.length > 0 && (
                        <div className="relative group w-full md:w-64">
                            <select
                                onChange={(e) => {
                                    const selected = allClassesToday.find(c => c.id === e.target.value);
                                    if (selected) handleClassSelected(selected);
                                }}
                                value={claseActual?.id || ""}
                                className="w-full h-12 bg-white/70 backdrop-blur-xl border border-border/40 rounded-2xl px-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Cambiar clase...</option>
                                {allClassesToday.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.grado} "{c.seccion}" - {c.materia}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                <ChevronRight className="w-4 h-4 rotate-90" />
                            </div>
                        </div>
                    )}

                    {claseActual && (
                        <div className="px-4 py-2 bg-card border border-border/40 rounded-3xl shadow-sm flex items-center justify-between gap-4 w-full md:w-auto h-12">
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
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            {claseActual ? (
                // DETAIL VIEW (Existing functionality)
                <div className="grid gap-6 lg:grid-cols-12 animate-in fade-in zoom-in-95 duration-500">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="premium-card p-8 rounded-[2rem]">
                            <div className="flex items-center gap-2 border-b border-border/40 pb-6 mb-8">
                                <Users className="w-6 h-6 text-primary" />
                                <div>
                                    <h3 className="font-bold text-xl">Conteo de Asistentes</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {claseActual.grado} "{claseActual.seccion}" - {claseActual.materia}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setClaseActual(null)}
                                    className="ml-auto text-xs font-bold text-primary hover:underline"
                                >
                                    Ver todas las clases
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                <NumberInput
                                    label="Hembras (H)"
                                    value={stats.h}
                                    onChange={() => { }}
                                    color="border-rose-100 focus:ring-rose-50/50 hover:border-rose-200"
                                    subLabel="Alumnas"
                                />
                                <NumberInput
                                    label="Varones (V)"
                                    value={stats.v}
                                    onChange={() => { }}
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

                    <div className="lg:col-span-4 space-y-6">
                        <StudentList
                            estudiantes={estudiantes}
                            inasistencias={inasistencias}
                            onToggle={toggleInasistente}
                            onUpdateNota={updateInasistenciaNota}
                            loading={loading}
                            onSubmit={handleFinalizarRegistro}
                            claseActual={claseActual}
                        />
                    </div>
                </div>
            ) : (
                // GRID VIEW (New Functionality)
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-muted-foreground uppercase tracking-widest">
                            Clases del día ({allClassesToday.length})
                        </h3>
                    </div>

                    {allClassesToday.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <Calendar className="w-12 h-12 mb-4 opacity-20" />
                            <p>No hay clases programadas para este día.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allClassesToday.map((clase) => (
                                <button
                                    key={clase.id}
                                    onClick={() => handleClassSelected(clase)}
                                    className="group relative flex flex-col items-start p-6 bg-card hover:bg-accent/50 border border-border/40 hover:border-primary/20 rounded-[2rem] transition-all duration-300 hover:shadow-lg text-left w-full"
                                >
                                    <div className="absolute top-6 right-6">
                                        {clase.estado === 'Completado' ? (
                                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                        ) : (
                                            <AlertCircle className="w-6 h-6 text-amber-500/50 group-hover:text-amber-500 transition-colors" />
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">
                                            {clase.grado} "{clase.seccion}"
                                        </span>
                                    </div>

                                    <h4 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                                        {clase.materia}
                                    </h4>
                                    <p className="text-xs text-muted-foreground font-medium mb-6">
                                        Docente: {clase.docente}
                                    </p>

                                    <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-border/40">
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                            <Clock className="w-3.5 h-3.5" />
                                            {clase.horaInicio} - {clase.horaFin}
                                        </div>
                                        <div className={cn(
                                            "text-[10px] font-black uppercase px-2 py-0.5 rounded-full",
                                            clase.estado === 'Completado' ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                        )}>
                                            {clase.estado || 'Pendiente'}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

}
