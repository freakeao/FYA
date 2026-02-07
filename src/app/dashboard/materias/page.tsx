import { Library, Plus } from "lucide-react";
import { MateriasContent } from "./MateriasContent";
import { getMaterias } from "@/lib/actions";

export default async function GestionMateriasPage() {
    const materias = await getMaterias();

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <MateriasContent initialMaterias={materias} />
        </div>
    );
}
