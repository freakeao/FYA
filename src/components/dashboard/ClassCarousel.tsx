"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { GraduationCap, ArrowUpRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn, formatTime12h } from "@/lib/utils";

interface ClassCarouselProps {
    classes: any[];
}

export function ClassCarousel({ classes }: ClassCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Show 1 item at once
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

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    };

    const formatRangeTime = (range: string) => {
        if (!range) return "";
        // range is "HH:mm:ss - HH:mm:ss"
        const parts = range.split(' - ');
        if (parts.length !== 2) return range;
        return `${formatTime12h(parts[0])} - ${formatTime12h(parts[1])}`;
    };

    if (totalItems === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border/40 rounded-3xl">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    No hay actividad de clases para hoy
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div
                className="relative group flex-1 flex flex-col"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className="flex-1 overflow-hidden relative">
                    <div
                        className="flex transition-transform duration-700 ease-in-out h-full"
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
                                    className="flex flex-col justify-between h-full p-4 rounded-2xl border border-border/40 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group/item bg-card/50"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                <GraduationCap className="w-5 h-5 text-primary" />
                                            </div>
                                            <span className={cn(
                                                "text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest",
                                                clase.estado === "Completado" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                            )}>
                                                {clase.estado}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-tighter opacity-70">
                                                {clase.grado} "{clase.seccion}"
                                            </p>
                                            <h4 className="text-lg font-bold uppercase tracking-tight line-clamp-2 group-hover/item:text-primary transition-colors mt-1">
                                                {clase.materia}
                                            </h4>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                                                Prof: {clase.docente}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/20">
                                        <div className="flex flex-col">
                                            <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Bloque Horario</p>
                                            <p className="text-[10px] font-bold uppercase text-foreground mt-0.5">{formatRangeTime(clase.hora)}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-border/40 flex items-center justify-center group-hover/item:bg-primary group-hover/item:border-primary transition-all">
                                            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover/item:text-white transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {totalItems > itemsToShow && (
                    <div className="flex items-center justify-between mt-3 px-1">
                        <div className="flex gap-1.5">
                            {classes.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIndex(i)}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-300",
                                        currentIndex === i ? "w-6 bg-primary" : "w-1.5 bg-primary/20 hover:bg-primary/40"
                                    )}
                                />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrev}
                                className="p-1.5 rounded-xl border border-border/40 hover:bg-accent transition-colors bg-card"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="p-1.5 rounded-xl border border-border/40 hover:bg-accent transition-colors bg-card"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
