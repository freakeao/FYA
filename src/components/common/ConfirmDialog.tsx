"use client";

import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning" | "primary";
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    variant = "danger",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const colors = {
        danger: {
            icon: "bg-destructive/10 text-destructive",
            button: "bg-destructive text-white hover:bg-destructive/90 shadow-destructive/20",
            border: "border-destructive/20",
        },
        warning: {
            icon: "bg-amber-400/10 text-amber-600",
            button: "bg-amber-500 text-white hover:bg-amber-500/90 shadow-amber-500/20",
            border: "border-amber-400/20",
        },
        primary: {
            icon: "bg-primary/10 text-primary",
            button: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20",
            border: "border-primary/20",
        },
    }[variant];

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <div className={cn(
                "bg-card w-full max-w-sm rounded-[2rem] shadow-2xl border p-6 space-y-5 animate-in zoom-in-95 duration-200",
                colors.border
            )}>
                {/* Icon + Close */}
                <div className="flex items-start justify-between">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", colors.icon)}>
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-accent rounded-full transition-colors -mt-1 -mr-1"
                    >
                        <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>

                {/* Text */}
                <div className="space-y-1.5">
                    <h3 className="font-black text-lg uppercase tracking-tight leading-tight">{title}</h3>
                    {description && (
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{description}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                    <button
                        onClick={onCancel}
                        className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest bg-accent hover:bg-accent/80 transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={cn(
                            "flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95",
                            colors.button
                        )}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
