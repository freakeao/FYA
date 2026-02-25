import { EstudiantesContent } from "./EstudiantesContent";
import { getEstudiantesBySeccion, getSeccion, getDocentesBySeccion, getUsuarios } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function GestionEstudiantesPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const [seccion, alumnos, assignedDocentes, allUsuarios] = await Promise.all([
        getSeccion(id),
        getEstudiantesBySeccion(id),
        getDocentesBySeccion(id),
        getUsuarios()
    ]);

    // Filtrar solo docentes para el selector de asignación
    const availableDocentes = allUsuarios.filter((u: any) => u.rol === "DOCENTE" || u.rol === "COORDINADOR");

    return (
        <EstudiantesContent
            seccion={seccion}
            initialAlumnos={alumnos}
            initialDocentes={assignedDocentes}
            availableDocentes={availableDocentes}
        />
    );
}
