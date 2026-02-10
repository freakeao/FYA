import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

const sql = neon(process.env.DATABASE_URL!);

async function autoAssignDepartments() {
    try {
        console.log("=== INICIANDO ASIGNACIÓN AUTOMÁTICA DE DEPARTAMENTOS ===\n");

        // 1. Verificar departamentos existentes
        const depts = await sql`SELECT * FROM departamentos`;

        if (depts.length === 0) {
            console.log("Creando departamentos base...");
            await sql`
                INSERT INTO departamentos (nombre, codigo) VALUES
                ('Media General', 'MG'),
                ('Media Básica', 'MB'),
                ('Administración', 'ADM'),
                ('Documental', 'DOC')
            `;
            console.log("✓ Departamentos creados\n");
        }

        // Recargar departamentos
        const allDepts = await sql`SELECT * FROM departamentos`;
        const mediaGeneral = allDepts.find((d: any) => d.codigo === 'MG');
        const mediaBasica = allDepts.find((d: any) => d.codigo === 'MB');
        const administracion = allDepts.find((d: any) => d.codigo === 'ADM');

        console.log("Departamentos disponibles:");
        allDepts.forEach((d: any) => console.log(`  - ${d.nombre} (${d.codigo})`));
        console.log();

        // 2. Obtener secciones sin departamento
        const seccionesSinDept = await sql`
            SELECT * FROM secciones 
            WHERE departamento_id IS NULL
        `;

        console.log(`Secciones sin departamento: ${seccionesSinDept.length}\n`);

        if (seccionesSinDept.length === 0) {
            console.log("✓ Todas las secciones ya tienen departamento asignado");
        } else {
            // 3. Asignar departamentos basándose en el grado
            let asignados = 0;

            for (const seccion of seccionesSinDept) {
                let deptId = null;
                const grado = (seccion.grado || "").toUpperCase();
                const nombre = (seccion.nombre || "").toUpperCase();

                // Lógica de asignación
                if (grado.includes("4") || grado.includes("5") || grado.includes("CUARTO") || grado.includes("QUINTO")) {
                    deptId = mediaGeneral?.id;
                    console.log(`  ${seccion.nombre} (${seccion.grado}) → Media General`);
                } else if (grado.includes("1") || grado.includes("2") || grado.includes("3") ||
                    grado.includes("PRIMER") || grado.includes("SEGUNDO") || grado.includes("TERCER")) {
                    deptId = mediaBasica?.id;
                    console.log(`  ${seccion.nombre} (${seccion.grado}) → Media Básica`);
                } else if (nombre.includes("ADMIN") || nombre.includes("DIREC") || grado.includes("ADMIN")) {
                    deptId = administracion?.id;
                    console.log(`  ${seccion.nombre} (${seccion.grado}) → Administración`);
                } else {
                    deptId = mediaGeneral?.id;
                    console.log(`  ${seccion.nombre} (${seccion.grado}) → Media General (por defecto)`);
                }

                if (deptId) {
                    await sql`
                        UPDATE secciones 
                        SET departamento_id = ${deptId}
                        WHERE id = ${seccion.id}
                    `;
                    asignados++;
                }
            }

            console.log(`\n✓ ${asignados} secciones actualizadas\n`);
        }

        // 4. Asignar departamentos a usuarios sin departamento
        const usuariosSinDept = await sql`
            SELECT * FROM usuarios 
            WHERE departamento_id IS NULL
        `;

        console.log(`Usuarios sin departamento: ${usuariosSinDept.length}\n`);

        let usuariosAsignados = 0;
        for (const usuario of usuariosSinDept) {
            let deptId = null;

            if (usuario.rol === "ADMINISTRADOR" || usuario.rol === "ADMINISTRATIVO" || usuario.rol === "OBRERO") {
                deptId = administracion?.id;
                console.log(`  ${usuario.nombre} (${usuario.rol}) → Administración`);
            } else if (usuario.rol === "DOCENTE" || usuario.rol === "COORDINADOR") {
                deptId = mediaGeneral?.id;
                console.log(`  ${usuario.nombre} (${usuario.rol}) → Media General`);
            }

            if (deptId) {
                await sql`
                    UPDATE usuarios 
                    SET departamento_id = ${deptId}
                    WHERE id = ${usuario.id}
                `;
                usuariosAsignados++;
            }
        }

        console.log(`\n✓ ${usuariosAsignados} usuarios actualizados\n`);
        console.log("=== ASIGNACIÓN COMPLETADA ===");

    } catch (e) {
        console.error("Error:", e);
    }
}

autoAssignDepartments();
