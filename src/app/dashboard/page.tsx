import Link from "next/link";
import {
    Users,
    UserCheck,
    UserMinus,
    GraduationCap,
    ArrowUpRight,
    TrendingUp,
    ClipboardCheck
} from "lucide-react";

import { getDashboardData } from "@/lib/actions";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ClassCarousel } from "@/components/dashboard/ClassCarousel";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";

const Icon = GraduationCap;

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const session = await getSession();

    // Redirect handled by middleware, but safety first for SSR
    if (!session) return null;

    const data = await getDashboardData();
    const userRole = session.user?.rol;

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

            <DashboardStatsGrid data={data} userRole={userRole} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Section for Teachers: Their classes (HIDDEN FOR ADMIN COORD) */}
                {data.viewType !== "ADMINISTRATIVE" && (
                    <div className={cn(
                        "premium-card p-6 rounded-[2rem] flex flex-col h-[380px]",
                        userRole === "DOCENTE" ? "col-span-4" : "col-span-4"
                    )}>
                        <div className="flex items-center justify-between mb-4">
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

                        <div className="space-y-4 flex-1 overflow-hidden">
                            <ClassCarousel classes={data.clasesHoy || []} />
                        </div>
                    </div>
                )}

                {/* Section for Admin/Coord: Teacher absences (OR ALL STAFF ABSENCES FOR ADMIN COORD) */}
                <div className={cn(
                    "premium-card p-6 rounded-[2rem] flex flex-col h-[380px]",
                    data.viewType === "ADMINISTRATIVE" ? "col-span-7" : "col-span-3"
                )}>
                    <div className="flex items-center justify-between mb-4">
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
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                            {data.viewType === "ADMINISTRATIVE" ? "Personal Operativo" : "Docente de Aula"}
                                        </p>
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
                            suppressHydrationWarning
                            className={cn(
                                "w-full mt-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center text-muted-foreground hover:text-primary transition-all border-t border-border/40"
                            )}
                        >
                            Pasar Asistencia Personal
                        </Link>
                    )}
                </div>
            </div>
        </div >
    );
}



