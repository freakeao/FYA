"use client";

import { useEffect, useState } from "react";
import { Download, Calendar, Users, Briefcase, FileText, Loader2, Filter, User, Search } from "lucide-react";
import { cn, getVenezuelaToday } from "@/lib/utils";
import { getAsistenciaPersonalReport, getAsistenciaAlumnosReport, getEstudiantesBySeccion } from "@/lib/actions";
import { exportToExcel } from "@/lib/excel";
import { toast } from "sonner";

interface ReportesContentProps {
    userRole: string;
    secciones: { id: string; nombre: string }[];
}

export function ReportesContent({ userRole, secciones }: ReportesContentProps) {
    const today = getVenezuelaToday();
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [seccionId, setSeccionId] = useState<string>("TODAS");
    const [estudiantes, setEstudiantes] = useState<any[]>([]);
    const [estudianteId, setEstudianteId] = useState<string>("TODOS");
    const [studentSearch, setStudentSearch] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (seccionId === "TODAS") {
            setEstudiantes([]);
            setEstudianteId("TODOS");
            setStudentSearch("TODOS LOS ESTUDIANTES");
            return;
        }

        getEstudiantesBySeccion(seccionId).then((data) => {
            setEstudiantes(data);
            setEstudianteId("TODOS");
            setStudentSearch("TODOS LOS ESTUDIANTES");
        }).catch(console.error);
    }, [seccionId]);

    const handleExportPersonal = async () => {
        setLoading(true);
        try {
            const data = await getAsistenciaPersonalReport(startDate, endDate);
            if (data.length === 0) {
                toast.error("No se encontraron inasistencias de personal en este rango.");
            } else {
                exportToExcel(data, `Inasistencias_Personal_${startDate}_a_${endDate}`, "Personal");
                toast.success("Reporte de personal generado con éxito");
            }
        } catch (e) {
            toast.error("Error al generar el reporte");
        } finally {
            setLoading(false);
        }
    };

    const handleExportAlumnos = async () => {
        if (seccionId !== "TODAS" && estudianteId === "") {
            toast.error("Debe seleccionar un estudiante válido de la lista o 'TODOS'.");
            return;
        }

        setLoading(true);
        try {
            const data = await getAsistenciaAlumnosReport(
                startDate,
                endDate,
                seccionId === "TODAS" ? undefined : seccionId,
                estudianteId === "TODOS" ? undefined : estudianteId
            );
            if (data.length === 0) {
                toast.error("No se encontraron inasistencias de alumnos en este rango.");
            } else {
                let suffix = seccionId !== "TODAS" ? `_Seccion_${seccionId}` : "";
                if (estudianteId !== "TODOS") {
                    const estName = estudiantes.find(e => e.id === estudianteId)?.nombre || estudianteId;
                    suffix += `_Estudiante_${estName.replace(/\s+/g, '_')}`;
                }
                exportToExcel(data, `Inasistencias_Alumnos_${startDate}_a_${endDate}${suffix}`, "Alumnos");
                toast.success("Reporte de alumnos generado con éxito");
            }
        } catch (e) {
            toast.error("Error al generar el reporte");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            {/* Filter Card */}
            <div className="premium-card p-10 rounded-[3rem] space-y-8 lg:col-span-2">
                <div className="flex items-center gap-4 border-b border-border/40 pb-6">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                        <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-black text-xl uppercase tracking-tighter">Rango de Fechas</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Seleccione el período de auditoría</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Fecha Inicial</label>
                        <div className="relative group">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full h-16 bg-card border-2 border-border/40 rounded-3xl px-8 text-lg font-black outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all uppercase"
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Fecha Final</label>
                        <div className="relative group">
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full h-16 bg-card border-2 border-border/40 rounded-3xl px-8 text-lg font-black outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all uppercase"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Teacher Report Action */}
            {userRole !== "DOCENTE" && (
                <div className="premium-card p-8 rounded-[3rem] group hover:scale-[1.02] transition-all duration-500 border-2 border-transparent hover:border-primary/20">
                    <div className="flex flex-col h-full space-y-6">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mb-2">
                            <Briefcase className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black tracking-tighter uppercase">Inasistencias Personal</h3>
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                Genera un listado de todos los docentes que no asistieron a sus bloques horarios o fueron marcados ausentes por coordinación.
                            </p>
                        </div>
                        <button
                            onClick={handleExportPersonal}
                            disabled={loading}
                            className="mt-auto w-full h-16 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all disabled:opacity-50 active:scale-95"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                            Exportar a Excel
                        </button>
                    </div>
                </div>
            )}

            {/* Students Report Action */}
            <div className="premium-card p-8 rounded-[3rem] group hover:scale-[1.02] transition-all duration-500 border-2 border-transparent hover:border-emerald/20">
                <div className="flex flex-col h-full space-y-6">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mb-2">
                        <Users className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tighter uppercase">Inasistencias Alumnos</h3>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            Reporte detallado de inasistencias por sección y materia. Útil para coordinadores de grado y reportes mensuales.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                            <Filter className="w-3 h-3" /> Filtrar por Sección
                        </label>
                        <select
                            value={seccionId}
                            onChange={(e) => setSeccionId(e.target.value)}
                            className="w-full h-14 bg-card border-2 border-border/40 rounded-2xl px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all uppercase"
                        >
                            <option value="TODAS">TODAS LAS SECCIONES</option>
                            {secciones.map((s) => (
                                <option key={s.id} value={s.id}>{s.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3 relative">
                        <label className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em] ml-1 flex items-center gap-2 transition-colors",
                            seccionId === "TODAS" ? "text-muted-foreground/30" : "text-muted-foreground/60"
                        )}>
                            <Search className="w-3 h-3" /> Buscar Estudiante
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={seccionId === "TODAS" ? "TODOS LOS ESTUDIANTES" : "Escriba o seleccione un estudiante..."}
                                value={studentSearch}
                                onChange={(e) => {
                                    setStudentSearch(e.target.value);
                                    setEstudianteId(""); // Reset strict ID upon typing
                                    setIsDropdownOpen(true);
                                }}
                                onFocus={() => {
                                    if (estudianteId === "TODOS" && studentSearch === "TODOS LOS ESTUDIANTES") {
                                        setStudentSearch("");
                                    }
                                    setIsDropdownOpen(true);
                                }}
                                onBlur={() => {
                                    setTimeout(() => {
                                        setIsDropdownOpen(false);
                                        // Auto-fallback if they typed nothing
                                        if (studentSearch.trim() === "") {
                                            setEstudianteId("TODOS");
                                            setStudentSearch("TODOS LOS ESTUDIANTES");
                                        }
                                    }, 200);
                                }}
                                disabled={seccionId === "TODAS"}
                                className="w-full h-14 bg-card border-2 border-border/40 rounded-2xl px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed placeholder:font-bold placeholder:text-muted-foreground/50"
                            />

                            {/* Dropdown Options List */}
                            {isDropdownOpen && seccionId !== "TODAS" && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto p-2 min-w-full">
                                    <button
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setEstudianteId("TODOS");
                                            setStudentSearch("TODOS LOS ESTUDIANTES");
                                            setIsDropdownOpen(false);
                                        }}
                                        className={cn(
                                            "w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors mb-1",
                                            estudianteId === "TODOS" ? "bg-emerald-500/10 text-emerald-600" : "hover:bg-accent text-slate-600 dark:text-slate-400"
                                        )}
                                    >
                                        TODOS LOS ESTUDIANTES
                                    </button>

                                    {estudiantes.filter(e => e.nombre.toLowerCase().includes(studentSearch.toLowerCase())).length === 0 ? (
                                        <p className="px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">No se encontraron resultados</p>
                                    ) : (
                                        estudiantes.filter(e => e.nombre.toLowerCase().includes(studentSearch.toLowerCase())).map((e) => (
                                            <button
                                                key={e.id}
                                                onMouseDown={(evt) => {
                                                    evt.preventDefault();
                                                    setEstudianteId(e.id);
                                                    setStudentSearch(e.nombre);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase transition-colors mb-1 truncate",
                                                    estudianteId === e.id ? "bg-emerald-500/10 text-emerald-600" : "hover:bg-accent text-slate-700 dark:text-slate-300"
                                                )}
                                            >
                                                {e.nombre}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleExportAlumnos}
                        disabled={loading}
                        className="mt-auto w-full h-16 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-600/40 transition-all disabled:opacity-50 active:scale-95"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        Exportar a Excel
                    </button>
                </div>
            </div>

            {/* Info Card */}
            <div className="lg:col-span-2 premium-card p-8 rounded-[2.5rem] bg-amber-500/[0.03] border-amber-500/10 flex items-start gap-6">
                <div className="p-4 bg-amber-500/10 rounded-2xl">
                    <FileText className="w-6 h-6 text-amber-600" />
                </div>
                <div className="space-y-2">
                    <h4 className="font-bold uppercase tracking-tight text-amber-900">Nota sobre la exportación</h4>
                    <p className="text-sm text-amber-800/70 leading-relaxed">
                        Los reportes generados incluyen la columna de <strong>observaciones e incidencias</strong> registradas por docentes y coordinadores.
                        Asegúrese de que el rango de fechas seleccionado sea válido para obtener datos precisos.
                    </p>
                </div>
            </div>
        </div>
    );
}
