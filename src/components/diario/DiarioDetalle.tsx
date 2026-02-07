"use client";

import {
    Clock,
    BookOpen,
    MessageSquare,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DiarioDetalleProps {
    clase?: any;
    tema?: string;
    setTema?: (value: string) => void;
    incidencias?: string;
    setIncidencias?: (value: string) => void;
}

export function DiarioDetalle({ clase, tema, setTema, incidencias, setIncidencias }: DiarioDetalleProps) {
    return (
        <div className="premium-card rounded-[2rem] overflow-hidden">
            <div className="p-8 border-b border-border/40 bg-accent/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-primary" />
                            Detalle de la Clase
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">Registre el tema desarrollado y las incidencias.</p>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Hora de Clase
                        </label>
                        <input
                            type="text"
                            placeholder="7:00 - 8:20"
                            value={clase ? clase.timeString : undefined}
                            readOnly={!!clase}
                            className={cn(
                                "h-14 w-full bg-accent/30 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 text-sm font-bold outline-none transition-all",
                                clase && "opacity-70 cursor-not-allowed bg-accent/10"
                            )}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Área / Materia
                        </label>
                        <input
                            type="text"
                            placeholder="Ej: Matemáticas"
                            value={clase ? clase.materia : undefined}
                            readOnly={!!clase}
                            className={cn(
                                "h-14 w-full bg-accent/30 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 text-sm font-bold outline-none transition-all",
                                clase && "opacity-70 cursor-not-allowed bg-accent/10"
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Temática Tratada
                    </label>
                    <textarea
                        placeholder="Descripción breve de lo visto hoy..."
                        rows={3}
                        value={tema}
                        onChange={(e) => setTema && setTema(e.target.value)}
                        className="w-full bg-accent/30 border-2 border-transparent focus:border-primary/20 rounded-3xl py-4 px-6 text-sm font-medium outline-none transition-all resize-none"
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Incidencias / Observaciones
                    </label>
                    <textarea
                        placeholder="Novedades o casos especiales..."
                        rows={2}
                        value={incidencias}
                        onChange={(e) => setIncidencias && setIncidencias(e.target.value)}
                        className="w-full bg-accent/30 border-2 border-transparent focus:border-primary/20 rounded-3xl py-4 px-6 text-sm font-medium outline-none transition-all resize-none"
                    />
                </div>
            </div>
        </div>
    );
}
