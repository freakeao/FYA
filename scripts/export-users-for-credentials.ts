import * as dotenv from "dotenv";
import * as path from "path";

// Cargar variables de entorno antes de importar el DB
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import { db } from "../src/lib/db/db";
import { usuarios, departamentos } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import * as XLSX from "xlsx";

async function exportUsers() {
    console.log("🚀 Iniciando exportación de usuarios...");

    try {
        // Ejecutar la consulta
        console.log("📡 Consultando base de datos...");
        const allUsers = await db.select({
            nombre: usuarios.nombre,
            cedula: usuarios.cedula,
            rol: usuarios.rol,
            departamentoNombre: departamentos.nombre,
            usuarioActual: usuarios.usuario
        })
            .from(usuarios)
            .leftJoin(departamentos, eq(usuarios.departamentoId, departamentos.id));

        if (!allUsers || !Array.isArray(allUsers)) {
            console.error("❌ El resultado de la base de datos no es un arreglo válido:", allUsers);
            return;
        }

        console.log(`📊 Se encontraron ${allUsers.length} usuarios.`);

        // Mapear al formato de BulkUsuarioUploadModal
        const dataForExcel = allUsers.map((u, index) => {
            const nombreStr = String(u.nombre || "");
            const partes = nombreStr.trim().split(/\s+/);
            const primerNombre = partes[0] || "usuario";
            const inicialApellido = partes.length > 1 ? partes[1][0].toLowerCase() : "";

            const usuarioGenerado = `${primerNombre.toLowerCase()}${inicialApellido}`;
            const passwordGenerada = `${primerNombre}123`;

            return [
                u.nombre,               // Col 1: Nombre
                u.cedula || "",         // Col 2: Cédula
                u.rol,                  // Col 3: Rol
                u.departamentoNombre || "", // Col 4: Depto
                "SI",                   // Col 5: ¿Acceso?
                u.usuarioActual || usuarioGenerado, // Col 6: Usuario
                passwordGenerada        // Col 7: Password
            ];
        });

        const header = ["Nombre", "Cédula", "Rol", "Depto", "¿Acceso?", "Usuario", "Password"];
        const worksheetData = [header, ...dataForExcel];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios Preparados");

        const fileName = "usuarios_preparados.xlsx";
        const filePath = path.join(process.cwd(), fileName);
        XLSX.writeFile(workbook, filePath);

        console.log(`✅ Archivo generado exitosamente: ${fileName}`);
        console.log(`📍 Ruta: ${filePath}`);

    } catch (error) {
        console.error("❌ Error durante la exportación:", error);
    }
}

exportUsers();
