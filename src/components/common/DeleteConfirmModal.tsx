"use client";

import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
}

export function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description
}: DeleteConfirmModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-md bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 animate-in zoom-in-95 fade-in duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-xl hover:bg-accent text-muted-foreground transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-destructive/10 flex items-center justify-center animate-bounce-subtle">
                        <AlertTriangle className="w-10 h-10 text-destructive" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">
                            {title}
                        </h2>
                        <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                            {description}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full pt-4">
                        <button
                            onClick={onClose}
                            className="h-14 rounded-2xl border border-border bg-card text-foreground font-black text-[10px] uppercase tracking-widest hover:bg-accent transition-all active:scale-[0.98]"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="h-14 rounded-2xl bg-destructive text-destructive-foreground font-black text-[10px] uppercase tracking-widest hover:shadow-lg hover:shadow-destructive/20 transition-all active:scale-[0.98]"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-animation in globals.css or component-specific
// @keyframes bounce-subtle {
//   0%, 100% { transform: translateY(-5%); }
//   50% { transform: translateY(0); }
// }
