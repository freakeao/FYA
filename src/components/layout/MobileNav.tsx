"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    ClipboardCheck,
    ShieldCheck,
    BarChart3,
    LogOut
} from "lucide-react";
import { logoutUser } from "@/lib/actions";

export function MobileNav({ session }: { session: any }) {
    const pathname = usePathname();
    const user = session?.user;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const navItems = [
        { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
        { name: "Alumnos", href: "/dashboard/asistencia", icon: ClipboardCheck },
        {
            name: "Docentes",
            href: "/dashboard/asistencia/personal",
            icon: ShieldCheck,
            adminOrCoord: true
        },
        { name: "Reportes", href: "/dashboard/reportes", icon: BarChart3 },
    ];

    const filteredItems = navItems.filter(item => {
        if (item.adminOrCoord) return user?.rol === 'ADMINISTRADOR' || user?.rol === 'COORDINADOR';
        return true;
    });

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/40 px-2 py-2 flex items-center justify-around z-50 shadow-[0_-4px_20px_-1px_rgba(0,0,0,0.1)]">
            {filteredItems.map((item) => {
                const Icon = item.icon;
                // Normalize paths for comparison (remove trailing slashes)
                const normalizedPath = pathname?.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
                const isActive = normalizedPath === item.href;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        suppressHydrationWarning
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 transition-all duration-300 relative min-w-[64px]",
                            isActive ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <div className={cn(
                            "p-1 rounded-xl transition-all duration-500",
                            isActive ? "bg-primary/10 scale-110" : ""
                        )}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-tighter text-center whitespace-nowrap">
                            {item.name}
                        </span>
                        {isActive && (
                            <div className="absolute -top-2 w-1 h-1 bg-primary rounded-full animate-bounce" />
                        )}
                    </Link>
                );
            })}

            {/* Logout Option */}
            <button
                onClick={() => logoutUser()}
                className="flex flex-col items-center gap-1 p-2 text-destructive/80 active:scale-95 transition-all min-w-[64px]"
            >
                <div className="p-1">
                    <LogOut className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-tighter">
                    Salir
                </span>
            </button>
        </nav>
    );
}
