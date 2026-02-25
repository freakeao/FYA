
import { db } from './src/lib/db/db';
import { horarios, secciones, materias, usuarios } from './src/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const checkSchedule = async () => {
    // Configurar fecha en zona horaria de Venezuela
    const now = new Date();
    const options = { timeZone: "America/Caracas" };
    const venezuelaDateStr = now.toLocaleString("en-US", options);
    const venezuelaDate = new Date(venezuelaDateStr);

    const diaSemanaMap: Record<number, string> = {
        0: "DOMINGO", 1: "LUNES", 2: "MARTES", 3: "MIERCOLES", 4: "JUEVES", 5: "VIERNES", 6: "SABADO"
    };
    const hoyDia = diaSemanaMap[venezuelaDate.getDay()];

    const hours = venezuelaDate.getHours().toString().padStart(2, '0');
    const minutes = venezuelaDate.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    console.log(`Current Time: ${currentTime}, Day: ${hoyDia}`);

    // Fetch all schedules for today
    const schedules = await db.query.horarios.findMany({
        // @ts-expect-error type matching in drizzle enum
        where: eq(horarios.diaSemana, hoyDia),
        with: {
            seccion: true,
            materia: true,
            docente: true
        }
    });

    console.log("Schedules for today:", schedules);
}

checkSchedule().catch(console.error);
