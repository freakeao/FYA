"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassCarouselProps {
    classes: any[];
}

export function ClassCarousel({ classes }: ClassCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Show 2 items at once if possible
    const itemsToShow = 2;
    const totalItems = classes.length;
    const maxIndex = Math.max(0, totalItems - itemsToShow);

    useEffect(() => {
        if (isPaused || totalItems <= itemsToShow) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }, 5000);

        return () => clearInterval(interval);
    }, [isPaused, totalItems, maxIndex]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    };

    if (totalItems === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border/40 rounded-3xl">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No hay actividad de clases para hoy</p>
            </div>
        );
    }

    return (
        <div
            className="relative group h-full flex flex-col"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="flex-1 overflow-hidden relative">
                <div
                    className="flex gap-4 transition-transform duration-700 ease-in-out h-full"
                    style={{
                        transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
                        width: `${(totalItems / itemsToShow) * 100}%`
                    }}
                >
                    {classes.map((clase) => (
                        <div
                            key={clase.id}
                            style={{ width: `${100 / totalItems}%` }}
                            className="h-full"
                        >
                            <Link
                                href={`/dashboard/asistencia`}
                                className="flex flex-col justify-between h-full p-5 rounded-2xl border border-border/40 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group/item bg-card/50"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                                            <GraduationCap className="w-5 h-5 text-primary" />
                                        </div>
                                        <span className={cn(
                                            "text-[7px] font-black px-2 py-1 rounded-full uppercase tracking-widest",
                                            clase.estado === "Completado" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                        )}>
                                            {clase.estado}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-tighter opacity-70">
                                            {clase.grado} "{clase.seccion}"
                                        </p>
                                        <h4 className="text-sm font-bold uppercase tracking-tight line-clamp-1 group-hover/item:text-primary transition-colors">
                                            {clase.materia}
                                        </h4>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5 line-clamp-1">
                                            {clase.docente}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
                                    <div className="flex flex-col">
                                        <p className="text-[7px] font-black text-muted-foreground uppercase">Horario</p>
                                        <p className="text-[9px] font-bold uppercase">{clase.hora}</p>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {totalItems > itemsToShow && (
                <div className="flex items-center justify-between mt-6">
                    <div className="flex gap-1">
                        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1 rounded-full transition-all duration-300",
                                    currentIndex === i ? "w-4 bg-primary" : "w-1 bg-primary/20"
                                )}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrev}
                            className="p-1.5 rounded-lg border border-border/40 hover:bg-accent transition-colors"
                        >
                            <ChevronLeft className="w-3 h-3" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="p-1.5 rounded-lg border border-border/40 hover:bg-accent transition-colors"
                        >
                            <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
