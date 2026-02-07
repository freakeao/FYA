import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMisInasistencias } from "@/lib/actions";
import { UserX, Calendar, MessageSquare, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MisInasistenciasPage() {
    const session = await getSession();
    if (!session || session.user.rol !== "DOCENTE") {
        redirect("/dashboard");
    }

    const inasistencias = await getMisInasistencias();

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header>
                <div className="flex items-center gap-2 text-xs font-bold text-destructive uppercase tracking-widest mb-1">
                    <UserX className="w-4 h-4" />
                    Historial Personal
                </div>
                <h1 className="text-4xl font-black tracking-tighter uppercase">Mis Inasistencias</h1>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">
                    Registro detallado de ausencias reportadas por coordinación.
                </p>
            </header>

            <div className="grid gap-6">
                {inasistencias.length === 0 ? (
                    <div className="premium-card p-20 rounded-[3rem] bg-emerald-500/5 border-emerald-500/10 text-center space-y-4">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                            <ShieldCheck className="w-10 h-10 text-emerald-600" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-emerald-900">¡Excelente Asistencia!</h3>
                            <p className="text-xs font-bold text-emerald-700/60 uppercase tracking-widest">No tienes inasistencias registradas hasta la fecha.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {inasistencias.map((ina, idx) => (
                            <div key={idx} className="premium-card p-6 rounded-[2rem] border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-destructive">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-xs font-black uppercase tracking-widest">
                                            {new Date(ina.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="px-2 py-1 bg-destructive/10 text-destructive rounded-lg text-[8px] font-black uppercase">Ausente</div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-card rounded-2xl border border-border/40">
                                        <div className="flex items-start gap-3">
                                            <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground/60">Observaciones</p>
                                                <p className="text-xs font-medium italic">
                                                    {ina.observaciones || "Sin observaciones adicionales"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 px-1">
                                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                                            Reportado por: <span className="text-foreground">{ina.coordinador}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
