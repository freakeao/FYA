"use client";

import { Bell, Search, User } from "lucide-react";

export function Navbar({ session }: { session: any }) {
    const user = session?.user;

    return (
        <header className="h-16 border-b border-border/40 bg-background/60 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
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

            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                </button>

                <div className="h-8 w-[1px] bg-border/40 mx-2" />

                <button className="flex items-center gap-3 p-1.5 rounded-full hover:bg-accent/50 transition-all pr-4 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center text-white font-black text-[10px] shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                        {user?.nombre?.split(' ').slice(0, 2).map((n: string) => n[0]).join('') || 'U'}
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                        <span className="text-sm font-medium">{user?.nombre}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{user?.rol}</span>
                    </div>
                </button>
            </div>
        </header>
    );
}
