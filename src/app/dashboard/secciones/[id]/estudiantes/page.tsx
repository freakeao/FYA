import { EstudiantesContent } from "./EstudiantesContent";
import { getEstudiantesBySeccion, getSeccion } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function GestionEstudiantesPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const [seccion, alumnos] = await Promise.all([
        getSeccion(id),
        getEstudiantesBySeccion(id)
    ]);

    return <EstudiantesContent seccion={seccion} initialAlumnos={alumnos} />;
}
