"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Settings, LogOut } from "lucide-react";
import Image from "next/image";
import { logoutUser } from "@/lib/actions";
import { menuItems } from "@/lib/navigation";

export function Sidebar({ session }: { session: any }) {
    const pathname = usePathname();
    const user = session?.user;


    const filteredItems = menuItems.filter(item => {
        if (item.adminOnly) return user?.rol === 'ADMINISTRADOR';
        if (item.adminOrCoord) return user?.rol === 'ADMINISTRADOR' || user?.rol === 'COORDINADOR';
        if (item.docenteOnly) return user?.rol === 'DOCENTE';
        return true;
    });

    return (
        <aside className="hidden md:flex w-64 border-r border-border/40 h-screen bg-card/50 backdrop-blur-xl flex-col relative overflow-hidden shrink-0">
            {/* Ambient Light */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

            <div className="p-4">
                <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 drop-shadow-sm transition-transform hover:scale-110">
                        <Image
                            src="/logoFYA.png"
                            alt="Logo Fe y Alegría"
                            fill
                            className="object-contain"
                            priority
                            sizes="(max-width: 768px) 48px, 48px"
                        />
                    </div>
                    <h1 className="text-xl font-black tracking-tighter bg-gradient-to-br from-[#1a1a1a] to-[#e31b23] bg-clip-text text-transparent uppercase">
                        Asistencia
                    </h1>
                </div>
            </div>

            <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar scrollbar-hide py-2">
                {filteredItems.map((item) => {
                    const Icon = item.icon;
                    // Normalize paths for comparison (remove trailing slashes)
                    const normalizedPath = pathname?.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
                    const isActive = normalizedPath === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            suppressHydrationWarning
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative",
                                isActive
                                    ? "bg-primary text-white shadow-md shadow-primary/20 translate-x-1"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent hover:pl-4"
                            )}
                        >
                            <Icon className={cn(
                                "w-4 h-4 transition-transform duration-300",
                                isActive ? "scale-110" : "group-hover:scale-110 group-hover:text-primary"
                            )} />
                            <span className={cn(
                                "text-xs font-black uppercase tracking-widest transition-all",
                                isActive ? "opacity-100" : "opacity-90 group-hover:opacity-100"
                            )}>{item.name}</span>

                            {isActive && (
                                <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 mt-auto border-t border-border/40 space-y-2">


                <div className="space-y-1">
                    <button className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all group">
                        <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Ajustes</span>
                    </button>
                    <button
                        onClick={() => logoutUser()}
                        className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-all group"
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
