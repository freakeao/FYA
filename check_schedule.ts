
const { db } = require('./src/lib/db/db');
const { horarios, secciones, materias, usuarios } = require('./src/lib/db/schema');
const { eq, and } = require('drizzle-orm');

async function checkSchedule() {
    const diaSemanaMap = {
        0: "DOMINGO", 1: "LUNES", 2: "MARTES", 3: "MIERCOLES", 4: "JUEVES", 5: "VIERNES", 6: "SABADO"
    };
    const now = new Date();
    const hoyDia = diaSemanaMap[now.getDay()];
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    console.log(`Current Time: ${currentTime}, Day: ${hoyDia}`);

    // Fetch all schedules for today
    const schedules = await db.query.horarios.findMany({
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
