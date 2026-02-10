import { db } from "./src/lib/db";
import { usuarios, departamentos } from "./src/lib/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function restore() {
    try {
        console.log("Iniciando restauración...");

        // 1. Asegurar Departamentos
        const depts = await db.select().from(departamentos);
        let adminDeptId = null;

        if (depts.length === 0) {
            console.log("Insertando departamentos iniciales...");
            const d = await db.insert(departamentos).values([
                { nombre: "Administración", codigo: "ADM" },
                { nombre: "Media General", codigo: "MG" },
                { nombre: "Media Básica", codigo: "MB" },
                { nombre: "Documental", codigo: "DOC" },
                { nombre: "Todos", codigo: "ALL" }
            ]).returning();
            adminDeptId = d.find(i => i.codigo === "ADM")?.id;
        } else {
            adminDeptId = depts.find(i => i.codigo === "ADM")?.id;
        }

        // 2. Restaurar Usuarios
        const hashedPw = await bcrypt.hash("freakeao*", 10);

        const existingAdmin = await db.select().from(usuarios).where(eq(usuarios.usuario, "admin"));
        if (existingAdmin.length === 0) {
            console.log("Restaurando admin...");
            await db.insert(usuarios).values({
                nombre: "Administrador",
                usuario: "admin",
                password: hashedPw,
                rol: "ADMINISTRADOR",
                departamentoId: adminDeptId
            });
        }

        const existingFreakeao = await db.select().from(usuarios).where(eq(usuarios.usuario, "freakeao"));
        if (existingFreakeao.length === 0) {
            console.log("Restaurando freakeao...");
            await db.insert(usuarios).values({
                nombre: "Freakeao",
                usuario: "freakeao",
                password: hashedPw,
                rol: "ADMINISTRADOR",
                departamentoId: adminDeptId
            });
        }

        // 3. Verificar Devora Pérez (la que aparece en la pantalla)
        const existingDevora = await db.select().from(usuarios).where(eq(usuarios.nombre, "Devora Pérez"));
        if (existingDevora.length === 0) {
            console.log("Restaurando Devora Pérez...");
            await db.insert(usuarios).values({
                nombre: "Devora Pérez",
                usuario: "devora",
                password: hashedPw,
                rol: "ADMINISTRADOR",
                departamentoId: adminDeptId
            });
        }

        console.log("Restauración completada con éxito.");
    } catch (e) {
        console.error("Error en restauración:", e);
    }
}

restore();
