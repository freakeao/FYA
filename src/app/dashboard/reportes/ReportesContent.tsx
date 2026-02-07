"use client";

import { useState } from "react";
import { Download, Calendar, Users, Briefcase, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAsistenciaPersonalReport, getAsistenciaAlumnosReport } from "@/lib/actions";
import { exportToExcel } from "@/lib/excel";
import { toast } from "sonner";

interface ReportesContentProps {
    userRole: string;
}

export function ReportesContent({ userRole }: ReportesContentProps) {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [loading, setLoading] = useState(false);

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
        setLoading(true);
        try {
            const data = await getAsistenciaAlumnosReport(startDate, endDate);
            if (data.length === 0) {
                toast.error("No se encontraron inasistencias de alumnos en este rango.");
            } else {
                exportToExcel(data, `Inasistencias_Alumnos_${startDate}_a_${endDate}`, "Alumnos");
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
