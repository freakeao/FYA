import { db } from "@/lib/db/db";
import { usuarios, asistenciaDocentes } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { AsistenciaPersonalContent } from "./AsistenciaPersonalContent";

export default async function AsistenciaPersonalPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const session = await getSession();
    if (!session || (session.user.rol !== "ADMINISTRADOR" && session.user.rol !== "COORDINADOR")) {
        redirect("/dashboard");
    }

    const { date } = await searchParams;
    const fechaSeleccionada = date || new Date().toISOString().split('T')[0];

    // Obtener todos los docentes
    const docentes = await db
        .select()
        .from(usuarios)
        .where(eq(usuarios.rol, "DOCENTE"));

    // Obtener la asistencia de la fecha seleccionada
    const asistenciaHoy = await db
        .select()
        .from(asistenciaDocentes)
        .where(eq(asistenciaDocentes.fecha, fechaSeleccionada));

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header>
                <h1 className="text-4xl font-black tracking-tighter uppercase">Asistencia de Personal</h1>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">
                    Control de presencia docente - {new Date(fechaSeleccionada + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </header>

            <AsistenciaPersonalContent
                docentes={docentes}
                asistenciaInicial={asistenciaHoy}
                selectedDate={fechaSeleccionada}
            />
        </div>
    );
}
