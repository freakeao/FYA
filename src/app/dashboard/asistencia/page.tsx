"use client";

import { useState, useEffect } from "react";
import {
    ClipboardCheck,
    Users,
    Save,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DiarioDetalle } from "@/components/diario/DiarioDetalle";

import { toast } from "sonner";
import { getCurrentClass, getEstudiantesBySeccion, registrarAsistencia } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function AsistenciaPage() {
    const router = useRouter();
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
                getEstudiantesBySeccion(clase.seccionId).then(setEstudiantes);
            }
        });
    }, []);

    // Helper to calculate H/V based on students list and absences
    useEffect(() => {
        if (estudiantes.length > 0) {
            const presentes = estudiantes.filter(e => !inasistentes.includes(e.id));
            const hembras = presentes.filter(e => e.genero === "HEMBRA").length;
            const varones = presentes.filter(e => e.genero === "VARON").length;
            setH(hembras);
            setV(varones);
        }
    }, [estudiantes, inasistentes]);

    const togggleInasistente = (id: string) => {
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
                cantidadH: h,
                cantidadV: v,
                cantidadT: t,
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
                                <p className="text-xs text-muted-foreground">Registre el número de estudiantes presentes en el aula.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <NumberInput
                                label="Hembras (H)"
                                value={h}
                                onChange={setH}
                                color="border-rose-100 focus:ring-rose-50/50 hover:border-rose-200"
                                subLabel="Alumnas"
                            />
                            <NumberInput
                                label="Varones (V)"
                                value={v}
                                onChange={setV}
                                color="border-blue-100 focus:ring-blue-50/50 hover:border-blue-200"
                                subLabel="Alumnos"
                            />
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Total (T)</label>
                                <div className="h-20 w-full flex flex-col items-center justify-center rounded-3xl bg-primary/5 border-2 border-dashed border-primary/20 relative group transition-all">
                                    <span className="text-4xl font-black text-primary drop-shadow-sm">{t}</span>
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
                    <div className="premium-card p-8 rounded-[2rem] sticky top-8 flex flex-col max-h-[calc(100vh-8rem)]">
                        <div className="flex items-center justify-between border-b border-border/40 pb-6 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-destructive/10 rounded-xl">
                                    <AlertCircle className="w-5 h-5 text-destructive" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Inasistencias</h3>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Lista de alumnos ausentes</p>
                                </div>
                            </div>
                            <div className="bg-destructive/10 text-destructive text-xl font-black w-12 h-12 rounded-2xl flex items-center justify-center">
                                {inasistentes.length}
                            </div>
                        </div>

                        <div className="flex-1 space-y-2 overflow-y-auto pr-2 mb-6 custom-scrollbar">
                            {estudiantes.length === 0 ? (
                                <p className="text-center text-muted-foreground text-sm py-8">
                                    {claseActual ? "Cargando alumnos..." : "No hay clase activa"}
                                </p>
                            ) : (
                                estudiantes.map(alumno => (
                                    <button
                                        key={alumno.id}
                                        onClick={() => togggleInasistente(alumno.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden group",
                                            inasistentes.includes(alumno.id)
                                                ? "bg-destructive/[0.03] border-destructive/30 text-destructive shadow-sm"
                                                : "bg-accent/20 border-transparent hover:border-primary/20 hover:bg-accent/40"
                                        )}
                                    >
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110",
                                                alumno.genero === 'H' || alumno.genero === 'HEMBRA'
                                                    ? "bg-rose-100 text-rose-600 shadow-sm shadow-rose-200/50"
                                                    : "bg-blue-100 text-blue-600 shadow-sm shadow-blue-200/50"
                                            )}>
                                                {alumno.genero === 'H' || alumno.genero === 'HEMBRA' ? 'H' : 'V'}
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold block">{alumno.nombre}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter opacity-70">Nº Lista: {alumno.numeroLista}</span>
                                            </div>
                                        </div>
                                        {inasistentes.includes(alumno.id) ? (
                                            <AlertCircle className="w-5 h-5 relative z-10 animate-in zoom-in" />
                                        ) : (
                                            <CheckCircle2 className="w-5 h-5 opacity-0 group-hover:opacity-40 relative z-10 transition-opacity" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>

                        <button
                            onClick={handleFinalizarRegistro}
                            disabled={loading}
                            className={cn(
                                "w-full py-5 bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest rounded-3xl flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all group",
                                loading && "opacity-70 cursor-wait"
                            )}
                        >
                            <Save className={cn("w-5 h-5 transition-transform", !loading && "group-hover:rotate-12")} />
                            {loading ? "Registrando..." : "Finalizar Registro"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function NumberInput({ label, value, onChange, color, subLabel }: any) {
    return (
        <div className="flex flex-col gap-3 group">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">{label}</label>
            <div className="relative">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                    className={cn(
                        "h-20 w-full bg-accent/30 border-2 rounded-3xl px-8 text-3xl font-black outline-none transition-all placeholder:text-muted-foreground/30",
                        color
                    )}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest pointer-events-none group-hover:text-primary/40 transition-colors">
                    {subLabel}
                </span>
            </div>
        </div>
    );
}
