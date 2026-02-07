import { LayoutGrid, Plus } from "lucide-react";
import { SeccionesContent } from "./SeccionesContent";
import { getSecciones, getUsuarios } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function GestionSeccionesPage() {
    const [secciones, usuarios] = await Promise.all([
        getSecciones(),
        getUsuarios()
    ]);

    const docentes = usuarios.filter(u => u.rol === 'DOCENTE' || u.rol === 'COORDINADOR');

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                        <LayoutGrid className="w-4 h-4" />
                        Administración
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Secciones y Grados</h2>
                    <p className="text-sm text-muted-foreground">Configure las aulas, alumnos por sección y sus docentes guías.</p>
                </div>

                <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-4 rounded-3xl font-black text-sm uppercase tracking-widest hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 group">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Nueva Sección
                </button>
            </div>

            <SeccionesContent initialSecciones={secciones} docentes={docentes} />
        </div>
    );
}
