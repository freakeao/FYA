import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

const sql = neon(process.env.DATABASE_URL!);

async function verificarAsistenciaPersonal() {
    try {
        console.log("=== VERIFICACIÓN DE ASISTENCIA PERSONAL ===\n");

        // 1. Ver todos los registros de asistencia personal
        const todosRegistros = await sql`
            SELECT 
                ad.fecha,
                ad.presente,
                ad.tipo,
                u.nombre as docente
            FROM asistencia_docentes ad
            INNER JOIN usuarios u ON ad.docente_id = u.id
            ORDER BY ad.fecha DESC, u.nombre
        `;

        console.log(`Total de registros de asistencia personal: ${todosRegistros.length}\n`);

        // Agrupar por fecha
        const porFecha: Record<string, any[]> = {};
        todosRegistros.forEach((r: any) => {
            if (!porFecha[r.fecha]) {
                porFecha[r.fecha] = [];
            }
            porFecha[r.fecha].push(r);
        });

        console.log("Registros agrupados por fecha:\n");
        Object.keys(porFecha).sort().forEach(fecha => {
            console.log(`📅 ${fecha}:`);
            porFecha[fecha].forEach((r: any) => {
                const estado = r.presente ? "✅ PRESENTE" : `❌ AUSENTE (${r.tipo || 'Sin tipo'})`;
                console.log(`   - ${r.docente}: ${estado}`);
            });
            console.log();
        });

        // 2. Verificar específicamente para el martes 10
        const martes10 = await sql`
            SELECT 
                ad.*,
                u.nombre as docente
            FROM asistencia_docentes ad
            INNER JOIN usuarios u ON ad.docente_id = u.id
            WHERE ad.fecha = '2026-02-10'
        `;

        console.log(`\n🔍 REGISTROS PARA MARTES 10/02/2026: ${martes10.length}`);
        if (martes10.length > 0) {
            martes10.forEach((r: any) => {
                console.log(`   - ${r.docente}: ${r.presente ? 'PRESENTE' : 'AUSENTE'}`);
            });
        } else {
            console.log("   ✅ No hay registros para el martes 10 (correcto)");
        }

        // 3. Verificar para el lunes 9
        const lunes9 = await sql`
            SELECT 
                ad.*,
                u.nombre as docente
            FROM asistencia_docentes ad
            INNER JOIN usuarios u ON ad.docente_id = u.id
            WHERE ad.fecha = '2026-02-09'
        `;

        console.log(`\n🔍 REGISTROS PARA LUNES 09/02/2026: ${lunes9.length}`);
        if (lunes9.length > 0) {
            lunes9.forEach((r: any) => {
                console.log(`   - ${r.docente}: ${r.presente ? 'PRESENTE' : 'AUSENTE'}`);
            });
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

verificarAsistenciaPersonal();
