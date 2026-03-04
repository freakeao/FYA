import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import { db } from "../src/lib/db/db";
import { usuarios, horarios, secciones, registrosAsistencia, asistenciaDocentes, seccionesDocentes } from "../src/lib/db/schema";
import { eq, sql, inArray } from "drizzle-orm";

const PROTECTED_NAMES = [
    "ADMINISTRADOR SISTEMA",
    "DEVORA PÉREZ",
    "ELIANTHA ACEVEDO",
    "VICTOR LEON",
    "FREAKEAO",
    "ADMIN"
];

const PROTECTED_USERNAMES = [
    "ADMIN",
    "DEVORA",
    "ELIANTHA",
    "FREAKEAO"
];

async function cleanup() {
    console.log("🛠️ Iniciando proceso de limpieza de duplicados...");

    const allUsers = await db.select().from(usuarios);

    // Agrupar por nombre
    const grouped = allUsers.reduce((acc: any, user: any) => {
        const name = user.nombre.trim().toUpperCase();
        if (!acc[name]) acc[name] = [];
        acc[name].push(user);
        return acc;
    }, {});

    let mergedCount = 0;
    let deletedCount = 0;

    for (const name in grouped) {
        const users = grouped[name] as any[];

        // Saltar si no hay duplicados
        if (users.length <= 1) continue;

        // Verificar si el grupo contiene usuarios protegidos
        const isProtected = users.some(u =>
            PROTECTED_NAMES.includes(u.nombre.toUpperCase()) ||
            (u.usuario && PROTECTED_USERNAMES.includes(u.usuario.toUpperCase()))
        );

        if (isProtected) {
            console.log(`⚠️ Grupo protegido saltado: ${name}`);
            continue;
        }

        console.log(`\n🔄 Procesando: ${name} (${users.length} registros)`);

        // Identificar al "Host" (Original con data)
        let host: any = null;
        let candidates: any[] = [];

        for (const u of users) {
            const [hCount] = await db.select({ count: sql<number>`count(*)` }).from(horarios).where(eq(horarios.docenteId, u.id));
            const [sCount] = await db.select({ count: sql<number>`count(*)` }).from(secciones).where(eq(secciones.docenteGuiaId, u.id));

            // Check if they are guide of any section or have horarios
            const totalRelationCount = Number(hCount.count) + Number(sCount.count);

            if (totalRelationCount > 0) {
                if (!host || u.createdAt < host.createdAt) {
                    host = u;
                }
            } else {
                candidates.push(u);
            }
        }

        // Si no encontramos un host con horarios, usamos el más antiguo como host
        if (!host) {
            users.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            host = users[0];
            candidates = users.slice(1);
        } else {
            // Refinar candidatos para borrar: el resto que no sea el host
            candidates = users.filter((u: any) => u.id !== host.id);
        }

        console.log(`  🏠 Host: ${host.id} (Creado: ${host.createdAt})`);

        // Buscar el "Source" de credenciales entre los candidatos (el que tenga password)
        const source = candidates.find((u: any) => u.password && u.usuario);

        if (source) {
            console.log(`  🔑 Migrando credenciales desde ${source.id} (@${source.usuario})`);

            const targetUsuario = source.usuario;
            const targetPassword = source.password;

            // 1. Limpiar el usuario del duplicado PRIMERO para evitar el error de llave única
            console.log(`  🧹 Liberando nombre de usuario '${targetUsuario}'...`);
            await db.update(usuarios).set({ usuario: null }).where(eq(usuarios.id, source.id));

            // 2. Actualizar Host con las credenciales
            await db.update(usuarios).set({
                usuario: targetUsuario,
                password: targetPassword
            }).where(eq(usuarios.id, host.id));

            mergedCount++;

            // 3. Borrar todos los duplicados que NO son el host
            for (const duplicate of candidates) {
                console.log(`  🗑️ Eliminando duplicado: ${duplicate.id}`);
                await db.delete(usuarios).where(eq(usuarios.id, duplicate.id));
                deletedCount++;
            }
        } else {
            console.log(`  ℹ️ No se encontraron credenciales nuevas para migrar en este grupo.`);
            // Aún así podríamos borrar duplicados vacíos si existen
            for (const duplicate of candidates) {
                if (!duplicate.password) {
                    console.log(`  🗑️ Eliminando duplicado vacío: ${duplicate.id}`);
                    await db.delete(usuarios).where(eq(usuarios.id, duplicate.id));
                    deletedCount++;
                }
            }
        }
    }

    console.log(`\n✨ Limpieza completada!`);
    console.log(`✅ Usuarios actualizados: ${mergedCount}`);
    console.log(`❌ Duplicados eliminados: ${deletedCount}`);
}

cleanup().catch(err => {
    console.error("💥 Error fatal durante la limpieza:", err);
});
