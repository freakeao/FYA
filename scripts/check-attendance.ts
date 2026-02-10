import { db } from "./src/lib/db";
import { registrosAsistencia, horarios, secciones, estudiantes } from "./src/lib/db/schema";
import { eq, and } from "drizzle-orm";

async function checkAttendance() {
    try {
        const today = new Date().toISOString().split('T')[0];
        console.log("Verificando asistencia para:", today);

        // 1. Contar registros de asistencia de hoy
        const registrosHoy = await db
            .select()
            .from(registrosAsistencia)
            .where(eq(registrosAsistencia.fecha, today));

        console.log("\n=== REGISTROS DE ASISTENCIA HOY ===");
        console.log("Total de registros:", registrosHoy.length);
        registrosHoy.forEach(r => {
            console.log(`- Horario ID: ${r.horarioId}, Presentes: ${r.cantidadT}, H: ${r.cantidadH}, V: ${r.cantidadV}`);
        });

        // 2. Contar horarios programados para hoy
        const diaSemana = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"][new Date().getDay()];
        const horariosHoy = await db
            .select()
            .from(horarios)
            .where(eq(horarios.diaSemana, diaSemana as any));

        console.log("\n=== HORARIOS PROGRAMADOS PARA", diaSemana, "===");
        console.log("Total de horarios:", horariosHoy.length);

        // 3. Contar estudiantes totales
        const totalEstudiantes = await db.select().from(estudiantes);
        console.log("\n=== ESTUDIANTES ===");
        console.log("Total de estudiantes:", totalEstudiantes.length);

        // 4. Verificar secciones
        const totalSecciones = await db.select().from(secciones);
        console.log("\n=== SECCIONES ===");
        console.log("Total de secciones:", totalSecciones.length);

    } catch (e) {
        console.error("Error:", e);
    }
}

checkAttendance();
