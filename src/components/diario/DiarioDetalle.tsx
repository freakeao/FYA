"use client";

import {
    Clock,
    BookOpen,
    MessageSquare,
    AlertCircle
} from "lucide-react";
import { cn, formatTime12h } from "@/lib/utils";

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
            <div className="p-6 md:p-8 border-b border-border/40 bg-accent/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg md:text-xl flex items-center gap-2">
                            <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                            Detalle de la Clase
                        </h3>
                        {clase?.estado === "Completado" ? (
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[8px] font-black uppercase tracking-widest border border-amber-500/20">
                                    Modo Edición
                                </span>
                                <p className="text-[10px] md:text-xs text-muted-foreground">Actualice el tema o las incidencias si es necesario.</p>
                            </div>
                        ) : (
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Registre el tema desarrollado.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8 space-y-6 md:space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Hora de Clase
                        </label>
                        <input
                            type="text"
                            placeholder="7:00 - 8:20"
                            value={clase ? `${formatTime12h(clase.horaInicio)} - ${formatTime12h(clase.horaFin)}` : undefined}
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

                {/* MEJORA VISUAL: Nombre de la Sesión */}
                <div className="space-y-4 group">
                    <label className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                        <MessageSquare className={cn("w-4 h-4 transition-colors", tema ? "text-primary" : "text-muted-foreground")} />
                        Nombre de la Sesión
                    </label>
                    <div className="relative">
                        <textarea
                            placeholder="¿Qué tema desarrollaste hoy?"
                            rows={3}
                            value={tema}
                            onChange={(e) => setTema && setTema(e.target.value)}
                            className="w-full bg-white border-2 border-slate-100 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 rounded-[1.5rem] py-4 px-6 text-sm font-medium transition-all shadow-sm focus:shadow-md outline-none resize-none placeholder:text-muted-foreground/50"
                        />
                        <p className="text-[10px] text-muted-foreground/60 mt-1.5 ml-4 flex items-center gap-1.5 italic">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                            Ej: Propiedades de la Materia, Análisis de Texto, Ecuaciones...
                        </p>
                    </div>
                </div>

                {/* MEJORA VISUAL: Incidencias */}
                <div className="space-y-4 group pt-2">
                    <label className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                        <AlertCircle className={cn("w-4 h-4 transition-colors", incidencias ? "text-orange-500" : "text-muted-foreground")} />
                        Incidencias / Observaciones
                    </label>
                    <div className="relative">
                        <textarea
                            placeholder="Novedades o casos especiales del grupo..."
                            rows={2}
                            value={incidencias}
                            onChange={(e) => setIncidencias && setIncidencias(e.target.value)}
                            className="w-full bg-white border-2 border-slate-100 focus:border-orange-500/40 focus:ring-4 focus:ring-orange-500/5 rounded-[1.5rem] py-4 px-6 text-sm font-medium transition-all shadow-sm focus:shadow-md outline-none resize-none placeholder:text-muted-foreground/50"
                        />
                        <p className="text-[10px] text-muted-foreground/60 mt-1.5 ml-4 flex items-center gap-1.5 italic">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500/30" />
                            Ej: Estudiante retirado con permiso, falta de material, conducta...
                        </p>
                    </div>
                </div>

                {/* PUNTO DE RESTAURACIÓN (CÓDIGO ORIGINAL COMENTADO)
                <div className="space-y-3">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Nombre de la Sesión
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
                */}
            </div>
        </div>
    );
}
