import { pgTable, text, uuid, timestamp, integer, boolean, pgEnum, time, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const rolEnum = pgEnum("rol", ["ADMINISTRADOR", "COORDINADOR", "DOCENTE", "ADMINISTRATIVO", "OBRERO"]);
export const generoEnum = pgEnum("genero", ["HEMBRA", "VARON"]);
export const diaSemanaEnum = pgEnum("dia_semana", ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"]);

export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
  usuario: text("usuario").unique(), // Nullable for staff without access
  password: text("password"), // Nullable
  rol: rolEnum("rol").notNull(),
  cedula: text("cedula"), // Cédula de identidad
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const secciones = pgTable("secciones", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
  grado: text("grado").notNull(),
  docenteGuiaId: uuid("docente_guia_id").references(() => usuarios.id, { onDelete: "set null" }),
});

export const estudiantes = pgTable("estudiantes", {
  id: uuid("id").primaryKey().defaultRandom(),
  seccionId: uuid("seccion_id").references(() => secciones.id, { onDelete: "cascade" }).notNull(),
  nombre: text("nombre").notNull(),
  numeroLista: integer("numero_lista").notNull(),
  genero: generoEnum("genero").notNull(),
  cedula: text("cedula"), // ID escolar / Cédula
});

export const materias = pgTable("materias", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
  codigo: text("codigo"),
  color: text("color"),
});

export const horarios = pgTable("horarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  seccionId: uuid("seccion_id").references(() => secciones.id, { onDelete: "cascade" }),
  materiaId: uuid("materia_id").references(() => materias.id, { onDelete: "cascade" }),
  docenteId: uuid("docente_id").references(() => usuarios.id, { onDelete: "cascade" }).notNull(),
  diaSemana: diaSemanaEnum("dia_semana").notNull(),
  horaInicio: time("hora_inicio").notNull(),
  horaFin: time("hora_fin").notNull(),
  descripcion: text("descripcion"),
});

export const registrosAsistencia = pgTable("registros_asistencia", {
  id: uuid("id").primaryKey().defaultRandom(),
  horarioId: uuid("horario_id").references(() => horarios.id, { onDelete: "cascade" }).notNull(),
  fecha: date("fecha").notNull(),
  tema: text("tema"),
  incidencias: text("incidencias"),
  cantidadH: integer("cantidad_h").default(0).notNull(),
  cantidadV: integer("cantidad_v").default(0).notNull(),
  cantidadT: integer("cantidad_t").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inasistenciasAlumnos = pgTable("inasistencias_alumnos", {
  id: uuid("id").primaryKey().defaultRandom(),
  registroId: uuid("registro_id").references(() => registrosAsistencia.id, { onDelete: "cascade" }).notNull(),
  estudianteId: uuid("estudiante_id").references(() => estudiantes.id, { onDelete: "cascade" }).notNull(),
  observacion: text("observacion"),
});

export const asistenciaDocentes = pgTable("asistencia_docentes", {
  id: uuid("id").primaryKey().defaultRandom(),
  docenteId: uuid("docente_id").references(() => usuarios.id).notNull(),
  coordinadorId: uuid("coordinador_id").references(() => usuarios.id).notNull(),
  fecha: date("fecha").notNull(),
  presente: boolean("presente").default(true).notNull(),
  observaciones: text("observaciones"),
  tipo: text("tipo"), // INJUSTIFICADA, REPOSO_MEDICO, PERMISO_PERSONAL, OTRO
});

// --- RELATIONS ---

export const usuariosRelations = relations(usuarios, ({ many }) => ({
  secciones: many(secciones),
  horarios: many(horarios),
}));

export const seccionesRelations = relations(secciones, ({ one, many }) => ({
  docenteGuia: one(usuarios, {
    fields: [secciones.docenteGuiaId],
    references: [usuarios.id],
  }),
  estudiantes: many(estudiantes),
  horarios: many(horarios),
}));

export const estudiantesRelations = relations(estudiantes, ({ one, many }) => ({
  seccion: one(secciones, {
    fields: [estudiantes.seccionId],
    references: [secciones.id],
  }),
  inasistencias: many(inasistenciasAlumnos),
}));

export const materiasRelations = relations(materias, ({ many }) => ({
  horarios: many(horarios),
}));

export const horariosRelations = relations(horarios, ({ one, many }) => ({
  seccion: one(secciones, {
    fields: [horarios.seccionId],
    references: [secciones.id],
  }),
  materia: one(materias, {
    fields: [horarios.materiaId],
    references: [materias.id],
  }),
  docente: one(usuarios, {
    fields: [horarios.docenteId],
    references: [usuarios.id],
  }),
  registros: many(registrosAsistencia),
}));

export const registrosAsistenciaRelations = relations(registrosAsistencia, ({ one, many }) => ({
  horario: one(horarios, {
    fields: [registrosAsistencia.horarioId],
    references: [horarios.id],
  }),
  inasistencias: many(inasistenciasAlumnos),
}));

export const inasistenciasAlumnosRelations = relations(inasistenciasAlumnos, ({ one }) => ({
  registro: one(registrosAsistencia, {
    fields: [inasistenciasAlumnos.registroId],
    references: [registrosAsistencia.id],
  }),
  estudiante: one(estudiantes, {
    fields: [inasistenciasAlumnos.estudianteId],
    references: [estudiantes.id],
  }),
}));

export const asistenciaDocentesRelations = relations(asistenciaDocentes, ({ one }) => ({
  docente: one(usuarios, {
    fields: [asistenciaDocentes.docenteId],
    references: [usuarios.id],
    relationName: "asistencia_docente"
  }),
  coordinador: one(usuarios, {
    fields: [asistenciaDocentes.coordinadorId],
    references: [usuarios.id],
    relationName: "asistencia_coordinador"
  }),
}));
