import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPermisos, getDocentesSinPermisos } from "@/lib/actions";
import { PermisosContent } from "./PermisosContent";

export const dynamic = "force-dynamic";

export default async function PermisosPage() {
    const session = await getSession();
    if (!session || (session.user.rol !== "ADMINISTRADOR" && session.user.rol !== "COORDINADOR")) {
        redirect("/dashboard");
    }

    const [permisos, docentes] = await Promise.all([
        getPermisos(),
        getDocentesSinPermisos()
    ]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header>
                <h1 className="text-4xl font-black tracking-tighter uppercase">Permisos y Reposos</h1>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">
                    Registro de ausencias extendidas — Reposos médicos, permisos y vacaciones
                </p>
            </header>

            <PermisosContent permisosIniciales={permisos} docentes={docentes} />
        </div>
    );
}
