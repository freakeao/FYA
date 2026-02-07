import Link from "next/link";
import {
    Users,
    UserCheck,
    UserMinus,
    GraduationCap,
    ArrowUpRight,
    TrendingUp
} from "lucide-react";

import { getDashboardData } from "@/lib/actions";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
    const [session, data] = await Promise.all([
        getSession(),
        getDashboardData()
    ]);
    const userRole = session?.user?.rol;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative overflow-hidden">
            {/* Signature Flow: Subtle Gray/slate glow instead of pink */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-slate-200/50 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 -left-24 w-64 h-64 bg-gray-200/50 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10">
                <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Vista General</h2>
                <div className="flex items-center gap-3 mt-3">
                    <div className="h-[1px] w-12 bg-primary/30" />
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
                        Bienvenido, <span className="text-primary">{session?.user?.nombre}</span> • Resumen Operativo
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Alumnos"
                    value={data.stats.totalEstudiantes.toString()}
                    description="Matrícula activa"
                    icon={Users}
                    color="primary" // Red
                />
                <StatsCard
                    title="Asistencia Hoy"
                    value={data.stats.asistenciaPorcentaje}
                    description="Alumnos en aula"
                    icon={UserCheck}
                    trend={data.stats.asistenciaPorcentaje !== "100%" ? "- " + data.stats.inasistenciasAlumnos : ""}
                    trendNegative
                    color="secondary" // Peach
                />
                <StatsCard
                    title="Inasistencias"
                    value={data.stats.inasistenciasAlumnos.toString()}
                    description="Alumnos ausentes"
                    icon={UserMinus}
                    trendNegative={data.stats.inasistenciasAlumnos > 0}
                    color="primary"
                />
                <StatsCard
                    title="Docentes"
                    value={data.stats.totalDocentes.toString()}
                    description={data.stats.inasistenciasPersonal > 0 ? `${data.stats.inasistenciasPersonal} ausentes hoy` : "Todos presentes"}
                    icon={GraduationCap}
                    color="secondary"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Section for Teachers: Their classes */}
                <div className={cn(
                    "premium-card p-8 rounded-[2rem] flex flex-col",
                    userRole === "DOCENTE" ? "col-span-4" : "col-span-4"
                )}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-xl uppercase tracking-tighter">
                                {userRole === "DOCENTE" ? "Mis Clases de Hoy" : "Actividad de Clases"}
                            </h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                {userRole === "DOCENTE" ? "Horario y estado de asistencia" : "Resumen de bloques horarios"}
                            </p>
                        </div>
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                    </div>

                    <div className="space-y-4 flex-1">
                        {userRole === "DOCENTE" ? (
                            data.misClases.length > 0 ? (
                                data.misClases.map((clase: any) => (
                                    <Link
                                        key={clase.id}
                                        href={`/dashboard/asistencia`}
                                        className="flex items-center justify-between p-4 rounded-2xl border border-border/40 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-accent flex flex-col items-center justify-center">
                                                <Icon className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold uppercase tracking-tight">{clase.seccion}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{clase.materia} • {clase.hora}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest",
                                                clase.estado === "Completado" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                            )}>
                                                {clase.estado}
                                            </span>
                                            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border/40 rounded-3xl">
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No tienes clases programadas para hoy</p>
                                </div>
                            )
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border/40 rounded-3xl">
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Resumen de bloques en desarrollo</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section for Admin/Coord: Teacher absences */}
                <div className="col-span-3 premium-card p-8 rounded-[2rem] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-xl uppercase tracking-tighter">Inasistencias Personal</h3>
                        <div className="px-2 py-1 bg-destructive/10 text-destructive rounded-lg text-[8px] font-black uppercase tracking-widest">HOY</div>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {data.docentesAusentes.length > 0 ? (
                            data.docentesAusentes.map((docente: any) => (
                                <div key={docente.id} className="flex items-center gap-4 p-4 rounded-2xl bg-destructive/[0.02] hover:bg-destructive/[0.05] transition-colors border border-destructive/10 group">
                                    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center font-black text-xs text-destructive">
                                        {docente.nombre.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold uppercase tracking-tight">{docente.nombre}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Docente de Aula</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[8px] font-black py-1.5 px-3 bg-destructive/20 text-destructive rounded-full uppercase tracking-widest">Ausente</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                    <UserCheck className="w-6 h-6 text-emerald-600" />
                                </div>
                                <p className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest">Asistencia completa hoy</p>
                            </div>
                        )}
                    </div>

                    {(userRole === "ADMINISTRADOR" || userRole === "COORDINADOR") && (
                        <Link
                            href="/dashboard/asistencia/personal"
                            className="w-full mt-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center text-muted-foreground hover:text-primary transition-all border-t border-border/40"
                        >
                            Pasar Asistencia Personal
                        </Link>
                    )}
                </div>
            </div>
        </div >
    );
}

const Icon = GraduationCap;

function StatsCard({ title, value, description, icon: Icon, trend, trendNegative, color = "primary" }: any) {
    const isPrimary = color === "primary";

    return (
        <div className={cn(
            "premium-card p-6 rounded-3xl relative overflow-hidden group border-t-4",
            isPrimary ? "border-t-primary" : "border-t-secondary"
        )}>
            {/* Background Gradient - SUBTLE GRAY/WHITE */}
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
                <p className={cn(
                    "text-4xl font-black tracking-tighter",
                    isPrimary ? "text-foreground" : "text-foreground"
                )}>{value}</p>
                <p className="text-xs text-muted-foreground font-medium">{description}</p>
            </div>
        </div>
    );
}

