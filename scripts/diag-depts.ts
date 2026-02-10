import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
config();
const sql = neon(process.env.DATABASE_URL!);
async function checkCoordinator() {
    console.log("=== DIAGNÓSTICO DE DEPARTAMENTOS ===");

    const user = await sql`SELECT id, nombre, departamento_id FROM usuarios WHERE nombre ILIKE '%Devora%'`;
    const devoraDeptId = user[0]?.departamento_id;
    console.log("ID Dept Devora:", devoraDeptId);

    if (devoraDeptId) {
        const dept = await sql`SELECT * FROM departamentos WHERE id = ${devoraDeptId}`;
        console.log("Dato Dept Devora:", JSON.stringify(dept, null, 2));
    }

    const sectionsCount = await sql`SELECT COUNT(*) FROM secciones WHERE departamento_id = ${devoraDeptId}`;
    console.log("Secciones con este ID:", sectionsCount[0].count);

    const sectionsWithOldDept = await sql`SELECT COUNT(*) FROM secciones WHERE departamento_id IS NULL AND departamento IS NOT NULL`;
    console.log("Secciones con ID NULL pero con nombre de depto antiguo:", sectionsWithOldDept[0].count);

    const sampleSections = await sql`SELECT nombre, grado, departamento_id, departamento FROM secciones LIMIT 10`;
    console.log("Muestra de secciones:", JSON.stringify(sampleSections, null, 2));
}
checkCoordinator();
