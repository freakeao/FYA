import { LayoutGrid, Plus } from "lucide-react";
import { SeccionesContent } from "./SeccionesContent";
import { getSecciones, getUsuarios, getDepartamentos } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function GestionSeccionesPage() {
    const [secciones, usuarios, departamentos] = await Promise.all([
        getSecciones(),
        getUsuarios(),
        getDepartamentos()
    ]);

    const docentes = usuarios.filter((u: any) => u.rol === 'DOCENTE' || u.rol === 'COORDINADOR');

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                        <LayoutGrid className="w-4 h-4" />
                        Administración
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Secciones y Grados</h2>
                    <p className="text-sm text-muted-foreground">Configure las aulas, alumnos por sección y sus docentes guías.</p>
                </div>
            </div>

            <SeccionesContent initialSecciones={secciones} docentes={docentes} departamentos={departamentos} />
        </div >
    );
}
