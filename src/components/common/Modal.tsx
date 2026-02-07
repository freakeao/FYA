"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    maxWidth = "md"
}: ModalProps) {
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

    const maxWidthClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl"
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className={cn(
                "relative w-full bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 animate-in zoom-in-95 fade-in duration-300 my-auto",
                maxWidthClasses[maxWidth]
            )}>
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-xl hover:bg-accent text-muted-foreground transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-muted-foreground text-xs font-medium leading-relaxed uppercase tracking-wider">
                                {description}
                            </p>
                        )}
                    </div>

                    <div className="relative">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
