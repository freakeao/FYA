import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentListProps {
    estudiantes: any[];
    inasistencias: Record<string, string>;
    onToggle: (id: string) => void;
    onUpdateNota: (id: string, nota: string) => void;
    loading: boolean;
    onSubmit: () => void;
    claseActual: any;
}

export function StudentList({
    estudiantes,
    inasistencias,
    onToggle,
    onUpdateNota,
    loading,
    onSubmit,
    claseActual
}: StudentListProps) {
    const inasistentesIds = Object.keys(inasistencias);

    return (
        <div className="premium-card p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] sticky top-8 flex flex-col max-h-[calc(100vh-8rem)]">
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
                <div className="bg-destructive/10 text-destructive text-lg md:text-xl font-black w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all duration-500">
                    {inasistentesIds.length}
                </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2 mb-6 custom-scrollbar">
                {estudiantes.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-8">
                        {claseActual ? "Cargando alumnos..." : "No hay clase activa"}
                    </p>
                ) : (
                    estudiantes.map(alumno => {
                        const isAbsent = inasistencias[alumno.id] !== undefined;
                        return (
                            <div key={alumno.id} className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                <button
                                    onClick={() => onToggle(alumno.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 md:p-4 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden group active:scale-[0.98]",
                                        isAbsent
                                            ? "bg-destructive/[0.05] border-destructive/30 text-destructive shadow-sm"
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
                                    {isAbsent ? (
                                        <AlertCircle className="w-5 h-5 relative z-10 animate-in zoom-in" />
                                    ) : (
                                        <CheckCircle2 className="w-5 h-5 opacity-0 group-hover:opacity-40 relative z-10 transition-opacity" />
                                    )}
                                </button>

                                {isAbsent && (
                                    <div className="px-2 animate-in slide-in-from-top-2 duration-300">
                                        <input
                                            type="text"
                                            placeholder="Agregar nota (ej. Permiso, Médico...)"
                                            value={inasistencias[alumno.id] || ""}
                                            onChange={(e) => onUpdateNota(alumno.id, e.target.value)}
                                            className="w-full bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-2 text-xs font-medium placeholder:text-destructive/40 focus:outline-none focus:ring-2 focus:ring-destructive/20 text-destructive transition-all"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })
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
                {loading ? "Registrando..." : (claseActual?.estado === "Completado" ? "Actualizar Registro" : "Finalizar Registro")}
            </button>
        </div>
    );
}
