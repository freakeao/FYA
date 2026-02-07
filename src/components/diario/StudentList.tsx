import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentListProps {
    estudiantes: any[];
    inasistentes: string[];
    onToggle: (id: string) => void;
    loading: boolean;
    onSubmit: () => void;
    claseActual: any;
}

export function StudentList({
    estudiantes,
    inasistentes,
    onToggle,
    loading,
    onSubmit,
    claseActual
}: StudentListProps) {
    return (
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
                            onClick={() => onToggle(alumno.id)}
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
                onClick={onSubmit}
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
    );
}
