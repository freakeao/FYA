"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, ArrowUpRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn, formatTime12h } from "@/lib/utils";

interface ClassCarouselProps {
    classes: any[];
}

export function ClassCarousel({ classes }: ClassCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);

    // Show 1 item at once
    const itemsToShow = 1;
    const totalItems = classes.length;
    const maxIndex = Math.max(0, totalItems - itemsToShow);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        setProgress(0);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
        setProgress(0);
    };

    useEffect(() => {
        if (isPaused || totalItems <= itemsToShow) {
            setProgress(0);
            return;
        }

        const step = 20; // ms
        const totalTime = 5000; // ms
        const increment = (step / totalTime) * 100;

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + increment;
            });
        }, step);

        return () => clearInterval(interval);
    }, [isPaused, totalItems, maxIndex, currentIndex]);

    const formatRangeTime = (range: string) => {
        if (!range) return "";
        const parts = range.split(' - ');
        if (parts.length !== 2) return range;
        return `${formatTime12h(parts[0])} - ${formatTime12h(parts[1])}`;
    };

    if (totalItems === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border/40 rounded-3xl group">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Search className="w-5 h-5 text-muted-foreground/40" />
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    No hay actividad de clases para hoy
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full group/carousel">
            <div
                className="relative flex-1 flex flex-col"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Progress Bar (Compact) */}
                {totalItems > itemsToShow && !isPaused && (
                    <div className="absolute top-0 left-4 right-4 h-0.5 bg-primary/5 rounded-full overflow-hidden z-20">
                        <div
                            className="h-full bg-primary transition-all duration-[20ms] ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                <div className="flex-1 overflow-hidden relative">
                    {/* Floating Navigation (Premium) */}
                    {totalItems > itemsToShow && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="absolute left-1 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-border/10 text-primary opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-110 duration-300"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-1 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-border/10 text-primary opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-110 duration-300"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </>
                    )}

                    <div
                        className="flex transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) h-full"
                        style={{
                            transform: `translateX(-${currentIndex * (100 / totalItems)}%)`,
                            width: `${totalItems * 100}%`
                        }}
                    >
                        {classes.map((clase) => (
                            <div
                                key={clase.id}
                                style={{ width: `${100 / totalItems}%` }}
                                className="h-full px-1"
                            >
                                <Link
                                    href={`/dashboard/asistencia`}
                                    suppressHydrationWarning
                                    className="flex flex-col justify-between h-full px-6 py-5 rounded-[2rem] border border-slate-100 hover:border-primary/20 hover:bg-slate-50/50 transition-all group/item bg-white shadow-sm hover:shadow-xl hover:shadow-primary/5"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                                <GraduationCap className="w-4.5 h-4.5 text-primary" />
                                            </div>
                                            <span className={cn(
                                                "text-[8px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest",
                                                clase.estado === "Completado"
                                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10"
                                                    : "bg-amber-500/10 text-amber-600 border-amber-500/10"
                                            )}>
                                                {clase.estado}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">
                                                {clase.seccion}
                                            </p>
                                            <h4 className="text-lg font-black tracking-tight line-clamp-2 leading-tight text-slate-900 group-hover/item:text-primary transition-colors">
                                                {clase.materia}
                                            </h4>
                                            <div className="flex items-center gap-1.5 pt-0.5">
                                                <div className="w-1 h-1 rounded-full bg-primary/20" />
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    PROF: <span className="text-slate-900 font-bold">{clase.docente}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Bloque Horario</p>
                                            <p className="text-[11px] font-black text-slate-950 tabular-nums">{formatRangeTime(clase.hora)}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover/item:bg-primary group-hover/item:border-primary transition-all">
                                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover/item:text-white transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {totalItems > itemsToShow && (
                    <div className="flex items-center justify-between mt-3 px-4">
                        <div className="flex gap-1.5">
                            {classes.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setCurrentIndex(i);
                                        setProgress(0);
                                    }}
                                    className={cn(
                                        "h-1 rounded-full transition-all duration-500",
                                        currentIndex === i ? "w-6 bg-primary" : "w-1 bg-slate-200 hover:bg-slate-300"
                                    )}
                                />
                            ))}
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {currentIndex + 1} / {totalItems}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* PUNTO DE RESTAURACIÓN (CÓDIGO ORIGINAL COMENTADO ABAJO SI ES NECESARIO)
export function ClassCarousel({ classes }: ClassCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const itemsToShow = 1;
    const totalItems = classes.length;
    const maxIndex = Math.max(0, totalItems - itemsToShow);

    useEffect(() => {
        if (isPaused || totalItems <= itemsToShow) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [isPaused, totalItems, maxIndex]);

    const handlePrev = () => setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    const handleNext = () => setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));

    if (totalItems === 0) return null;

    return (
        <div className="flex flex-col h-full">
            ... original structure ...
        </div>
    );
}
*/
