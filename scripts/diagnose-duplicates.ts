import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import { db } from "../src/lib/db/db";
import { usuarios, horarios, secciones } from "../src/lib/db/schema";
import { eq, sql } from "drizzle-orm";

async function diagnose() {
    console.log("🔍 Diagnosticando duplicados...");

    const allUsers = await db.select().from(usuarios);

    // Agrupar por nombre
    const grouped = allUsers.reduce((acc: any, user: any) => {
        const name = user.nombre.trim().toUpperCase();
        if (!acc[name]) acc[name] = [];
        acc[name].push(user);
        return acc;
    }, {});

    for (const name in grouped) {
        const users = grouped[name];
        if (users.length > 1) {
            console.log(`\n👥 Duplicados encontrados para: ${name}`);
            for (const u of users) {
                // Verificar si tiene horarios o es guía de sección
                const [hCount] = await db.select({ count: sql<number>`count(*)` }).from(horarios).where(eq(horarios.docenteId, u.id));
                const [sCount] = await db.select({ count: sql<number>`count(*)` }).from(secciones).where(eq(secciones.docenteGuiaId, u.id));

                console.log(`  - ID: ${u.id}`);
                console.log(`    Usuario: ${u.usuario || "null"}`);
                console.log(`    Tiene Password: ${!!u.password}`);
                console.log(`    Horarios: ${hCount.count}`);
                console.log(`    Guía de Sección: ${sCount.count}`);
                console.log(`    Creado: ${u.createdAt}`);
            }
        }
    }
}

diagnose();
