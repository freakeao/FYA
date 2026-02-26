"use server";

import { db } from "@/lib/db/db";
import { secciones, materias, estudiantes, horarios, registrosAsistencia, inasistenciasAlumnos, usuarios, asistenciaDocentes, departamentos, seccionesDocentes } from "@/lib/db/schema";
import { eq, and, sql, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { login, logout, getSession } from "./auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getVenezuelaDate, getVenezuelaDayOfWeek } from "./dateUtils";
const diaSemanaMap: Record<number, string> = {
    0: "DOMINGO", 1: "LUNES", 2: "MARTES", 3: "MIERCOLES", 4: "JUEVES", 5: "VIERNES", 6: "SABADO"
};

export async function getUserSession() {
    return await getSession();
}

// --- SECCIONES ---
export async function getSecciones() {
    const session = await getSession();
    const userRole = session?.user?.rol;
    const userDeptId = session?.user?.departamentoId;
    const isGlobalAdmin = userRole === "ADMINISTRADOR" || !userDeptId;

    const baseCols = {
        id: secciones.id,
        nombre: secciones.nombre,
        grado: secciones.grado,
        docenteGuia: usuarios.nombre,
        alumnosCount: sql<number>`(SELECT count(*) FROM ${estudiantes} WHERE ${estudiantes.seccionId} = ${secciones.id})`.mapWith(Number),
        materiasCount: sql<number>`(SELECT count(DISTINCT ${horarios.materiaId}) FROM ${horarios} WHERE ${horarios.seccionId} = ${secciones.id})`.mapWith(Number),
        docentesCount: sql<number>`(SELECT count(*) FROM ${seccionesDocentes} WHERE ${seccionesDocentes.seccionId} = ${secciones.id})`.mapWith(Number),
        departamentoId: secciones.departamentoId
    };

    // Re-implementing with safe pattern
    try {
        const results = await db.select(baseCols)
            .from(secciones)
            .leftJoin(usuarios, eq(secciones.docenteGuiaId, usuarios.id))
            .then((res: any) => res as any[]);

        return isGlobalAdmin ? results : results.filter((s: any) => String(s.departamentoId) === String(userDeptId));
    } catch (e: any) {
        // Fallback to legacy column
        try {
            const fallbackCols = { ...baseCols, departamentoId: sql<string>`departamento` };
            const results = await db.select(fallbackCols)
                .from(secciones)
                .leftJoin(usuarios, eq(secciones.docenteGuiaId, usuarios.id)) as any[];
            return isGlobalAdmin ? results : results.filter((s: any) => String(s.departamentoId) === String(userDeptId));
        } catch (e2) {
            // Final fallback
            const finalCols = { ...baseCols };
            delete (finalCols as any).departamentoId;
            return await db.select(finalCols)
                .from(secciones)
                .leftJoin(usuarios, eq(secciones.docenteGuiaId, usuarios.id));
        }
    }
}

export async function getSeccion(id: string) {
    const [result] = await db.select().from(secciones).where(eq(secciones.id, id));
    return result;
}

export async function createSeccion(data: { nombre: string; grado: string; docenteGuiaId?: string; departamentoId: string }) {
    try {
        const finalData = {
            ...data,
            docenteGuiaId: data.docenteGuiaId || null
        };
        await db.insert(secciones).values(finalData);
        revalidatePath("/dashboard/secciones");
        return { success: true, message: "Sección creada correctamente" };
    } catch (error) {
        console.error("Error al crear sección:", error);
        return { success: false, error: "Error al crear sección" };
    }
}

export async function updateSeccion(id: string, data: { nombre: string; grado: string; docenteGuiaId?: string; departamentoId: string }) {
    try {
        const finalData = {
            ...data,
            docenteGuiaId: data.docenteGuiaId || null
        };
        await db.update(secciones).set(finalData).where(eq(secciones.id, id));
        revalidatePath("/dashboard/secciones");
        return { success: true, message: "Sección actualizada correctamente" };
    } catch (error) {
        console.error("Error al actualizar sección:", error);
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

export async function bulkCreateMaterias(data: { nombre: string; codigo?: string; color?: string }[]) {
    try {
        if (data.length === 0) return { success: false, error: "No hay datos para cargar" };

        await db.insert(materias).values(data.map(m => ({
            nombre: m.nombre,
            codigo: m.codigo || null,
            color: m.color || "bg-primary"
        })));

        revalidatePath("/dashboard/materias");
        return { success: true, message: `${data.length} materias cargadas correctamente` };
    } catch (error) {
        console.error("Bulk create error:", error);
        return { success: false, error: "Error al cargar materias de forma masiva" };
    }
}

// --- ESTUDIANTES ---
export async function getEstudiantesBySeccion(seccionId: string) {
    return await db.select().from(estudiantes)
        .where(eq(estudiantes.seccionId, seccionId))
        .orderBy(estudiantes.numeroLista);
}

export async function addEstudiante(data: { nombre: string; seccionId: string; numeroLista: number; genero: "HEMBRA" | "VARON"; cedula?: string }) {
    try {
        await db.insert(estudiantes).values(data);
        revalidatePath(`/dashboard/secciones/${data.seccionId}/estudiantes`);
        return { success: true, message: "Estudiante registrado" };
    } catch (error) {
        return { success: false, error: "Error al registrar estudiante" };
    }
}

export async function updateEstudiante(id: string, data: { nombre: string; numeroLista: number; genero: "HEMBRA" | "VARON"; seccionId: string; cedula?: string }) {
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
    const result = await db.select({
        id: horarios.id,
        seccionId: horarios.seccionId,
        materiaId: horarios.materiaId,
        docenteId: horarios.docenteId,
        diaSemana: horarios.diaSemana,
        horaInicio: horarios.horaInicio,
        horaFin: horarios.horaFin,
        descripcion: horarios.descripcion,
        seccion: {
            id: secciones.id,
            nombre: secciones.nombre,
            grado: secciones.grado,
        },
        materia: {
            id: materias.id,
            nombre: materias.nombre,
            color: materias.color,
        },
        docente: {
            id: usuarios.id,
            nombre: usuarios.nombre,
        }
    })
        .from(horarios)
        .leftJoin(secciones, eq(horarios.seccionId, secciones.id))
        .leftJoin(materias, eq(horarios.materiaId, materias.id))
        .leftJoin(usuarios, eq(horarios.docenteId, usuarios.id))
        .where(eq(horarios.diaSemana, dia))
        .orderBy(horarios.horaInicio);

    return result;
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
    inasistencias: { estudianteId: string; observacion?: string }[];
}) {
    // Check if record already exists for this date and schedule
    const existing = await db.select()
        .from(registrosAsistencia)
        .where(
            and(
                eq(registrosAsistencia.horarioId, data.horarioId),
                eq(registrosAsistencia.fecha, data.fecha)
            )
        )
        .limit(1);

    let registroId: string;

    if (existing.length > 0) {
        // Update existing record
        registroId = existing[0].id;
        await db.update(registrosAsistencia).set({
            tema: data.tema,
            incidencias: data.incidencias,
            cantidadH: data.cantidadH,
            cantidadV: data.cantidadV,
            cantidadT: data.cantidadT,
        }).where(eq(registrosAsistencia.id, registroId));

        // Delete old inasistencias to replace them
        await db.delete(inasistenciasAlumnos).where(eq(inasistenciasAlumnos.registroId, registroId));
    } else {
        // Create new record
        const [registro] = await db.insert(registrosAsistencia).values({
            horarioId: data.horarioId,
            fecha: data.fecha,
            tema: data.tema,
            incidencias: data.incidencias,
            cantidadH: data.cantidadH,
            cantidadV: data.cantidadV,
            cantidadT: data.cantidadT,
        }).returning();
        registroId = registro.id;
    }

    if (data.inasistencias.length > 0) {
        await db.insert(inasistenciasAlumnos).values(
            data.inasistencias.map(ina => ({
                registroId: registroId,
                estudianteId: ina.estudianteId,
                observacion: ina.observacion,
            }))
        );
    }

    // --- AUTOMATIZACION: Marcar al docente como Presente ---
    try {
        const session = await getSession();
        if (session?.user?.id) {
            // Buscamos quién es el docente asignado a este horario
            const [horarioData] = await db.select({ docenteId: horarios.docenteId })
                .from(horarios)
                .where(eq(horarios.id, data.horarioId))
                .limit(1);

            if (horarioData?.docenteId) {
                // Realizamos el upsert de asistencia personal (Docente)
                const existingDocenteAsis = await db.select().from(asistenciaDocentes)
                    .where(and(
                        eq(asistenciaDocentes.docenteId, horarioData.docenteId),
                        eq(asistenciaDocentes.fecha, data.fecha)
                    )).limit(1);

                if (existingDocenteAsis.length > 0) {
                    await db.update(asistenciaDocentes).set({
                        presente: true,
                        observaciones: "Marcado automáticamente por registro de clase",
                        tipo: null,
                        coordinadorId: session.user.id
                    }).where(eq(asistenciaDocentes.id, existingDocenteAsis[0].id));
                } else {
                    await db.insert(asistenciaDocentes).values({
                        docenteId: horarioData.docenteId,
                        coordinadorId: session.user.id,
                        fecha: data.fecha,
                        presente: true,
                        observaciones: "Marcado automáticamente por registro de clase",
                        tipo: null,
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error en automatización de asistencia docente:", error);
        // No bloqueamos el registro de clase si falla el automarcado de personal
    }

    revalidatePath("/dashboard/asistencia");
    revalidatePath("/dashboard/asistencia/personal");
}

export async function getAsistenciaByClaseYFecha(horarioId: string, fecha: string) {
    try {
        const registro = await db.query.registrosAsistencia.findFirst({
            where: and(
                eq(registrosAsistencia.horarioId, horarioId),
                eq(registrosAsistencia.fecha, fecha)
            ),
            with: {
                inasistencias: true
            }
        });

        return registro || null;
    } catch (error) {
        return null;
    }
}

// --- AUTENTICACION ---
export async function loginUser(formData: FormData) {
    try {
        const usuario = (formData.get("usuario") as string)?.trim().toLowerCase();
        const password = formData.get("password") as string;

        if (!usuario || !password) {
            return { error: "Por favor, completa todos los campos" };
        }

        let user: any;
        try {
            const results = await db.select({
                id: usuarios.id,
                nombre: usuarios.nombre,
                usuario: usuarios.usuario,
                password: usuarios.password,
                rol: usuarios.rol,
                departamentoId: usuarios.departamentoId, // Seleccionamos explícitamente el ID
            }).from(usuarios).where(eq(usuarios.usuario, usuario));
            user = results[0];
        } catch (e) {
            // Fallback si falla el select específico
            const results = await db.select().from(usuarios).where(eq(usuarios.usuario, usuario));
            user = results[0];
        }

        if (!user || !user.password) {
            return { error: "Usuario no encontrado o sin acceso" };
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return { error: "Contraseña incorrecta" };
        }

        // Obtener departamentoId y nombre del departamento
        let deptId = user.departamentoId;
        let deptNombre = null;

        if (deptId) {
            try {
                const [d] = await db.select({ nombre: departamentos.nombre })
                    .from(departamentos)
                    .where(eq(departamentos.id, deptId));
                deptNombre = d?.nombre;
            } catch (e) {
                console.error("Error recuperando nombre del departamento:", e);
            }
        }

        await login({
            id: user.id,
            nombre: user.nombre,
            usuario: user.usuario,
            rol: user.rol,
            departamentoId: deptId,
            departamento: deptNombre, // Guardamos el nombre real para el dashboard
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

// --- DEPARTAMENTOS / COORDINACIONES ---
export async function getDepartamentos() {
    try {
        return await db.query.departamentos.findMany({
            orderBy: (d: any, { asc }: any) => [asc(d.nombre)],
        });
    } catch (e: any) {
        // Fallback for missing table
        const isMissingTable =
            e.code === '42P01' ||
            e.cause?.code === '42P01' ||
            e.message?.includes('relation "departamentos" does not exist') ||
            e.cause?.message?.includes('relation "departamentos" does not exist');

        if (isMissingTable) {
            return [
                { id: "MEDIA_GENERAL", nombre: "Media General", codigo: "MG" },
                { id: "MEDIA_BASICA", nombre: "Media Básica", codigo: "MB" },
                { id: "ADMINISTRACION", nombre: "Administración", codigo: "ADM" },
                { id: "DOCUMENTAL", nombre: "Documental", codigo: "DOC" },
                { id: "TODOS", nombre: "Todos", codigo: "ALL" }
            ];
        }
        console.error("Error al obtener departamentos:", e);
        return [];
    }
}

export async function createDepartamento(nombre: string, codigo?: string) {
    try {
        await db.insert(departamentos).values({ nombre, codigo });
        revalidatePath("/dashboard/personal");
        return { success: true, message: "Departamento creado correctamente" };
    } catch (error) {
        return { success: false, error: "Error al crear departamento" };
    }
}

export async function updateDepartamento(id: string, nombre: string, codigo?: string) {
    try {
        await db.update(departamentos).set({ nombre, codigo }).where(eq(departamentos.id, id));
        revalidatePath("/dashboard/personal");
        return { success: true, message: "Departamento actualizado correctamente" };
    } catch (error) {
        return { success: false, error: "Error al actualizar departamento" };
    }
}

// Helper to safely get departamentoId or departamento column
async function safeQuery(table: any, selectObj: any, whereClause?: any) {
    try {
        // Try with new column first
        let query = db.select(selectObj).from(table);
        if (whereClause) query = query.where(whereClause) as any;
        return await query;
    } catch (e: any) {
        // Fallback: If departamento_id fails, try mapping departamentoId to the 'departamento' column
        const isMissingColumn = e.code === '42703' || e.cause?.code === '42703' || e.message?.includes("departamento_id");
        if (isMissingColumn) {
            try {
                // Remove departamentoId from selectObj and add sql fragment
                const fallbackSelect = { ...selectObj };
                if (fallbackSelect.departamentoId) {
                    fallbackSelect.departamentoId = sql<string>`departamento`;
                }
                let query = db.select(fallbackSelect).from(table);
                if (whereClause) query = query.where(whereClause) as any;
                return await query;
            } catch (e2) {
                // Final fallback: remove departamento info entirely
                const finalSelect = { ...selectObj };
                delete finalSelect.departamentoId;
                let query = db.select(finalSelect).from(table);
                if (whereClause) query = query.where(whereClause) as any;
                return await query;
            }
        }
        throw e;
    }
}

export async function getUsuarios() {
    const session = await getSession();
    const userRole = session?.user?.rol;
    const userDeptId = session?.user?.departamentoId;
    const isGlobalAdmin = userRole === "ADMINISTRADOR" || !userDeptId;

    try {
        // Query with left join to get department name
        const allUsers = await db
            .select({
                id: usuarios.id,
                nombre: usuarios.nombre,
                usuario: usuarios.usuario,
                rol: usuarios.rol,
                cedula: usuarios.cedula,
                departamentoId: usuarios.departamentoId,
                departamento: {
                    id: departamentos.id,
                    nombre: departamentos.nombre,
                    codigo: departamentos.codigo
                }
            })
            .from(usuarios)
            .leftJoin(departamentos, eq(usuarios.departamentoId, departamentos.id));

        // Apply role-based filtering
        let filtered = allUsers;

        if (!isGlobalAdmin) {
            if (userRole === "COORDINADOR") {
                const depts = await getDepartamentos();
                const myDept = depts.find((d: any) => d.id === userDeptId);
                if (myDept?.codigo === "ADM" || myDept?.nombre.toUpperCase().includes("ADMINISTRACION")) {
                    filtered = allUsers.filter((u: any) => u.rol === "ADMINISTRATIVO" || u.rol === "OBRERO");
                } else {
                    filtered = allUsers.filter((u: any) =>
                        (u.rol === "DOCENTE" || u.rol === "COORDINADOR") &&
                        String(u.departamentoId) === String(userDeptId)
                    );
                }
            } else {
                filtered = allUsers.filter((u: any) =>
                    (u.rol === "DOCENTE" || u.rol === "COORDINADOR") &&
                    String(u.departamentoId) === String(userDeptId)
                );
            }
        }

        return filtered.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
    } catch (e) {
        console.error("Error en getUsuarios:", e);
        // Fallback to basic query without join
        const baseSelect: any = {
            id: usuarios.id,
            nombre: usuarios.nombre,
            usuario: usuarios.usuario,
            rol: usuarios.rol,
            cedula: usuarios.cedula,
            departamentoId: usuarios.departamentoId
        };
        const all = await safeQuery(usuarios, baseSelect);
        return all.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
    }
}

export async function createUsuario(formData: FormData) {
    const nombre = formData.get("nombre") as string;
    const usuario = formData.get("usuario") as string;
    const password = formData.get("password") as string;
    const rol = formData.get("rol") as any;
    const departamentoId = formData.get("departamentoId") as string;
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
            departamentoId: departamentoId || null,
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
    const rol = formData.get("rol") as any;
    const departamentoId = formData.get("departamentoId") as string;
    const cedula = formData.get("cedula") as string;
    const grantAccess = formData.get("grantAccess") === "true";

    try {
        const updateData: any = { nombre, rol, cedula, departamentoId: departamentoId || null };

        if (grantAccess) {
            if (usuario) updateData.usuario = usuario;
            if (password && password.trim() !== "") {
                updateData.password = await bcrypt.hash(password, 10);
            }
        } else {
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

export async function changeOwnPassword(formData: FormData) {
    const session = await getSession();
    if (!session || !session.user) return { success: false, error: "No autorizado" };

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!currentPassword || !newPassword) {
        return { success: false, error: "Todos los campos son obligatorios" };
    }

    try {
        const [user] = await db.select().from(usuarios).where(eq(usuarios.id, session.user.id));
        if (!user || !user.password) return { success: false, error: "Usuario no encontrado" };

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) return { success: false, error: "La contraseña actual es incorrecta" };

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.update(usuarios).set({ password: hashedPassword }).where(eq(usuarios.id, session.user.id));

        return { success: true, message: "Contraseña actualizada correctamente" };
    } catch (error) {
        console.error("Change password error:", error);
        return { success: false, error: "Error al cambiar la contraseña" };
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

// --- GESTION DOCENTES POR SECCION ---
export async function getDocentesBySeccion(seccionId: string) {
    const assignedDocentes = await db.select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        rol: usuarios.rol,
        cedula: usuarios.cedula,
        departamentoNombre: departamentos.nombre
    })
        .from(seccionesDocentes)
        .innerJoin(usuarios, eq(seccionesDocentes.docenteId, usuarios.id))
        .leftJoin(departamentos, eq(usuarios.departamentoId, departamentos.id))
        .where(eq(seccionesDocentes.seccionId, seccionId));

    // Obtener materias que da cada docente en esta sección desde los horarios
    const docentesConMaterias = await Promise.all(assignedDocentes.map(async (d: any) => {
        const materiasDocente = await db.select({
            nombre: materias.nombre
        })
            .from(horarios)
            .innerJoin(materias, eq(horarios.materiaId, materias.id))
            .where(and(
                eq(horarios.seccionId, seccionId),
                eq(horarios.docenteId, d.id)
            ));

        // Deduplicar materias
        const uniqueMaterias = Array.from(new Set(materiasDocente.map((m: any) => m.nombre)));

        return {
            ...d,
            materias: uniqueMaterias
        };
    }));

    return docentesConMaterias;
}

export async function assignDocenteToSeccion(seccionId: string, docenteId: string) {
    try {
        // Check if already assigned
        const existing = await db.select().from(seccionesDocentes)
            .where(and(eq(seccionesDocentes.seccionId, seccionId), eq(seccionesDocentes.docenteId, docenteId)))
            .limit(1);

        if (existing.length > 0) return { success: false, error: "El docente ya está asignado a esta sección" };

        await db.insert(seccionesDocentes).values({ seccionId, docenteId });
        revalidatePath(`/dashboard/secciones/${seccionId}/estudiantes`);
        return { success: true, message: "Docente asignado correctamente" };
    } catch (error) {
        return { success: false, error: "Error al asignar docente" };
    }
}

export async function removeDocenteFromSeccion(seccionId: string, docenteId: string) {
    try {
        await db.delete(seccionesDocentes)
            .where(and(eq(seccionesDocentes.seccionId, seccionId), eq(seccionesDocentes.docenteId, docenteId)));
        revalidatePath(`/dashboard/secciones/${seccionId}/estudiantes`);
        return { success: true, message: "Docente removido correctamente" };
    } catch (error) {
        return { success: false, error: "Error al remover docente" };
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

    const fechaFinal = data.fecha || getVenezuelaDate();

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
                genero: estudiantes.genero,
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

    const today = getVenezuelaDate();
    const userRole = session.user.rol;
    const userDept = session.user.departamento || "MEDIA_GENERAL"; // Fallback
    const isGlobalAdmin = userRole === "ADMINISTRADOR" || userDept === "TODOS";
    const isAdministrativeCoord = userDept === "ADMINISTRACION";

    // Calcular día de la semana actual
    const now = new Date();
    const options = { timeZone: "America/Caracas" };
    const venezuelaDateStr = now.toLocaleString("en-US", options);
    const venezuelaDate = new Date(venezuelaDateStr);
    const hoyDia = diaSemanaMap[venezuelaDate.getDay()];

    try {
        // --- ADMINISTRATIVE COORDINATION VIEW ---
        if (isAdministrativeCoord) {
            // Logic for Administrative Coordinator (Staff only, no students)
            const staffRoles = ["ADMINISTRATIVO", "OBRERO"];

            const [totalPersonalRes, personalAusenteRes] = await Promise.all([
                db.select({ count: count() })
                    .from(usuarios)
                    .where(sql`${usuarios.rol} IN ${staffRoles}`)
                    .catch(() => [{ count: 0 }]),

                db.select({ count: count() })
                    .from(asistenciaDocentes)
                    .innerJoin(usuarios, eq(asistenciaDocentes.docenteId, usuarios.id))
                    .where(and(
                        eq(asistenciaDocentes.fecha, today),
                        eq(asistenciaDocentes.presente, false),
                        sql`${usuarios.rol} IN ${staffRoles}`
                    ))
                    .catch(() => [{ count: 0 }])
            ]);

            const totalPersonal = Number(totalPersonalRes[0]?.count ?? 0);
            const personalAusente = Number(personalAusenteRes[0]?.count ?? 0);
            const personalPresente = Math.max(0, totalPersonal - personalAusente);

            // Percentage calculation
            const porcentajeAsistencia = totalPersonal > 0
                ? ((personalPresente / totalPersonal) * 100).toFixed(1) + "%"
                : "0%";

            return {
                viewType: "ADMINISTRATIVE", // Flag for UI
                stats: {
                    matricula: { total: totalPersonal, hombres: 0, mujeres: 0, label: "Total Personal" },
                    asistenciaHoy: {
                        presentes: personalPresente,
                        ausentes: personalAusente,
                        porcentaje: porcentajeAsistencia,
                        label: "Asistencia Personal"
                    },
                    reporteDocentes: { totalDocentes: 0, docentesReportaron: 0, docentesSinReporte: 0, porcentajeReporte: "0%", estudiantesSinReporte: 0 },
                    inasistenciasPersonal: personalAusente
                },
                docentesAusentes: [], // Or fetch specific staff absences list to show
                clasesHoy: [],
                listaAusentesAlumnos: [],
                listaDocentesPendientes: []
            };
        }

        // --- ACADEMIC COORDINATION VIEW (MEDIA GENERAL / MEDIA BASICA / GLOBAL) ---

        const userDeptId = session?.user?.departamentoId;

        // Helper filter for sections based on department
        // Si es Admin o no tiene depto, ve todo. Si no, filtra por su departamentoId.
        const sectionFilter = (isGlobalAdmin || !userDeptId)
            ? sql`1=1`
            : eq(secciones.departamentoId, userDeptId);

        // 1. Matrícula por género (total matriculados)
        const [estudiantesVaronesRes, estudiantesHembrasRes] = await Promise.all([
            db.select({ count: count() })
                .from(estudiantes)
                .innerJoin(secciones, eq(estudiantes.seccionId, secciones.id))
                .where(and(
                    eq(estudiantes.genero, "VARON"),
                    sectionFilter
                ))
                .catch(() => [{ count: 0 }] as any[]),
            db.select({ count: count() })
                .from(estudiantes)
                .innerJoin(secciones, eq(estudiantes.seccionId, secciones.id))
                .where(and(
                    eq(estudiantes.genero, "HEMBRA"),
                    sectionFilter
                ))
                .catch(() => [{ count: 0 }] as any[])
        ]);

        const totalVarones = Number(estudiantesVaronesRes[0]?.count ?? 0);
        const totalHembras = Number(estudiantesHembrasRes[0]?.count ?? 0);
        const totalEstudiantesCount = totalVarones + totalHembras;

        // 1.5. Estudiantes con clases HOY
        const [estudiantesConClasesHoyVaronesRes, estudiantesConClasesHoyHembrasRes] = await Promise.all([
            db
                .selectDistinct({ id: estudiantes.id })
                .from(estudiantes)
                .innerJoin(secciones, eq(estudiantes.seccionId, secciones.id))
                .innerJoin(horarios, eq(horarios.seccionId, secciones.id))
                .where(and(
                    eq(horarios.diaSemana, hoyDia as any),
                    eq(estudiantes.genero, "VARON"),
                    sectionFilter
                ))
                .catch(() => []),
            db
                .selectDistinct({ id: estudiantes.id })
                .from(estudiantes)
                .innerJoin(secciones, eq(estudiantes.seccionId, secciones.id))
                .innerJoin(horarios, eq(horarios.seccionId, secciones.id))
                .where(and(
                    eq(horarios.diaSemana, hoyDia as any),
                    eq(estudiantes.genero, "HEMBRA"),
                    sectionFilter
                ))
                .catch(() => [])
        ]);

        const estudiantesConClasesHoyVarones = estudiantesConClasesHoyVaronesRes.length;
        const estudiantesConClasesHoyHembras = estudiantesConClasesHoyHembrasRes.length;
        const totalEstudiantesConClasesHoy = estudiantesConClasesHoyVarones + estudiantesConClasesHoyHembras;

        // 2. Asistencia del día basada en reportes reales (con género)
        // Need to join Horario -> Seccion to filter by Dept
        const [presentesHoyRes] = await db
            .select({
                totalHembras: sql<number>`COALESCE(SUM(${registrosAsistencia.cantidadH}), 0)`,
                totalVarones: sql<number>`COALESCE(SUM(${registrosAsistencia.cantidadV}), 0)`,
                totalPresentes: sql<number>`COALESCE(SUM(${registrosAsistencia.cantidadT}), 0)`
            })
            .from(registrosAsistencia)
            .innerJoin(horarios, eq(registrosAsistencia.horarioId, horarios.id))
            .innerJoin(secciones, eq(horarios.seccionId, secciones.id))
            .where(and(
                eq(registrosAsistencia.fecha, today),
                sectionFilter
            ))
            .catch(() => [{ totalHembras: 0, totalVarones: 0, totalPresentes: 0 }]);

        const presentesHembras = Number(presentesHoyRes?.totalHembras ?? 0);
        const presentesVarones = Number(presentesHoyRes?.totalVarones ?? 0);
        const presentesTotal = Number(presentesHoyRes?.totalPresentes ?? 0);

        // 3. Inasistencias por género
        const [inasistenciasVaronesRes, inasistenciasHembrasRes] = await Promise.all([
            db
                .select({ count: count() })
                .from(inasistenciasAlumnos)
                .innerJoin(estudiantes, eq(inasistenciasAlumnos.estudianteId, estudiantes.id))
                .innerJoin(secciones, eq(estudiantes.seccionId, secciones.id)) // Filter join
                .innerJoin(registrosAsistencia, eq(inasistenciasAlumnos.registroId, registrosAsistencia.id))
                .where(and(
                    eq(registrosAsistencia.fecha, today),
                    eq(estudiantes.genero, "VARON"),
                    sectionFilter
                ))
                .catch(() => [{ count: 0 }]),
            db
                .select({ count: count() })
                .from(inasistenciasAlumnos)
                .innerJoin(estudiantes, eq(inasistenciasAlumnos.estudianteId, estudiantes.id))
                .innerJoin(secciones, eq(estudiantes.seccionId, secciones.id)) // Filter join
                .innerJoin(registrosAsistencia, eq(inasistenciasAlumnos.registroId, registrosAsistencia.id))
                .where(and(
                    eq(registrosAsistencia.fecha, today),
                    eq(estudiantes.genero, "HEMBRA"),
                    sectionFilter
                ))
                .catch(() => [{ count: 0 }])
        ]);

        const ausentesVarones = Number(inasistenciasVaronesRes[0]?.count ?? 0);
        const ausentesHembras = Number(inasistenciasHembrasRes[0]?.count ?? 0);
        const ausentesTotal = ausentesVarones + ausentesHembras;

        // 4. Docentes que reportaron hoy
        // Filter classes by dept

        const [
            docentesConClasesHoyRes,
            docentesReportaronRes,
            docentesAusentesHoy,
            listaAusentesAlumnos,
            listaDocentesPendientes
        ] = await Promise.all([
            // Docentes con clases HOY en este Dept
            db
                .selectDistinct({ docenteId: horarios.docenteId })
                .from(horarios)
                .innerJoin(secciones, eq(horarios.seccionId, secciones.id))
                .where(and(
                    eq(horarios.diaSemana, hoyDia as any),
                    sectionFilter
                ))
                .catch(() => [] as any[]),
            // Docentes que reportaron hoy en este Dept
            db
                .selectDistinct({ docenteId: horarios.docenteId })
                .from(registrosAsistencia)
                .innerJoin(horarios, eq(registrosAsistencia.horarioId, horarios.id))
                .innerJoin(secciones, eq(horarios.seccionId, secciones.id))
                .where(and(
                    eq(registrosAsistencia.fecha, today),
                    sectionFilter
                ))
                .catch(() => [] as any[]),
            db
                .select({
                    nombre: usuarios.nombre,
                    id: usuarios.id
                })
                .from(asistenciaDocentes)
                .innerJoin(usuarios, eq(asistenciaDocentes.docenteId, usuarios.id))
                .where(
                    and(
                        eq(asistenciaDocentes.fecha, today),
                        eq(asistenciaDocentes.presente, false),
                        (isGlobalAdmin || !userDeptId) ? sql`1=1` : eq(usuarios.departamentoId, userDeptId)
                    )
                )
                .catch(() => [] as any[]),
            // LISTA: Alumnos ausentes detallados
            db
                .select({
                    id: estudiantes.id,
                    nombre: estudiantes.nombre,
                    seccion: secciones.nombre,
                    genero: estudiantes.genero
                })
                .from(inasistenciasAlumnos)
                .innerJoin(estudiantes, eq(inasistenciasAlumnos.estudianteId, estudiantes.id))
                .innerJoin(secciones, eq(estudiantes.seccionId, secciones.id))
                .innerJoin(registrosAsistencia, eq(inasistenciasAlumnos.registroId, registrosAsistencia.id))
                .where(and(
                    eq(registrosAsistencia.fecha, today),
                    sectionFilter
                ))
                .catch(() => []),
            // LISTA: Docentes con clases pendientes (sin reporte)
            db
                .select({
                    id: horarios.id,
                    docente: usuarios.nombre,
                    materia: materias.nombre,
                    seccion: secciones.nombre,
                    hora: sql<string>`cast(${horarios.horaInicio} as text) || ' - ' || cast(${horarios.horaFin} as text)`
                })
                .from(horarios)
                .innerJoin(usuarios, eq(horarios.docenteId, usuarios.id))
                .innerJoin(materias, eq(horarios.materiaId, materias.id))
                .innerJoin(secciones, eq(horarios.seccionId, secciones.id))
                .where(and(
                    eq(horarios.diaSemana, hoyDia as any),
                    sectionFilter,
                    sql`NOT EXISTS (
                        SELECT 1 FROM ${registrosAsistencia} 
                        WHERE ${registrosAsistencia.horarioId} = ${horarios.id} 
                        AND ${registrosAsistencia.fecha} = ${today}
                    )`
                ))
                .catch(() => [])
        ]);

        const totalDocentesConClasesHoy = docentesConClasesHoyRes.length;
        const docentesReportaronCount = docentesReportaronRes.length;
        const docentesSinReporteCount = totalDocentesConClasesHoy - docentesReportaronCount;

        const totalReportados = presentesTotal + ausentesTotal;
        const asistenciaPorcentaje = totalReportados > 0
            ? ((presentesTotal / totalReportados) * 100).toFixed(1) + "%"
            : "0%";

        const estudiantesSinReporte = Math.max(0, totalEstudiantesConClasesHoy - totalReportados);

        // 6. Actividad de Clases
        let clasesHoy: any[] = [];
        const query = db
            .select({
                id: horarios.id,
                seccion: secciones.nombre,
                grado: secciones.grado,
                materia: materias.nombre,
                docente: usuarios.nombre,
                descripcion: horarios.descripcion,
                hora: sql<string>`cast(${horarios.horaInicio} as text) || ' - ' || cast(${horarios.horaFin} as text)`,
                estado: sql<string>`CASE WHEN EXISTS (SELECT 1 FROM ${registrosAsistencia} WHERE ${registrosAsistencia.horarioId} = ${horarios.id} AND ${registrosAsistencia.fecha} = ${today}) THEN 'Completado' ELSE 'Pendiente' END`
            })
            .from(horarios)
            .leftJoin(secciones, eq(horarios.seccionId, secciones.id))
            .leftJoin(materias, eq(horarios.materiaId, materias.id))
            .leftJoin(usuarios, eq(horarios.docenteId, usuarios.id))
            .where(
                and(
                    eq(horarios.diaSemana, hoyDia as any),
                    userRole === "DOCENTE" ? eq(horarios.docenteId, session.user.id) : sectionFilter
                )
            )
            .orderBy(horarios.horaInicio);

        clasesHoy = await query.catch(() => []);

        return {
            viewType: "ACADEMIC",
            stats: {
                matricula: {
                    total: totalEstudiantesCount,
                    hombres: totalVarones,
                    mujeres: totalHembras
                },
                asistenciaHoy: {
                    presentes: presentesTotal,
                    presentesHombres: presentesVarones,
                    presentesMujeres: presentesHembras,
                    presentesH: presentesVarones,
                    presentesV: presentesHembras,
                    ausentes: ausentesTotal,
                    ausentesHombres: ausentesVarones,
                    ausentesMujeres: ausentesHembras,
                    ausentesH: ausentesVarones,
                    ausentesV: ausentesHembras,
                    porcentaje: asistenciaPorcentaje,
                    totalConClasesHoy: totalEstudiantesConClasesHoy,
                    conClasesHoyHombres: estudiantesConClasesHoyVarones,
                    conClasesHoyMujeres: estudiantesConClasesHoyHembras
                },
                reporteDocentes: {
                    totalDocentes: totalDocentesConClasesHoy,
                    docentesReportaron: docentesReportaronCount,
                    docentesSinReporte: docentesSinReporteCount,
                    estudiantesSinReporte: estudiantesSinReporte,
                    porcentajeReporte: totalDocentesConClasesHoy > 0
                        ? ((docentesReportaronCount / totalDocentesConClasesHoy) * 100).toFixed(1) + "%"
                        : "0%"
                },
                inasistenciasPersonal: docentesAusentesHoy.length
            },
            docentesAusentes: docentesAusentesHoy,
            clasesHoy,
            listaAusentesAlumnos,
            listaDocentesPendientes: userRole === "DOCENTE" ? [] : listaDocentesPendientes
        };
    } catch (error) {
        console.error("Dashboard data error:", error);
        return {
            viewType: "ERROR",
            stats: {
                matricula: { total: 0, hombres: 0, mujeres: 0 },
                asistenciaHoy: {
                    presentes: 0, presentesHombres: 0, presentesMujeres: 0,
                    ausentes: 0, ausentesHombres: 0, ausentesMujeres: 0,
                    porcentaje: "0%"
                },
                reporteDocentes: { totalDocentes: 0, docentesReportaron: 0, docentesSinReporte: 0, porcentajeReporte: "0%" },
                inasistenciasPersonal: 0
            },
            docentesAusentes: [],
            misClases: [] // Legacy compat
        };
    }
}

export async function getCurrentClass() {
    const session = await getSession();
    if (!session || !session.user) return null;

    const now = new Date();
    const options = { timeZone: "America/Caracas" };
    const venezuelaDateStr = now.toLocaleString("en-US", options);
    const venezuelaDate = new Date(venezuelaDateStr);
    const hoyDia = diaSemanaMap[venezuelaDate.getDay()];
    const hours = venezuelaDate.getHours().toString().padStart(2, '0');
    const minutes = venezuelaDate.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    try {
        const isStaff = session.user.rol === "ADMINISTRADOR" || session.user.rol === "COORDINADOR";

        const query = db
            .select({
                id: horarios.id,
                seccion: secciones.nombre,
                seccionId: horarios.seccionId,
                grado: secciones.grado,
                materia: materias.nombre,
                docente: usuarios.nombre,
                horaInicio: horarios.horaInicio,
                horaFin: horarios.horaFin
            })
            .from(horarios)
            .innerJoin(secciones, eq(horarios.seccionId, secciones.id))
            .innerJoin(materias, eq(horarios.materiaId, materias.id))
            .innerJoin(usuarios, eq(horarios.docenteId, usuarios.id))
            .where(
                and(
                    eq(horarios.diaSemana, hoyDia as any),
                    sql`${horarios.horaInicio} <= ${currentTime}`,
                    sql`${horarios.horaFin} >= ${currentTime}`,
                    isStaff ? sql`1=1` : eq(horarios.docenteId, session.user.id)
                )
            )
            .limit(1);

        const [claseActual] = await query;

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

export async function bulkCreateUsuarios(data: {
    nombre: string;
    usuario?: string;
    password?: string;
    rol: "ADMINISTRADOR" | "COORDINADOR" | "DOCENTE" | "ADMINISTRATIVO" | "OBRERO";
    cedula?: string;
    departamento?: string; // Name or code
    grantAccess?: boolean;
}[]) {
    try {
        if (data.length === 0) return { success: false, error: "No hay datos para importar" };

        // Pre-fetch departments to map names to IDs
        const allDepts = await db.query.departamentos.findMany();

        const preparedData = await Promise.all(
            data.map(async (u) => {
                let hashedPassword = null;
                let finalUsuario = u.usuario || null;

                // Explicit grantAccess check from file or presence of credentials
                const hasAccess = u.grantAccess ?? (!!u.usuario && !!u.password);

                if (hasAccess && u.password) {
                    hashedPassword = await bcrypt.hash(u.password, 10);
                } else {
                    finalUsuario = null;
                    hashedPassword = null;
                }

                // Map departamento name/code to ID
                let deptId = null;
                if (u.departamento) {
                    const dept = allDepts.find((d: any) =>
                        d.nombre.toLowerCase() === u.departamento?.toLowerCase() ||
                        d.codigo?.toLowerCase() === u.departamento?.toLowerCase()
                    );
                    deptId = dept?.id || null;
                }

                return {
                    nombre: u.nombre,
                    usuario: finalUsuario,
                    password: hashedPassword,
                    rol: u.rol,
                    cedula: u.cedula || null,
                    departamentoId: deptId
                };
            })
        );

        // Filter out existing users by Cédula or Usuario if they exist? 
        // For simplicity, using onConflictDoNothing on 'usuario'. 
        // Note: If no 'usuario', it might duplicate. Cedric recommends checking Cedula too if applicable.
        await db.insert(usuarios).values(preparedData).onConflictDoNothing({ target: usuarios.usuario });

        revalidatePath("/dashboard/usuarios");
        revalidatePath("/dashboard/personal");
        return { success: true, message: `${preparedData.length} registros procesados correctamente` };
    } catch (error) {
        console.error("Error bulk create usuarios:", error);
        return { success: false, error: "Error al importar personal." };
    }
}

export async function getClassesByDate(dateStr: string) {
    const session = await getSession();
    if (!session || !session.user) return [];

    // Parse the input date (expected format YYYY-MM-DD)
    const dateObj = new Date(dateStr + 'T12:00:00');
    const hoyDia = diaSemanaMap[dateObj.getDay()];

    try {
        const isStaff = session.user.rol === "ADMINISTRADOR" || session.user.rol === "COORDINADOR";

        const misClases = await db
            .select({
                id: horarios.id,
                seccion: secciones.nombre,
                seccionId: horarios.seccionId,
                grado: secciones.grado,
                materia: materias.nombre,
                docente: usuarios.nombre,
                horaInicio: horarios.horaInicio,
                horaFin: horarios.horaFin,
                timeString: sql<string>`${horarios.horaInicio} || ' - ' || ${horarios.horaFin}`,
                // Check if attendance exists for THIS specific date
                estado: sql<string>`CASE WHEN EXISTS (SELECT 1 FROM ${registrosAsistencia} WHERE ${registrosAsistencia.horarioId} = ${horarios.id} AND ${registrosAsistencia.fecha} = ${dateStr}) THEN 'Completado' ELSE 'Pendiente' END`
            })
            .from(horarios)
            .innerJoin(secciones, eq(horarios.seccionId, secciones.id))
            .innerJoin(materias, eq(horarios.materiaId, materias.id))
            .innerJoin(usuarios, eq(horarios.docenteId, usuarios.id))
            .where(
                and(
                    eq(horarios.diaSemana, hoyDia as any),
                    isStaff ? sql`1=1` : eq(horarios.docenteId, session.user.id)
                )
            )
            .orderBy(horarios.horaInicio);

        // Filter valid classes for that day based on day of week enum
        // (Calculated above via hoyDia)

        return misClases;
    } catch (error) {
        console.error("Error fetching classes by date:", error);
        return [];
    }
}

export async function getPendingClasses(days: number = 7) {
    const session = await getSession();
    // Only for admins/coordinators
    if (!session || (session.user.rol !== "ADMINISTRADOR" && session.user.rol !== "COORDINADOR")) return [];

    const result = [];
    const today = new Date();

    // Loop back 'days' days
    for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayOfWeek = diaSemanaMap[d.getDay()];

        // Skip calling if dayOfWeek is undefined (e.g. if map is incomplete, though it shouldn't be)
        if (!dayOfWeek) continue;

        try {
            const missed = await db
                .select({
                    id: horarios.id,
                    seccion: secciones.nombre,
                    seccionId: horarios.seccionId,
                    grado: secciones.grado,
                    materia: materias.nombre,
                    docente: usuarios.nombre,
                    horaInicio: horarios.horaInicio,
                    date: sql<string>`${dateStr}`,
                })
                .from(horarios)
                .innerJoin(secciones, eq(horarios.seccionId, secciones.id))
                .innerJoin(materias, eq(horarios.materiaId, materias.id))
                .innerJoin(usuarios, eq(horarios.docenteId, usuarios.id))
                .where(
                    and(
                        eq(horarios.diaSemana, dayOfWeek as any),
                        sql`NOT EXISTS (
                            SELECT 1 FROM ${registrosAsistencia} 
                            WHERE ${registrosAsistencia.horarioId} = ${horarios.id} 
                            AND ${registrosAsistencia.fecha} = ${dateStr}
                        )`
                    )
                );

            if (missed.length > 0) {
                result.push(...missed);
            }
        } catch (e) {
            console.error(e);
        }
    }

    return result;
}

export async function bulkCreateHorarios(data: {
    docenteId: string;
    seccionId: string;
    materiaId?: string;
    diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES";
    horaInicio: string;
    horaFin: string;
    descripcion?: string;
}[]) {
    try {
        if (data.length === 0) return { success: false, error: "No hay datos para importar" };

        await db.insert(horarios).values(data.map(h => ({
            docenteId: h.docenteId,
            seccionId: h.seccionId,
            materiaId: h.materiaId || null,
            diaSemana: h.diaSemana as any,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin,
            descripcion: h.descripcion || null,
        })));

        revalidatePath("/dashboard/horarios");
        return { success: true, message: `${data.length} horarios importados correctamente` };
    } catch (error) {
        console.error("Bulk create horarios error:", error);
        return { success: false, error: "Error al importar horarios de forma masiva" };
    }
}

export async function autoCreateDocentesFromNames(names: string[]): Promise<{ success: boolean; created: { nombre: string; id: string }[]; error?: string }> {
    try {
        if (names.length === 0) return { success: true, created: [] };

        // Fetch ALL existing users to check for duplicates
        const existingUsers = await db.select({ id: usuarios.id, nombre: usuarios.nombre }).from(usuarios);

        const normalize = (text: string) => text
            .toUpperCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Z0-9\s]/g, "")
            .trim();

        const created: { nombre: string; id: string }[] = [];

        for (const name of names) {
            const nameNorm = normalize(name);

            // Check if any existing user matches this name (fuzzy)
            const existing = (existingUsers as any[]).find((u: any) => {
                const uNorm = normalize(u.nombre);
                if (uNorm === nameNorm) return true;
                // Check if all significant parts match
                const nameParts = nameNorm.split(/\s+/).filter(p => p.length > 2);
                const matchCount = nameParts.filter(p => uNorm.includes(p)).length;
                return matchCount >= 2 || (nameParts.length === 1 && uNorm.includes(nameParts[0]));
            });

            if (existing) {
                // Already exists, use existing ID
                created.push({ nombre: existing.nombre, id: existing.id });
            } else {
                // Create new user
                const [inserted] = await db.insert(usuarios).values({
                    nombre: name,
                    rol: "DOCENTE" as any,
                }).returning({ id: usuarios.id, nombre: usuarios.nombre });

                if (inserted) {
                    created.push({ nombre: inserted.nombre, id: inserted.id });
                    // Add to existingUsers so subsequent names don't duplicate
                    existingUsers.push({ id: inserted.id, nombre: inserted.nombre });
                }
            }
        }

        revalidatePath("/dashboard/usuarios");
        revalidatePath("/dashboard/personal");
        return { success: true, created };
    } catch (error) {
        console.error("Auto create docentes error:", error);
        return { success: false, created: [], error: "Error al crear docentes automáticamente" };
    }
}
