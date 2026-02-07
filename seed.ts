import { db } from './src/lib/db/db';
import { usuarios, secciones, materias, estudiantes, horarios } from './src/lib/db/schema';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function seed() {
    console.log('🌱 Empezando el sembrado de datos...');

    // 1. Limpiar datos existentes (opcional, pero recomendado para un seed limpio)
    // Nota: Drizzle no tiene un "truncate all" nativo fácil sin cascada, 
    // así que solo insertaremos si no existen o asumimos base limpia.

    // 2. Crear Usuario Administrador inicial
    const hashedAdminPassword = await bcrypt.hash('admin', 10);
    const [adminUser] = await db.insert(usuarios).values({
        nombre: 'Administrador Sistema',
        usuario: 'admin',
        password: hashedAdminPassword,
        rol: 'ADMINISTRADOR',
    }).onConflictDoNothing().returning();

    console.log('✅ Usuario Admin creado: admin / admin');

    // 3. Crear algunos Docentes
    const hashedDocentePassword = await bcrypt.hash('docente123', 10);
    const [docente1] = await db.insert(usuarios).values({
        nombre: 'Prof. Juan Pérez',
        usuario: 'juan.perez',
        password: hashedDocentePassword,
        rol: 'DOCENTE',
    }).onConflictDoNothing().returning();

    const [docente2] = await db.insert(usuarios).values({
        nombre: 'Prof. Maria García',
        usuario: 'maria.garcia',
        password: hashedDocentePassword,
        rol: 'DOCENTE',
    }).onConflictDoNothing().returning();

    // 4. Crear Secciones
    const [seccion5B] = await db.insert(secciones).values({
        nombre: "5to Grado 'B'",
        grado: '5to',
        docenteGuiaId: docente1?.id,
    }).returning();

    const [seccion6A] = await db.insert(secciones).values({
        nombre: "6to Grado 'A'",
        grado: '6to',
        docenteGuiaId: docente2?.id,
    }).returning();

    console.log('✅ Secciones creadas');

    // 5. Crear Materias
    const [mat] = await db.insert(materias).values({
        nombre: 'Matemáticas',
        codigo: 'MAT-05',
        color: 'bg-blue-600',
    }).returning();

    const [len] = await db.insert(materias).values({
        nombre: 'Lengua y Literatura',
        codigo: 'LEN-05',
        color: 'bg-rose-600',
    }).returning();

    const [naturales] = await db.insert(materias).values({
        nombre: 'Ciencias Naturales',
        codigo: 'NAT-05',
        color: 'bg-emerald-600',
    }).returning();

    console.log('✅ Materias creadas');

    // 6. Crear Alumnos para 5to B
    const alumnosData = [
        { nombre: 'Alvarez, Luis', numeroLista: 1, genero: 'VARON' as const, seccionId: seccion5B.id },
        { nombre: 'Bolivar, Maria', numeroLista: 2, genero: 'HEMBRA' as const, seccionId: seccion5B.id },
        { nombre: 'Castillo, Jose', numeroLista: 3, genero: 'VARON' as const, seccionId: seccion5B.id },
        { nombre: 'Duran, Elena', numeroLista: 4, genero: 'HEMBRA' as const, seccionId: seccion5B.id },
        { nombre: 'Escalona, Pedro', numeroLista: 5, genero: 'VARON' as const, seccionId: seccion5B.id },
    ];

    await db.insert(estudiantes).values(alumnosData);
    console.log('✅ Alumnos creados');

    // 7. Crear Horarios de ejemplo
    const horariosData = [
        {
            seccionId: seccion5B.id,
            materiaId: mat.id,
            docenteId: docente1.id,
            diaSemana: 'LUNES' as const,
            horaInicio: '07:00:00',
            horaFin: '08:30:00',
        },
        {
            seccionId: seccion5B.id,
            materiaId: len.id,
            docenteId: docente1.id,
            diaSemana: 'LUNES' as const,
            horaInicio: '08:30:00',
            horaFin: '10:00:00',
        }
    ];

    await db.insert(horarios).values(horariosData);
    console.log('✅ Horarios creados');

    console.log('✨ ¡Sembrado completado con éxito!');
    process.exit(0);
}

seed().catch((e) => {
    console.error('❌ Error en el sembrado:', e);
    process.exit(1);
});
