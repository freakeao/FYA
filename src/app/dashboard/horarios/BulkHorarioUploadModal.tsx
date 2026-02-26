"use client";

import { useState } from "react";
import { Upload, X, FileSpreadsheet, AlertCircle, Check, AlertTriangle, Clock, User, Users, Calendar, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { bulkCreateHorarios, autoCreateDocentesFromNames } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface BulkHorarioUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    docentes: any[];
    secciones: any[];
    materias: any[];
}

interface ParsedEntry {
    profesorRaw: string;
    docenteId: string | null;
    docenteNombre: string | null;

    materiaRaw: string;
    materiaId: string | null;
    materiaNombre: string | null;

    seccionRaw: string;
    seccionId: string | null;
    seccionNombre: string | null;

    diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES";
    horaInicio: string;
    horaFin: string;

    valido: boolean;
}

function normalizeText(text: string): string {
    if (!text) return "";
    return text.toString()
        .toUpperCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z0-9\s]/g, "")
        .trim();
}

function extractTime(timeStr: string): string {
    if (!timeStr) return "";
    const cleaned = timeStr.toString().toLowerCase().replace(/\s+/g, "").replace(".", ":");
    const match = cleaned.match(/(\d{1,2}):(\d{2})/);
    if (!match) return "";
    let hour = parseInt(match[1]);
    const minute = parseInt(match[2]);
    if (cleaned.includes("pm") && hour < 12) hour += 12;
    if (cleaned.includes("am") && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

function matchDocente(rawName: string, docentes: any[]): { id: string; nombre: string } | null {
    const cleaned = normalizeText(rawName);
    if (!cleaned) return null;

    // Direct match
    for (const d of docentes) {
        if (normalizeText(d.nombre) === cleaned) return { id: d.id, nombre: d.nombre };
    }

    // Partial Match (Last name or First name)
    const parts = cleaned.split(/\s+/).filter(p => p.length > 2);
    for (const d of docentes) {
        const dNorm = normalizeText(d.nombre);
        if (parts.some(p => dNorm.includes(p))) {
            return { id: d.id, nombre: d.nombre };
        }
    }
    return null;
}

function matchMateria(rawMateria: string, materias: any[]): { id: string; nombre: string } | null {
    const cleaned = normalizeText(rawMateria);
    if (!cleaned) return null;
    for (const m of materias) {
        if (normalizeText(m.nombre).includes(cleaned) || cleaned.includes(normalizeText(m.nombre))) {
            return { id: m.id, nombre: m.nombre };
        }
    }
    return null;
}

function matchSeccion(rawSeccion: string, secciones: any[]): { id: string; nombre: string } | null {
    const cleaned = normalizeText(rawSeccion);
    if (!cleaned) return null;
    for (const s of secciones) {
        const sNorm = normalizeText(`${s.nombre} ${s.grado}`);
        if (sNorm.includes(cleaned) || cleaned.includes(normalizeText(s.nombre))) {
            return { id: s.id, nombre: `${s.nombre} - ${s.grado}` };
        }
    }
    return null;
}

export function BulkHorarioUploadModal({ isOpen, onClose, docentes, secciones, materias }: BulkHorarioUploadModalProps) {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<ParsedEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<"upload" | "preview">("upload");
    const [filterProfesor, setFilterProfesor] = useState<string>("all");

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseExcel(selectedFile);
        }
    };

    const parseExcel = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                const allEntries: ParsedEntry[] = [];

                for (const row of jsonData) {
                    const profRaw = row["PROFESOR"]?.toString().trim() || "";
                    const matRaw = row["MATERIA"]?.toString().trim() || "";
                    const secRaw = row["SECCIÓN"]?.toString().trim() || row["SECCION"]?.toString().trim() || "";
                    const diaRaw = row["DÍA"]?.toString().trim().toUpperCase() || row["DIA"]?.toString().trim().toUpperCase() || "";
                    const hInicio = extractTime(row["HORA INICIO"]?.toString() || "");
                    const hFin = extractTime(row["HORA FIN"]?.toString() || "");

                    if (!profRaw && !secRaw && !hInicio) continue; // Skip empty rows

                    const dMatch = matchDocente(profRaw, docentes);
                    const mMatch = matchMateria(matRaw, materias);
                    const sMatch = matchSeccion(secRaw, secciones);

                    const validDays = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"];
                    const normalizedDay = normalizeText(diaRaw);
                    const finalDay = validDays.find(d => normalizedDay.includes(d)) as any || "LUNES";

                    allEntries.push({
                        profesorRaw: profRaw || "Sin Asignar",
                        docenteId: dMatch?.id || null,
                        docenteNombre: dMatch?.nombre || null,
                        materiaRaw: matRaw || "Sin Materia",
                        materiaId: mMatch?.id || null,
                        materiaNombre: mMatch?.nombre || null,
                        seccionRaw: secRaw || "Sin Sección",
                        seccionId: sMatch?.id || null,
                        seccionNombre: sMatch?.nombre || null,
                        diaSemana: finalDay,
                        horaInicio: hInicio || "00:00",
                        horaFin: hFin || "00:00",
                        valido: !!dMatch && !!sMatch && !!hInicio && !!hFin
                    });
                }

                setPreviewData(allEntries);
                setStep("preview");
            } catch (error) {
                console.error("Parse error:", error);
                toast.error("Error al leer el archivo. Asegúrate de usar la plantilla correcta.");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleUpload = async () => {
        setIsLoading(true);
        try {
            // Step 1: Auto-create missing professors
            const unmatchedProfs = [...new Set(
                previewData.filter(e => !e.docenteId && e.profesorRaw !== "Sin Asignar").map(e => e.profesorRaw)
            )];

            let newDocenteMap: Record<string, string> = {};

            if (unmatchedProfs.length > 0) {
                const createRes = await autoCreateDocentesFromNames(unmatchedProfs);
                if (!createRes.success) {
                    toast.error(createRes.error || "Error al crear docentes");
                    setIsLoading(false);
                    return;
                }
                for (let i = 0; i < unmatchedProfs.length; i++) {
                    const created = createRes.created[i];
                    if (created) newDocenteMap[unmatchedProfs[i]] = created.id;
                }
            }

            // Step 2: Extract valid entries
            const validEntries = previewData.map(e => ({
                ...e,
                docenteId: e.docenteId || newDocenteMap[e.profesorRaw] || null
            })).filter(e => e.docenteId && e.seccionId);

            if (validEntries.length === 0) {
                toast.error("No hay horarios válidos para importar. Verifica las secciones.");
                setIsLoading(false);
                return;
            }

            const formattedData = validEntries.map(e => ({
                docenteId: e.docenteId!,
                seccionId: e.seccionId!,
                materiaId: e.materiaId || undefined,
                diaSemana: e.diaSemana,
                horaInicio: e.horaInicio,
                horaFin: e.horaFin
            }));

            const res = await bulkCreateHorarios(formattedData);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
                onClose();
                setFile(null);
                setPreviewData([]);
                setStep("upload");
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Error inesperado al importar horarios.");
        } finally {
            setIsLoading(false);
        }
    };

    const validCount = previewData.filter(e => e.seccionId && e.horaInicio && e.horaFin).length;
    const invalidCount = previewData.length - validCount;
    const unmatchedProfCount = [...new Set(previewData.filter(e => !e.docenteId).map(e => e.profesorRaw))].length;
    const profesores = [...new Set(previewData.map(e => e.profesorRaw))];

    const filteredPreview = filterProfesor === "all"
        ? previewData
        : filterProfesor === "invalid"
            ? previewData.filter(e => !e.valido)
            : previewData.filter(e => e.profesorRaw === filterProfesor);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-6xl bg-card border border-border/40 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-border/40 flex items-center justify-between bg-accent/5">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Carga Masiva de Horarios (Plantilla Oficial)
                        </h2>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                            Importe los datos de la escuela de una sola vez
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {step === "upload" ? (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-2xl p-10 hover:bg-accent/5 transition-colors group">
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload-horarios"
                            />
                            <label htmlFor="file-upload-horarios" className="cursor-pointer flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold uppercase tracking-widest text-primary">Haz clic para subir archivo Excel</p>
                                    <p className="text-xs text-muted-foreground mt-2">Sube la plantilla oficial de Horarios llena (.xlsx)</p>
                                </div>
                            </label>

                            <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-border/40 w-full max-w-2xl">
                                <h4 className="flex items-center justify-between text-xs font-black text-primary uppercase tracking-widest mb-4">
                                    <span className="flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" /> Uso de la Plantilla</span>
                                    <a
                                        href="/plantilla_horarios.xlsx"
                                        download="Plantilla_Horarios_FYA.xlsx"
                                        className="flex items-center gap-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <Download className="w-4 h-4" /> Descargar Plantilla
                                    </a>
                                </h4>
                                <div className="space-y-3 text-[11px] text-muted-foreground">
                                    <p className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                        <span>Utiliza exclusivamente la plantilla plana generada por el sistema.</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                        <span>Escribe los nombres de los docentes de forma limpia (Sin "PROF" o titulo).</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                        <span>Las materias se asignarán visualmente al escanear la base de datos.</span>
                                    </p>
                                </div>
                                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl">
                                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                                        ✨ Los profesores que no existan serán creados automáticamente como DOCENTE.
                                        Las secciones y materias DEBEN existir previamente de forma exacta.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Stats bar */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl">
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                        {validCount} correctos
                                    </span>
                                </div>
                                {invalidCount > 0 && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl">
                                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                                        <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                            {invalidCount} incompletos
                                        </span>
                                    </div>
                                )}
                                {unmatchedProfCount > 0 && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-2xl">
                                        <User className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                                            {unmatchedProfCount} prof. nuevos
                                        </span>
                                    </div>
                                )}
                                <div className="ml-auto flex items-center gap-2">
                                    <button
                                        onClick={() => { setFile(null); setStep("upload"); setPreviewData([]); }}
                                        className="text-xs text-primary hover:underline font-bold uppercase tracking-wider"
                                    >
                                        Cambiar archivo
                                    </button>
                                </div>
                            </div>

                            {/* Filter */}
                            <div className="flex items-center gap-2">
                                <select
                                    value={filterProfesor}
                                    onChange={(e) => setFilterProfesor(e.target.value)}
                                    className="bg-card border border-border/40 rounded-xl py-2 px-3 text-xs font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="all">Ver todas las filas ({previewData.length})</option>
                                    {invalidCount > 0 && (
                                        <option value="invalid">⚠️ Ver solo incompletos ({invalidCount})</option>
                                    )}
                                    {profesores.map(p => {
                                        const count = previewData.filter(e => e.profesorRaw === p).length;
                                        return <option key={p} value={p}>{p} ({count})</option>;
                                    })}
                                </select>
                            </div>

                            {/* Preview table */}
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar border border-border/40 rounded-2xl">
                                <table className="w-full text-left text-[11px]">
                                    <thead className="bg-accent/20 sticky top-0 backdrop-blur-sm z-10 shadow-sm">
                                        <tr>
                                            <th className="p-3 font-black uppercase tracking-wider border-b border-border/40">Profesor</th>
                                            <th className="p-3 font-black uppercase tracking-wider border-b border-border/40">Materia</th>
                                            <th className="p-3 font-black uppercase tracking-wider border-b border-border/40">Sección</th>
                                            <th className="p-3 font-black uppercase tracking-wider border-b border-border/40">Ocurrencia</th>
                                            <th className="p-3 font-black uppercase tracking-wider border-b border-border/40 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {filteredPreview.map((entry, i) => (
                                            <tr key={i} className={cn(
                                                "hover:bg-accent/5 transition-colors",
                                                !entry.valido && "bg-amber-50/50 dark:bg-amber-950/10"
                                            )}>
                                                <td className="p-3">
                                                    <div>
                                                        <span className={cn("font-bold", !entry.docenteId && "text-amber-600")}>
                                                            {entry.docenteNombre || entry.profesorRaw}
                                                        </span>
                                                        {!entry.docenteId && <p className="text-[9px] text-amber-500 font-black mt-0.5">NUEVO</p>}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div>
                                                        <span className={cn("font-bold", !entry.materiaId && "text-amber-500")}>
                                                            {entry.materiaNombre || entry.materiaRaw}
                                                        </span>
                                                        {!entry.materiaId && entry.materiaRaw !== "Sin Materia" && <p className="text-[9px] text-amber-500 mt-0.5">NO REGISTRADA</p>}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div>
                                                        <span className={cn("font-bold text-emerald-700", !entry.seccionId && "text-red-500")}>
                                                            {entry.seccionNombre || entry.seccionRaw}
                                                        </span>
                                                        {!entry.seccionId && <p className="text-[9px] text-red-500 font-bold mt-0.5">INVÁLIDO / VACÍO</p>}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="inline-block w-max px-2 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-black uppercase">
                                                            {entry.diaSemana}
                                                        </span>
                                                        <span className="font-mono font-bold text-muted-foreground">
                                                            {entry.horaInicio} - {entry.horaFin}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center">
                                                    {entry.valido ? (
                                                        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                                                    ) : (
                                                        <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto" />
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                        <div className="text-[10px] text-muted-foreground">
                            {step === "preview" && (
                                <span>
                                    Bloques válidos a insertar: <strong className="text-emerald-600">{validCount}</strong>
                                </span>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-accent rounded-2xl transition-all"
                            >
                                Cancelar
                            </button>
                            {step === "preview" && validCount > 0 && (
                                <button
                                    onClick={handleUpload}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isLoading ? "Procesando BD..." : `Guardar ${validCount} Bloques`}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
