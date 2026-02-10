import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
config();
const sql = neon(process.env.DATABASE_URL!);
async function checkCoordinator() {
    console.log("=== VERIFICANDO COORDINADOR Y SECCIONES ===");

    const user = await sql`SELECT id, nombre, rol, departamento_id FROM usuarios WHERE nombre ILIKE '%Devora%'`;
    console.log("\nUsuario:", JSON.stringify(user, null, 2));

    const dept = await sql`SELECT id, nombre FROM departamentos`;
    console.log("\nDepartamentos disponibles:", JSON.stringify(dept, null, 2));

    const sections = await sql`SELECT id, nombre, grado, departamento_id, departamento FROM secciones LIMIT 5`;
    console.log("\nMuestra de secciones:", JSON.stringify(sections, null, 2));
}
checkCoordinator();
