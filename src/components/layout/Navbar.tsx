"use client";

import { Bell, Search, User, LayoutGrid, X } from "lucide-react";
import { useState, useEffect } from "react";
import { menuItems } from "@/lib/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Image from "next/image";

export function Navbar({ session }: { session: any }) {
    const user = session?.user;
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const filteredItems = menuItems.filter(item => {
        if (item.adminOnly) return user?.rol === 'ADMINISTRADOR';
        if (item.adminOrCoord) return user?.rol === 'ADMINISTRADOR' || user?.rol === 'COORDINADOR';
        if (item.docenteOnly) return user?.rol === 'DOCENTE';
        return true;
    });

    return (
        <>
            <header className="h-16 border-b border-border/40 bg-background/60 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 shrink-0 relative z-40">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative max-w-md w-full group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                        <input
                            type="text"
                            placeholder="Buscar secciones, alumnos..."
                            className="w-full bg-accent/20 border border-transparent rounded-full py-1.5 pl-10 pr-4 text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:bg-accent/40 focus:border-primary/20 transition-all duration-500"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <button className="relative p-2 rounded-full hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground hidden sm:block">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                    </button>

                    <div className="h-8 w-[1px] bg-border/40 mx-1 md:mx-2" />

                    <div className="flex items-center gap-2 pl-2">
                        <span className="text-sm font-bold tracking-tight hidden sm:block">{user?.nombre}</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center text-white font-black text-[10px] shadow-lg shadow-primary/20">
                            {user?.nombre?.split(' ').slice(0, 2).map((n: string) => n[0]).join('') || 'U'}
                        </div>
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="p-2 ml-2 rounded-xl bg-accent/50 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all md:hidden"
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Mobile Full Menu Overly (Drawer) */}
            <div className={cn(
                "fixed inset-0 bg-background/80 backdrop-blur-md z-[100] transition-all duration-500 md:hidden",
                isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                <div className={cn(
                    "fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-card shadow-2xl border-l border-border/40 p-6 flex flex-col transition-transform duration-500 ease-out",
                    isMenuOpen ? "translate-x-0" : "translate-x-full"
                )}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10">
                                <Image
                                    src="/logoFYA.png"
                                    alt="Logo Fe y Alegría"
                                    fill
                                    className="object-contain"
                                    sizes="40px"
                                />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tighter leading-tight bg-gradient-to-br from-[#1a1a1a] to-[#e31b23] bg-clip-text text-transparent">Explorar</h2>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Todos los módulos</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-2 rounded-full hover:bg-accent transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                        {mounted && filteredItems.map((item) => {
                            const Icon = item.icon;
                            // Normalize paths for comparison (remove trailing slashes)
                            const normalizedPath = pathname?.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
                            const isActive = normalizedPath === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    suppressHydrationWarning
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group",
                                        isActive
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                        isActive ? "bg-white/20" : "bg-accent/50 group-hover:bg-primary/10 group-hover:text-primary"
                                    )}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-sm tracking-tight uppercase">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-8 pt-6 border-t border-border/40">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                {user?.nombre?.[0]}
                            </div>
                            <div>
                                <p className="font-bold text-sm tracking-tight">{user?.nombre}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{user?.rol}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
