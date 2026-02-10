import { db } from "@/lib/db/db";
import { usuarios, asistenciaDocentes, horarios } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { AsistenciaPersonalContent } from "./AsistenciaPersonalContent";

export const dynamic = "force-dynamic";

export default async function AsistenciaPersonalPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const session = await getSession();
    if (!session || (session.user.rol !== "ADMINISTRADOR" && session.user.rol !== "COORDINADOR")) {
        redirect("/dashboard");
    }

    const { date } = await searchParams;

    // Obtener fecha actual en Venezuela (America/Caracas)
    const venezuelaDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Caracas',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());

    const fechaSeleccionada = date || venezuelaDate;

    // Calcular día de la semana de la fecha seleccionada
    const selectedDateObj = new Date(fechaSeleccionada + 'T12:00:00');
    const diaSemanaNum = selectedDateObj.getDay();
    const diaSemanaMap: Record<number, string> = {
        0: "DOMINGO", 1: "LUNES", 2: "MARTES",
        3: "MIERCOLES", 4: "JUEVES", 5: "VIERNES", 6: "SABADO"
    };
    const diaSemana = diaSemanaMap[diaSemanaNum];

    // Obtener datos en paralelo
    const [personalConHorarios, asistenciaHoy] = await Promise.all([
        // Solo personal con horarios programados para el día de la semana seleccionado
        db
            .selectDistinct({
                id: usuarios.id,
                nombre: usuarios.nombre,
                usuario: usuarios.usuario,
                rol: usuarios.rol,
                cedula: usuarios.cedula
            })
            .from(horarios)
            .innerJoin(usuarios, eq(horarios.docenteId, usuarios.id))
            .where(eq(horarios.diaSemana, diaSemana as any))
            .orderBy(usuarios.nombre),
        db.select().from(asistenciaDocentes).where(eq(asistenciaDocentes.fecha, fechaSeleccionada))
    ]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header>
                <h1 className="text-4xl font-black tracking-tighter uppercase">Asistencia de Personal</h1>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">
                    Control de presencia docente - {new Date(fechaSeleccionada + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </header>

            <AsistenciaPersonalContent
                key={fechaSeleccionada}
                docentes={personalConHorarios}
                asistenciaInicial={asistenciaHoy}
                selectedDate={fechaSeleccionada}
            />
        </div>
    );
}
