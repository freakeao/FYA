import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

const sql = neon(process.env.DATABASE_URL!);

async function diagnostic() {
    console.log("=== DIAGNÓSTICO DE DEPARTAMENTOS Y DASHBOARD ===\n");

    // 1. Departamentos
    const depts = await sql`SELECT id, nombre, codigo FROM departamentos`;
    console.log("DEPARTAMENTOS EN DB:", JSON.stringify(depts, null, 2));

    // 2. Usuarios clave
    const users = await sql`
        SELECT u.id, u.nombre, u.rol, u.departamento_id, d.nombre as dept_nombre 
        FROM usuarios u
        LEFT JOIN departamentos d ON u.departamento_id = d.id
        WHERE u.nombre ILIKE '%Devora%' OR u.nombre ILIKE '%Eliantha%'
    `;
    console.log("\nUSUARIOS CLAVE:", JSON.stringify(users, null, 2));

    // 3. Secciones y sus deptos
    const sections = await sql`
        SELECT s.id, s.nombre, s.grado, s.departamento_id, d.nombre as dept_nombre
        FROM secciones s
        LEFT JOIN departamentos d ON s.departamento_id = d.id
        LIMIT 10
    `;
    console.log("\nSECCIONES (Muestra):", JSON.stringify(sections, null, 2));

    // 4. Conteo por depto
    const counts = await sql`
        SELECT d.nombre, count(s.id) as total_secciones
        FROM departamentos d
        LEFT JOIN secciones s ON s.departamento_id = d.id
        GROUP BY d.nombre
    `;
    console.log("\nCONTEO SECCIONES POR DEPTO:", JSON.stringify(counts, null, 2));
}

diagnostic();
