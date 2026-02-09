import { ClipboardList, Plus } from "lucide-react";
import { HorariosContent } from "./HorariosContent";
import { getHorariosByDia, getMaterias, getSecciones, getUsuarios } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function GestionHorariosPage({ searchParams }: { searchParams: { day?: string } }) {
    const { day } = await searchParams;
    const currentDay = (day || "LUNES") as any;

    const [schedules, materias, secciones, usuarios] = await Promise.all([
        getHorariosByDia(currentDay),
        getMaterias(),
        getSecciones(),
        getUsuarios()
    ]);

    const docentes = usuarios; // Pass all staff for scheduling

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                        <ClipboardList className="w-4 h-4" />
                        Planificación Semanal
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Horarios</h2>
                    <p className="text-sm text-muted-foreground">Administre la carga académica de todas las secciones.</p>
                </div>

            </div>

            <HorariosContent
                initialHorarios={schedules}
                secciones={secciones}
                materias={materias}
                docentes={docentes}
                currentDay={currentDay}
            />
        </div >
    );
}
