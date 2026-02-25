"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    UserCheck,
    UserMinus,
    ClipboardCheck,
    TrendingUp,
    Search,
    Clock,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/common/Modal";

interface DashboardStatsGridProps {
    data: any;
    userRole?: string;
}

export function DashboardStatsGrid({ data, userRole }: DashboardStatsGridProps) {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [detailModal, setDetailModal] = useState<{
        type: "ausentes" | "pendientes" | null;
        title: string;
        description: string;
    }>({ type: null, title: "", description: "" });

    const stats = data.stats;
    const viewType = data.viewType;

    // Automatic Update: Poll every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setIsRefreshing(true);
            router.refresh();
            setTimeout(() => setIsRefreshing(false), 2000);
        }, 60000);
        return () => clearInterval(interval);
    }, [router]);

    const handleCardClick = (type: "ausentes" | "pendientes") => {
        if (type === "ausentes") {
            setDetailModal({
                type: "ausentes",
                title: "Detalle de Inasistencias Alumnos",
                description: "Listado de estudiantes ausentes reportados el día de hoy."
            });
        } else if (type === "pendientes") {
            if (userRole === "DOCENTE") return; // Security check

            setDetailModal({
                type: "pendientes",
                title: "Docentes con Reportes Pendientes",
                description: "Listado de docentes que tienen clases hoy pero aún no han registrado asistencia."
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title={stats.matricula.label || "Total Alumnos"}
                    value={stats.matricula.total.toString()}
                    description={viewType === "ADMINISTRATIVE" ? "Personal registrado" : "Matrícula activa"}
                    icon={Users}
                    color="primary"
                    breakdown={viewType !== "ADMINISTRATIVE" ? `👨 V: ${stats.matricula.hombres}  |  👩 H: ${stats.matricula.mujeres}` : undefined}
                />
                <StatsCard
                    title={stats.asistenciaHoy.label || "Asistencia Hoy"}
                    value={stats.asistenciaHoy.porcentaje}
                    description={`${stats.asistenciaHoy.presentes} presentes de ${stats.asistenciaHoy.presentes + stats.asistenciaHoy.ausentes} reportados`}
                    icon={UserCheck}
                    color="secondary"
                    breakdown={viewType !== "ADMINISTRATIVE" ? `👨 V: ${stats.asistenciaHoy.presentesHombres}  |  👩 H: ${stats.asistenciaHoy.presentesMujeres}` : undefined}
                />
                <StatsCard
                    title="Inasistencias"
                    value={stats.asistenciaHoy.ausentes.toString()}
                    description={viewType === "ADMINISTRATIVE" ? "Personal ausente" : "Alumnos ausentes"}
                    icon={UserMinus}
                    color="primary"
                    clickable={viewType !== "ADMINISTRATIVE"}
                    onClick={() => handleCardClick("ausentes")}
                    breakdown={viewType !== "ADMINISTRATIVE" ? `👨 V: ${stats.asistenciaHoy.ausentesHombres}  |  👩 H: ${stats.asistenciaHoy.ausentesMujeres}` : undefined}
                />
                {viewType !== "ADMINISTRATIVE" && (
                    <StatsCard
                        title="Sin Reporte"
                        value={stats.reporteDocentes.estudiantesSinReporte?.toString() || "0"}
                        description="Alumnos por reportar"
                        icon={ClipboardCheck}
                        color="secondary"
                        clickable={userRole !== "DOCENTE"}
                        onClick={() => handleCardClick("pendientes")}
                        breakdown={userRole !== "DOCENTE" ? `⚠ Docentes pendientes: ${stats.reporteDocentes.docentesSinReporte}` : undefined}
                    />
                )}
                {viewType === "ADMINISTRATIVE" && (
                    <StatsCard
                        title="Reportes"
                        value="Activo"
                        description="Monitor de jornada"
                        icon={ClipboardCheck}
                        color="secondary"
                    />
                )}
            </div>

            {/* Detail Modals */}
            <Modal
                isOpen={detailModal.type !== null}
                onClose={() => setDetailModal({ type: null, title: "", description: "" })}
                title={detailModal.title}
                description={detailModal.description}
                maxWidth="lg"
            >
                {detailModal.type === "ausentes" && (
                    <div className="space-y-4">
                        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {data.listaAusentesAlumnos?.length > 0 ? (
                                <div className="grid gap-2">
                                    {data.listaAusentesAlumnos.map((est: any) => (
                                        <div key={est.id} className="flex items-center justify-between p-4 rounded-2xl bg-accent/30 border border-border/40">
                                            <div>
                                                <p className="font-bold text-sm uppercase tracking-tight">{est.nombre}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{est.seccion}</p>
                                            </div>
                                            <div className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-[8px] font-black uppercase tracking-widest border border-destructive/20">
                                                Ausente
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <UserCheck className="w-12 h-12 text-emerald-500/30 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No se reportan inasistencias hoy</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {detailModal.type === "pendientes" && (
                    <div className="space-y-4">
                        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {data.listaDocentesPendientes?.length > 0 ? (
                                <div className="grid gap-3">
                                    {data.listaDocentesPendientes.map((p: any) => (
                                        <div key={p.id} className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-sm uppercase tracking-tight text-primary">{p.materia}</p>
                                                    <p className="text-[10px] font-bold text-foreground uppercase tracking-wider">{p.docente}</p>
                                                </div>
                                                <div className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-500/20">
                                                    Pendiente
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 border-t border-border/20 pt-2">
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest">{p.seccion}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest">{p.hora}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <ClipboardCheck className="w-12 h-12 text-emerald-500/30 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Todos los reportes están completos</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Floating Sync Indicator */}
            <div className="fixed bottom-6 right-6 z-50">
                <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 shadow-xl shadow-emerald-500/10 transition-all duration-1000",
                    isRefreshing ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-4 pointer-events-none"
                )}>
                    <RefreshCw className={cn("w-3.5 h-3.5 text-emerald-600", isRefreshing && "animate-spin")} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Sincronizado</span>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, description, icon: Icon, trend, trendNegative, color = "primary", breakdown, clickable, onClick }: any) {
    const isPrimary = color === "primary";

    return (
        <div
            onClick={clickable ? onClick : undefined}
            className={cn(
                "premium-card p-6 rounded-3xl relative overflow-hidden group border-t-4 transition-all",
                isPrimary ? "border-t-primary" : "border-t-secondary",
                clickable && "cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-primary/5 border-border/60 hover:border-primary/40"
            )}
        >
            <div className="absolute inset-0 opacity-[0.4] pointer-events-none bg-gradient-to-br from-white/40 to-slate-100/40 dark:from-slate-900/40 dark:to-slate-800/40" />
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 opacity-5 bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={cn(
                    "p-3 rounded-2xl transition-colors border",
                    isPrimary
                        ? "bg-white border-primary/20 text-primary shadow-sm"
                        : "bg-white border-orange-200 text-orange-600 shadow-sm"
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                {clickable && (
                    <div className="p-1.5 rounded-lg bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <Search className="w-3.5 h-3.5" />
                    </div>
                )}
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-[10px] font-black py-1.5 px-2.5 rounded-full uppercase tracking-wider",
                        trendNegative ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600"
                    )}>
                        <TrendingUp className={cn("w-3 h-3", trendNegative && "rotate-180")} />
                        {trend}
                    </div>
                )}
            </div>
            <div className="space-y-1 relative z-10">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px]">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className={cn(
                        "text-4xl font-black tracking-tighter",
                        isPrimary ? "text-foreground" : "text-foreground"
                    )}>{value}</p>
                </div>
                <p className="text-xs text-muted-foreground font-medium">{description}</p>
                {breakdown && (
                    <p className="text-xs font-black text-foreground/70 uppercase tracking-wider mt-3 pt-3 border-t border-border/40">
                        {breakdown}
                    </p>
                )}
            </div>
        </div>
    );
}
