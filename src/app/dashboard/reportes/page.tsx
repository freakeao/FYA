import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReportesContent } from "./ReportesContent";
import { ClipboardCheck } from "lucide-react";
import { getSecciones } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    const secciones = await getSecciones();

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                        <ClipboardCheck className="w-4 h-4" />
                        Centro de Reportes
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase">Exportación de Datos</h1>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">
                        Genere reportes detallados de inasistencias en formato Excel.
                    </p>
                </div>
            </header>

            <ReportesContent
                userRole={session.user.rol}
                secciones={secciones.map((s: any) => ({ id: s.id, nombre: s.nombre }))}
            />
        </div>
    );
}
