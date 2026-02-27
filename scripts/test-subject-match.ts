import { config } from "dotenv";
config();
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function run() {
    const materias = await sql`SELECT id, nombre FROM materias`;
    console.log("Materias in DB:");
    materias.forEach(m => console.log(m.nombre));

    function normalizeText(text: string): string {
        if (!text) return "";
        return text.toString()
            .toUpperCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Z0-9\s]/g, "")
            .trim();
    }

    function matchMateria(rawMateria: string, materias: any[]) {
        const cleaned = normalizeText(rawMateria);
        if (!cleaned) return null;
        for (const m of materias) {
            const mNorm = normalizeText(m.nombre);
            if (mNorm.includes(cleaned) || cleaned.includes(mNorm)) {
                return { id: m.id, nombre: m.nombre, matchedWith: mNorm, inputWas: cleaned };
            }
        }
        return null;
    }

    console.log("\nMatching 'CS I':");
    console.log(matchMateria("CS I", materias));
}
run();
