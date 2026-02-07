"use server";

import { db } from "@/lib/db/db";
import { secciones, materias, estudiantes, horarios, registrosAsistencia, inasistenciasAlumnos, usuarios, asistenciaDocentes } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { login, logout, getSession } from "./auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// --- SECCIONES ---
// --- SECCIONES ---
export async function getSecciones() {
    const result = await db.select({
        id: secciones.id,
        nombre: secciones.nombre,
        grado: secciones.grado,
        docenteGuia: usuarios.nombre,
        alumnosCount: sql<number>`(SELECT count(*) FROM ${estudiantes} WHERE ${estudiantes.seccionId} = ${secciones.id})`.mapWith(Number),
        materiasCount: sql<number>`(SELECT count(DISTINCT ${horarios.materiaId}) FROM ${horarios} WHERE ${horarios.seccionId} = ${secciones.id})`.mapWith(Number),
    })
        .from(secciones)
        .leftJoin(usuarios, eq(secciones.docenteGuiaId, usuarios.id))
        .orderBy(secciones.nombre);

    return result;
}

export async function getSeccion(id: string) {
    const [result] = await db.select().from(secciones).where(eq(secciones.id, id));
    return result;
}

export async function createSeccion(data: { nombre: string; grado: string; docenteGuiaId?: string }) {
    try {
        await db.insert(secciones).values(data);
        revalidatePath("/dashboard/secciones");
        return { success: true, message: "Sección creada correctamente" };
    } catch (error) {
        return { success: false, error: "Error al crear sección" };
    }
}

export async function updateSeccion(id: string, data: { nombre: string; grado: string; docenteGuiaId?: string }) {
    try {
        await db.update(secciones).set(data).where(eq(secciones.id, id));
        revalidatePath("/dashboard/secciones");
        return { success: true, message: "Sección actualizada correctamente" };
    } catch (error) {
        return { success: false, error: "Error al actualizar sección" };
    }
}

// --- MATERIAS ---
export async function getMaterias() {
    return await db.select().from(materias);
}

export async function createMateria(data: { nombre: string; codigo?: string; color?: string }) {
    try {
        await db.insert(materias).values(data);
        revalidatePath("/dashboard/materias");
        return { success: true, message: "Materia creada correctamente" };
    } catch (error) {
        return { success: false, error: "Error al crear materia" };
    }
}

export async function updateMateria(id: string, data: { nombre: string; codigo?: string; color?: string }) {
    try {
        await db.update(materias).set(data).where(eq(materias.id, id));
        revalidatePath("/dashboard/materias");
        return { success: true, message: "Materia actualizada correctamente" };
    } catch (error) {
        return { success: false, error: "Error al actualizar materia" };
    }
}

// --- ESTUDIANTES ---
export async function getEstudiantesBySeccion(seccionId: string) {
    return await db.select().from(estudiantes)
        .where(eq(estudiantes.seccionId, seccionId))
        .orderBy(estudiantes.numeroLista);
}

export async function addEstudiante(data: { nombre: string; seccionId: string; numeroLista: number; genero: "HEMBRA" | "VARON" }) {
    try {
        await db.insert(estudiantes).values(data);
        revalidatePath(`/dashboard/secciones/${data.seccionId}/estudiantes`);
        return { success: true, message: "Estudiante registrado" };
    } catch (error) {
        return { success: false, error: "Error al registrar estudiante" };
    }
}

export async function updateEstudiante(id: string, data: { nombre: string; numeroLista: number; genero: "HEMBRA" | "VARON"; seccionId: string }) {
    try {
        await db.update(estudiantes).set(data).where(eq(estudiantes.id, id));
        revalidatePath(`/dashboard/secciones/${data.seccionId}/estudiantes`);
        return { success: true, message: "Estudiante actualizado" };
    } catch (error) {
        return { success: false, error: "Error al actualizar estudiante" };
    }
}

// --- HORARIOS ---
export async function getHorariosByDia(dia: any) {
    return await db.query.horarios.findMany({
        where: eq(horarios.diaSemana, dia),
        with: {
            seccion: true,
            materia: true,
            docente: true
        }
    });
}

export async function createHorario(data: any) {
    try {
        await db.insert(horarios).values(data);
        revalidatePath("/dashboard/horarios");
        return { success: true, message: "Horario creado" };
    } catch (error) {
        return { success: false, error: "Error al crear horario" };
    }
}

export async function updateHorario(id: string, data: any) {
    try {
        await db.update(horarios).set(data).where(eq(horarios.id, id));
        revalidatePath("/dashboard/horarios");
        return { success: true, message: "Horario actualizado" };
    } catch (error) {
        return { success: false, error: "Error al actualizar horario" };
    }
}

export async function deleteHorario(formData: FormData) {
    const id = formData.get("id") as string;
    try {
        await db.delete(horarios).where(eq(horarios.id, id));
        revalidatePath("/dashboard/horarios");
        return { success: true, message: "Horario eliminado" };
    } catch (error) {
        return { success: false, error: "Error al eliminar horario" };
    }
}

// --- ASISTENCIA ---
export async function registrarAsistencia(data: {
    horarioId: string;
    fecha: string;
    tema: string;
    incidencias: string;
    cantidadH: number;
    cantidadV: number;
    cantidadT: number;
    inasistencias: string[]; // IDs de alumnos
}) {
    const [registro] = await db.insert(registrosAsistencia).values({
        horarioId: data.horarioId,
        fecha: data.fecha,
        tema: data.tema,
        incidencias: data.incidencias,
        cantidadH: data.cantidadH,
        cantidadV: data.cantidadV,
        cantidadT: data.cantidadT,
    }).returning();

    if (data.inasistencias.length > 0) {
        await db.insert(inasistenciasAlumnos).values(
            data.inasistencias.map(estudianteId => ({
                registroId: registro.id,
                estudianteId: estudianteId,
            }))
        );
    }

    revalidatePath("/dashboard/asistencia");
}

// --- AUTENTICACION ---
// --- AUTENTICACION ---
export async function loginUser(formData: FormData) {
    try {
        const usuario = (formData.get("usuario") as string)?.trim().toLowerCase();
        const password = formData.get("password") as string;

        if (!usuario || !password) {
            return { error: "Por favor, completa todos los campos" };
        }

        const [user] = await db.select().from(usuarios).where(eq(usuarios.usuario, usuario));

        if (!user || !user.password) {
            return { error: "Usuario no encontrado o sin acceso" };
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return { error: "Contraseña incorrecta" };
        }

        await login({
            id: user.id,
            nombre: user.nombre,
            usuario: user.usuario,
            rol: user.rol,
        });

    } catch (error: any) {
        // Required for Next.js redirect to work inside try/catch
        if (error.digest?.includes('NEXT_REDIRECT') || error.message?.includes('NEXT_REDIRECT')) {
            throw error;
        }
        console.error("Login crash:", error);
        return { error: "Error de conexión con la base de datos. Verifica tu configuración." };
    }

    redirect("/dashboard");
}

export async function logoutUser() {
    await logout();
    redirect("/login");
}

export async function getUsuarios() {
    return await db.query.usuarios.findMany({
        orderBy: (u: any, { asc }: any) => [asc(u.nombre)],
    });
}

export async function createUsuario(formData: FormData) {
    const nombre = formData.get("nombre") as string;
    const usuario = formData.get("usuario") as string;
    const password = formData.get("password") as string;
    const rol = formData.get("rol") as "ADMINISTRADOR" | "COORDINADOR" | "DOCENTE" | "ADMINISTRATIVO" | "OBRERO";
    const cedula = formData.get("cedula") as string;
    const grantAccess = formData.get("grantAccess") === "true";

    try {
        let hashedPassword = null;
        let finalUsuario = null;

        if (grantAccess) {
            if (!usuario || !password) return { success: false, error: "Usuario y contraseña requeridos para acceso" };
            hashedPassword = await bcrypt.hash(password, 10);
            finalUsuario = usuario;
        }

        await db.insert(usuarios).values({
            nombre,
            usuario: finalUsuario,
            password: hashedPassword,
            rol,
            cedula
        });
        revalidatePath("/dashboard/personal");
        revalidatePath("/dashboard/usuarios");
        return { success: true, message: "Personal registrado correctamente" };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Error al registrar personal" };
    }
}

export async function updateUsuario(id: string, formData: FormData) {
    const nombre = formData.get("nombre") as string;
    const usuario = formData.get("usuario") as string;
    const password = formData.get("password") as string;
    const rol = formData.get("rol") as "ADMINISTRADOR" | "COORDINADOR" | "DOCENTE" | "ADMINISTRATIVO" | "OBRERO";
    const cedula = formData.get("cedula") as string;
    const grantAccess = formData.get("grantAccess") === "true";

    try {
        const updateData: any = { nombre, rol, cedula };

        if (grantAccess) {
            if (usuario) updateData.usuario = usuario;
            if (password && password.trim() !== "") {
                updateData.password = await bcrypt.hash(password, 10);
            }
        } else {
            // Revoke access if unchecked? Or just ignore? 
            // For now, let's assume if grantAccess is false, we clear credentials?
            // Actually, usually users might want to keep credentials but disable access.
            // But based on the request "staff without access", we can clear them.
            updateData.usuario = null;
            updateData.password = null;
        }

        await db.update(usuarios).set(updateData).where(eq(usuarios.id, id));
        revalidatePath("/dashboard/personal");
        revalidatePath("/dashboard/usuarios");
        return { success: true, message: "Datos actualizados correctamente" };
    } catch (error) {
        return { success: false, error: "Error al actualizar datos" };
    }
}

export async function deleteUsuario(formData: FormData) {
    const session = await getSession();
    const userRole = session?.user?.rol;

    if (userRole !== "ADMINISTRADOR" && userRole !== "COORDINADOR") {
        return { error: "No autorizado" };
    }

    const id = formData.get("id") as string;

    // Evitar que el admin se borre a sí mismo por error (opcional pero recomendado)
    if (id === session.user.id) {
        return { error: "No puedes eliminar tu propia cuenta" };
    }

    try {
        await db.delete(usuarios).where(eq(usuarios.id, id));
        revalidatePath("/dashboard/usuarios");
        return { success: true, message: "Usuario eliminado" };
    } catch (e) {
        return { error: "Error al eliminar el usuario" };
    }
}

export async function deleteSeccion(formData: FormData) {
    const session = await getSession();
    const role = session?.user?.rol;
    if (role !== "ADMINISTRADOR" && role !== "COORDINADOR") {
        return { error: "No autorizado" };
    }

    const id = formData.get("id") as string;
    try {
        await db.delete(secciones).where(eq(secciones.id, id));
        revalidatePath("/dashboard/secciones");
        return { success: true, message: "Sección eliminada exitosamente" };
    } catch (e) {
        return { error: "Error al eliminar la sección" };
    }
}

export async function deleteMateria(formData: FormData) {
    const session = await getSession();
    const role = session?.user?.rol;
    if (role !== "ADMINISTRADOR" && role !== "COORDINADOR") {
        return { error: "No autorizado" };
    }

    const id = formData.get("id") as string;
    try {
        await db.delete(materias).where(eq(materias.id, id));
        revalidatePath("/dashboard/materias");
        return { success: true, message: "Materia eliminada exitosamente" };
    } catch (e) {
        return { error: "Error al eliminar la materia" };
    }
}

export async function deleteEstudiante(formData: FormData) {
    const session = await getSession();
    const role = session?.user?.rol;
    if (role !== "ADMINISTRADOR" && role !== "COORDINADOR") {
        return { error: "No autorizado" };
    }

    const id = formData.get("id") as string;
    const seccionId = formData.get("seccionId") as string;

    try {
        await db.delete(estudiantes).where(eq(estudiantes.id, id));
        revalidatePath(`/dashboard/secciones/${seccionId}/estudiantes`);
        return { success: true, message: "Estudiante eliminado exitosamente" };
    } catch (e) {
        return { error: "Error al eliminar el estudiante" };
    }
}

export async function upsertAsistenciaDocente(data: { docenteId: string; presente: boolean; observaciones?: string; fecha?: string; tipo?: string }) {
    const session = await getSession();
    if (!session || (session.user.rol !== "ADMINISTRADOR" && session.user.rol !== "COORDINADOR")) {
        return { error: "No autorizado" };
    }

    const fechaFinal = data.fecha || new Date().toISOString().split('T')[0];

    try {
        const existing = await db
            .select()
            .from(asistenciaDocentes)
            .where(
                and(
                    eq(asistenciaDocentes.docenteId, data.docenteId),
                    eq(asistenciaDocentes.fecha, fechaFinal)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            await db
                .update(asistenciaDocentes)
                .set({
                    presente: data.presente,
                    observaciones: data.observaciones || "",
                    tipo: data.presente ? null : (data.tipo || "INJUSTIFICADA"), // Clear tipo if present, else use provided or default
                    coordinadorId: session.user.id
                })
                .where(eq(asistenciaDocentes.id, existing[0].id));
        } else {
            await db.insert(asistenciaDocentes).values({
                docenteId: data.docenteId,
                coordinadorId: session.user.id,
                fecha: fechaFinal,
                presente: data.presente,
                observaciones: data.observaciones || "",
                tipo: data.presente ? null : (data.tipo || "INJUSTIFICADA"),
            });
        }

        revalidatePath("/dashboard/asistencia/personal");
        return { success: true, message: "Asistencia actualizada correctamente" };
    } catch (e) {
        return { error: "Error al registrar la asistencia" };
    }
}

export async function deleteAsistenciaDocente(docenteId: string, fecha: string) {
    const session = await getSession();
    if (!session || (session.user.rol !== "ADMINISTRADOR" && session.user.rol !== "COORDINADOR")) {
        return { error: "No autorizado" };
    }

    try {
        await db.delete(asistenciaDocentes)
            .where(
                and(
                    eq(asistenciaDocentes.docenteId, docenteId),
                    eq(asistenciaDocentes.fecha, fecha)
                )
            );

        revalidatePath("/dashboard/asistencia/personal");
        return { success: true, message: "Asistencia eliminada (reset)" };
    } catch (error) {
        return { success: false, error: "Error al eliminar asistencia" };
    }
}

export async function getAsistenciaPersonalReport(startDate: string, endDate: string) {
    const session = await getSession();
    if (session?.user?.rol !== "ADMINISTRADOR" && session?.user?.rol !== "COORDINADOR") {
        throw new Error("No autorizado");
    }

    try {
        const result = await db
            .select({
                fecha: asistenciaDocentes.fecha,
                docente: usuarios.nombre,
                rol: usuarios.rol,
                coordinador: sql<string>`(SELECT nombre FROM usuarios u2 WHERE u2.id = ${asistenciaDocentes.coordinadorId})`,
                observaciones: asistenciaDocentes.observaciones
            })
            .from(asistenciaDocentes)
            .innerJoin(usuarios, eq(asistenciaDocentes.docenteId, usuarios.id))
            .where(
                and(
                    eq(asistenciaDocentes.presente, false),
                    sql`${asistenciaDocentes.fecha} >= ${startDate}`,
                    sql`${asistenciaDocentes.fecha} <= ${endDate}`
                )
            )
            .orderBy(asistenciaDocentes.fecha);

        return result;
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function getAsistenciaAlumnosReport(startDate: string, endDate: string) {
    const session = await getSession();
    const role = session?.user?.rol;
    if (role !== "ADMINISTRADOR" && role !== "COORDINADOR" && role !== "DOCENTE") {
        throw new Error("No autorizado");
    }

    try {
        const result = await db
            .select({
                fecha: registrosAsistencia.fecha,
                estudiante: estudiantes.nombre,
                numeroLista: estudiantes.numeroLista,
                seccion: secciones.nombre,
                materia: materias.nombre,
                tema: registrosAsistencia.tema,
                docente: usuarios.nombre
            })
            .from(inasistenciasAlumnos)
            .innerJoin(registrosAsistencia, eq(inasistenciasAlumnos.registroId, registrosAsistencia.id))
            .innerJoin(estudiantes, eq(inasistenciasAlumnos.estudianteId, estudiantes.id))
            .innerJoin(secciones, eq(estudiantes.seccionId, secciones.id))
            .innerJoin(horarios, eq(registrosAsistencia.horarioId, horarios.id))
            .innerJoin(materias, eq(horarios.materiaId, materias.id))
            .innerJoin(usuarios, eq(horarios.docenteId, usuarios.id))
            .where(
                and(
                    sql`${registrosAsistencia.fecha} >= ${startDate}`,
                    sql`${registrosAsistencia.fecha} <= ${endDate}`
                )
            )
            .orderBy(registrosAsistencia.fecha);

        return result;
    } catch (e) {
        console.error(e);
        return [];
    }
}
export async function getMisInasistencias() {
    const session = await getSession();
    if (!session || !session.user) {
        throw new Error("No autorizado");
    }

    try {
        const result = await db
            .select({
                fecha: asistenciaDocentes.fecha,
                observaciones: asistenciaDocentes.observaciones,
                coordinador: usuarios.nombre
            })
            .from(asistenciaDocentes)
            .innerJoin(usuarios, eq(asistenciaDocentes.coordinadorId, usuarios.id))
            .where(
                and(
                    eq(asistenciaDocentes.docenteId, session.user.id),
                    eq(asistenciaDocentes.presente, false)
                )
            )
            .orderBy(asistenciaDocentes.fecha);

        return result;
    } catch (e) {
        console.error(e);
        return [];
    }
}
export async function getDashboardData() {
    const session = await getSession();
    if (!session) redirect("/login");

    const today = new Date().toISOString().split('T')[0];

    try {
        // 1. Estadísticas Generales
        const totalEstudiantesRes = await db.select({ count: sql<number>`count(*)` }).from(estudiantes).catch(() => [{ count: 0 }]);
        const totalDocentesRes = await db.select({ count: sql<number>`count(*)` }).from(usuarios).where(eq(usuarios.rol, "DOCENTE")).catch(() => [{ count: 0 }]);

        const totalEstudiantesCount = totalEstudiantesRes[0]?.count ?? 0;
        const totalDocentesCount = totalDocentesRes[0]?.count ?? 0;

        // Inasistencias de alumnos hoy
        const inasistenciasAlumnosHoyRes = await db
            .select({ count: sql<number>`count(*)` })
            .from(inasistenciasAlumnos)
            .innerJoin(registrosAsistencia, eq(inasistenciasAlumnos.registroId, registrosAsistencia.id))
            .where(eq(registrosAsistencia.fecha, today))
            .catch(() => [{ count: 0 }]);

        const inasistenciasAlumnosCount = inasistenciasAlumnosHoyRes[0]?.count ?? 0;

        // Docentes ausentes hoy
        const docentesAusentesHoy = await db
            .select({
                nombre: usuarios.nombre,
                id: usuarios.id
            })
            .from(asistenciaDocentes)
            .innerJoin(usuarios, eq(asistenciaDocentes.docenteId, usuarios.id))
            .where(
                and(
                    eq(asistenciaDocentes.fecha, today),
                    eq(asistenciaDocentes.presente, false)
                )
            )
            .catch(() => []);

        // Mis clases de hoy (si es docente)
        const diaSemanaMap: Record<number, string> = {
            0: "DOMINGO", 1: "LUNES", 2: "MARTES", 3: "MIERCOLES", 4: "JUEVES", 5: "VIERNES", 6: "SABADO"
        };

        const now = new Date();
        const options = { timeZone: "America/Caracas" };
        const venezuelaDateStr = now.toLocaleString("en-US", options);
        const venezuelaDate = new Date(venezuelaDateStr);
        const hoyDia = diaSemanaMap[venezuelaDate.getDay()];

        let misClases: any[] = [];
        if (session.user.id && (session.user.rol === "DOCENTE" || session.user.rol === "ADMINISTRATIVO" || session.user.rol === "OBRERO" || session.user.rol === "COORDINADOR")) {
            misClases = await db
                .select({
                    id: horarios.id,
                    seccion: secciones.nombre,
                    materia: materias.nombre,
                    descripcion: horarios.descripcion,
                    hora: sql<string>`${horarios.horaInicio} || ' - ' || ${horarios.horaFin}`,
                    estado: sql<string>`CASE WHEN EXISTS (SELECT 1 FROM ${registrosAsistencia} WHERE ${registrosAsistencia.horarioId} = ${horarios.id} AND ${registrosAsistencia.fecha} = ${today}) THEN 'Completado' ELSE 'Pendiente' END`
                })
                .from(horarios)
                .leftJoin(secciones, eq(horarios.seccionId, secciones.id))
                .leftJoin(materias, eq(horarios.materiaId, materias.id))
                .where(
                    and(
                        eq(horarios.docenteId, session.user.id),
                        eq(horarios.diaSemana, hoyDia as any)
                    )
                )
                .orderBy(horarios.horaInicio)
                .catch(() => []);
        }

        return {
            stats: {
                totalEstudiantes: totalEstudiantesCount,
                totalDocentes: totalDocentesCount,
                inasistenciasAlumnos: inasistenciasAlumnosCount,
                inasistenciasPersonal: docentesAusentesHoy.length,
                asistenciaPorcentaje: totalEstudiantesCount > 0
                    ? (((totalEstudiantesCount - inasistenciasAlumnosCount) / totalEstudiantesCount) * 100).toFixed(1) + "%"
                    : "0%"
            },
            docentesAusentes: docentesAusentesHoy,
            misClases
        };
    } catch (error) {
        console.error("Dashboard data error:", error);
        return {
            stats: { totalEstudiantes: 0, totalDocentes: 0, inasistenciasAlumnos: 0, inasistenciasPersonal: 0, asistenciaPorcentaje: "0%" },
            docentesAusentes: [],
            misClases: []
        };
    }
}

export async function getCurrentClass() {
    const session = await getSession();
    if (!session || !session.user) return null;

    const now = new Date();

    // Configurar fecha en zona horaria de Venezuela
    const options = { timeZone: "America/Caracas" };
    const venezuelaDateStr = now.toLocaleString("en-US", options);
    const venezuelaDate = new Date(venezuelaDateStr);

    const diaSemanaMap: Record<number, string> = {
        0: "DOMINGO", 1: "LUNES", 2: "MARTES", 3: "MIERCOLES", 4: "JUEVES", 5: "VIERNES", 6: "SABADO"
    };
    const hoyDia = diaSemanaMap[venezuelaDate.getDay()];

    // Format current time as HH:MM based on Venezuela Date
    const hours = venezuelaDate.getHours().toString().padStart(2, '0');
    const minutes = venezuelaDate.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    try {
        // Find a class that is currently happening or the next one regarding the current schedule logic
        // For simplicity, let's look for a class where current time is between start and end
        // Or just return the first class of the day if we want to default to something.
        // User request: "si ya el docente tiene una materia asignada y una hora de clase deben aparecer alli de una vez"

        const [claseActual] = await db
            .select({
                id: horarios.id,
                seccion: secciones.nombre,
                seccionId: horarios.seccionId,
                grado: secciones.grado,
                materia: materias.nombre,
                horaInicio: horarios.horaInicio,
                horaFin: horarios.horaFin
            })
            .from(horarios)
            .innerJoin(secciones, eq(horarios.seccionId, secciones.id))
            .innerJoin(materias, eq(horarios.materiaId, materias.id))
            .where(
                and(
                    eq(horarios.docenteId, session.user.id),
                    eq(horarios.diaSemana, hoyDia as any),
                    sql`${horarios.horaInicio} <= ${currentTime}`,
                    sql`${horarios.horaFin} >= ${currentTime}`
                )
            )
            .limit(1);

        if (claseActual) {
            return {
                ...claseActual,
                timeString: `${claseActual.horaInicio} - ${claseActual.horaFin}`
            };
        }

        return null;
    } catch (error) {
        console.error("Error getting current class:", error);
        return null;
    }
}

export async function bulkCreateEstudiantes(data: { nombre: string; numeroLista: number; genero: "HEMBRA" | "VARON"; cedula?: string; seccionId: string }[]) {
    try {
        if (data.length === 0) return { success: false, error: "No hay datos para importar" };

        const seccionId = data[0].seccionId;

        await db.insert(estudiantes).values(data.map(estudiante => ({
            nombre: estudiante.nombre,
            numeroLista: estudiante.numeroLista,
            genero: estudiante.genero,
            cedula: estudiante.cedula,
            seccionId: estudiante.seccionId
        })));

        revalidatePath(`/dashboard/secciones/${seccionId}/estudiantes`);
        return { success: true, message: `${data.length} estudiantes importados correctamente` };
    } catch (error) {
        console.error("Error bulk create:", error);
        return { success: false, error: "Error al importar estudiantes. Verifique los datos." };
    }
}

export async function bulkCreateUsuarios(data: { nombre: string; usuario?: string; password?: string; rol: "ADMINISTRADOR" | "COORDINADOR" | "DOCENTE" | "ADMINISTRATIVO" | "OBRERO"; cedula?: string }[]) {
    try {
        if (data.length === 0) return { success: false, error: "No hay datos para importar" };

        const preparedData = await Promise.all(
            data.map(async (u) => {
                let hashedPassword = null;
                if (u.password) {
                    hashedPassword = await bcrypt.hash(u.password, 10);
                }
                return {
                    nombre: u.nombre,
                    usuario: u.usuario || null,
                    password: hashedPassword,
                    rol: u.rol,
                    cedula: u.cedula
                };
            })
        );

        await db.insert(usuarios).values(preparedData).onConflictDoNothing({ target: usuarios.usuario });

        revalidatePath("/dashboard/usuarios");
        revalidatePath("/dashboard/personal");
        return { success: true, message: "Personal importado correctamente" };
    } catch (error) {
        console.error("Error bulk create usuarios:", error);
        return { success: false, error: "Error al importar personal." };
    }
}
