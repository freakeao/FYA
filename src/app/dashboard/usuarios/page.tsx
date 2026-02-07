import { db } from "@/lib/db/db";
import { usuarios } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UsuariosContent } from "./UsuariosContent";

export default async function UsuariosPage() {
    const session = await getSession();
    if (session?.user?.rol !== "ADMINISTRADOR") {
        redirect("/dashboard");
    }

    const allUsers = await db.select().from(usuarios).orderBy(usuarios.createdAt);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase">Usuarios</h1>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">
                        Gestión centralizada de personal y accesos
                    </p>
                </div>
            </header>

            <UsuariosContent session={session} initialUsers={allUsers} />
        </div>
    );
}

import { cn } from "@/lib/utils";
