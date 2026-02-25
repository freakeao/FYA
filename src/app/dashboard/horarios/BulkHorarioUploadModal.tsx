"use client";

import { useState } from "react";
import { Upload, X, FileSpreadsheet, AlertCircle, Check, AlertTriangle, Clock, User, Users, Calendar } from "lucide-react";
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
}

interface ParsedEntry {
    profesorRaw: string;
    docenteId: string | null;
    docenteNombre: string | null;
    seccionRaw: string;
    seccionId: string | null;
    seccionNombre: string | null;
    diaSemana: "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES";
    horaInicio: string;
    horaFin: string;
    descripcion?: string;
    matched: boolean;
}

const DIAS_MAP: Record<number, "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES"> = {
    0: "LUNES",
    1: "MARTES",
    2: "MIERCOLES",
    3: "JUEVES",
    4: "VIERNES"
};

const SKIP_WORDS = ["RECESO", "ALMUERZO", "RECESO ", "ALMUERZO "];

function normalizeText(text: string): string {
    return text
        .toUpperCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z0-9\s]/g, "")
        .trim();
}

function cleanTeacherName(sheetName: string): string {
    return sheetName
        .replace(/^(PROF\.|PROF|LIC\.|LIC|DR\.|DR|ING\.|ING|MSC\.|MSC)\s*/i, "")
        .trim();
}

function parseTimeRange(timeStr: string): { horaInicio: string; horaFin: string } | null {
    if (!timeStr) return null;
    const cleaned = timeStr.toString().replace(/\s+/g, " ").trim();
    // Match patterns like "07:00 - 7:40", "9:50 - 10:30", "3:10 3:50" (no dash)
    const match = cleaned.match(/(\d{1,2}[:\.]\d{2})\s*[-–—]?\s*(\d{1,2}[:\.]\d{2})/);
    if (!match) return null;

    const formatTime = (t: string) => {
        const parts = t.replace(".", ":").split(":");
        return parts[0].padStart(2, "0") + ":" + parts[1];
    };

    return {
        horaInicio: formatTime(match[1]),
        horaFin: formatTime(match[2])
    };
}

function matchDocente(rawName: string, docentes: any[]): { id: string; nombre: string } | null {
    const cleaned = normalizeText(cleanTeacherName(rawName));
    if (!cleaned) return null;

    // Try exact match first
    for (const d of docentes) {
        if (normalizeText(d.nombre) === cleaned) {
            return { id: d.id, nombre: d.nombre };
        }
    }

    // Try includes match (name parts)
    const parts = cleaned.split(/\s+/).filter(p => p.length > 2);
    for (const d of docentes) {
        const dNorm = normalizeText(d.nombre);
        const matchCount = parts.filter(p => dNorm.includes(p)).length;
        if (matchCount >= 2 || (parts.length === 1 && dNorm.includes(parts[0]))) {
            return { id: d.id, nombre: d.nombre };
        }
    }

    // Try last name match
    for (const d of docentes) {
        const dNorm = normalizeText(d.nombre);
        const dParts = dNorm.split(/\s+/);
        // Check if any part of the sheet name matches the last word of the teacher name
        for (const p of parts) {
            if (dParts[dParts.length - 1] === p || dParts[0] === p) {
                return { id: d.id, nombre: d.nombre };
            }
        }
    }

    return null;
}

function parseSeccionCell(cellValue: string): string[] {
    if (!cellValue) return [];
    const val = cellValue.toString().trim();
    if (!val) return [];

    // Skip RECESO/ALMUERZO
    const upper = val.toUpperCase().trim();
    if (SKIP_WORDS.some(w => upper.startsWith(w))) return [];

    // Handle combined cells: "4TO "A" / 4TO "B"" or "1ERO "A" / 1ERO "B""
    // Split by / and process each part
    const parts = val.split("/").map(p => p.trim()).filter(p => p.length > 0);

    const results: string[] = [];
    for (const part of parts) {
        // Clean up the section reference
        const cleaned = part.replace(/[""]/g, '"').trim();
        if (cleaned && !SKIP_WORDS.some(w => cleaned.toUpperCase().startsWith(w))) {
            results.push(cleaned);
        }
    }

    return results;
}

function matchSeccion(rawSeccion: string, secciones: any[]): { id: string; nombre: string } | null {
    if (!rawSeccion) return null;

    // Normalize: "4TO "A"" -> extract grado number and letter
    const normalized = rawSeccion.toUpperCase().replace(/[""]/g, '"').trim();

    // Try direct name match first
    for (const s of secciones) {
        const sNorm = s.nombre.toUpperCase().trim();
        if (sNorm === normalized || sNorm === normalized.replace(/"/g, "")) {
            return { id: s.id, nombre: s.nombre };
        }
    }

    // Extract grado and section letter
    // Patterns: "4TO A", "4TO "A"", "5TO"A"", "1ERO "C"", "3ERO "C""
    const match = normalized.match(/(\d+)\s*(?:ER|ERO|TO|DO|MO|RO|NO|VO|NTO|STO|NDO|CER|RTO)?\s*[""']?\s*([A-Z])\s*[""']?/i);

    if (match) {
        const grado = match[1];
        const letra = match[2].toUpperCase();

        // Try matching by grado + nombre containing the letter
        for (const s of secciones) {
            const sGrado = s.grado?.toString() || "";
            const sNombre = s.nombre?.toUpperCase() || "";

            // Check if grado matches and nombre contains the letter
            if (
                (sGrado === grado || sGrado.includes(grado)) &&
                (sNombre.includes(letra) || sNombre.includes(`"${letra}"`))
            ) {
                return { id: s.id, nombre: s.nombre };
            }
        }

        // Looser match: just check nombre pattern
        const searchPattern = `${grado}.*${letra}`;
        const regex = new RegExp(searchPattern, "i");
        for (const s of secciones) {
            if (regex.test(s.nombre) || regex.test(`${s.grado} ${s.nombre}`)) {
                return { id: s.id, nombre: s.nombre };
            }
        }
    }

    return null;
}

export function BulkHorarioUploadModal({ isOpen, onClose, docentes, secciones }: BulkHorarioUploadModalProps) {
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
                const allEntries: ParsedEntry[] = [];

                for (const sheetName of workbook.SheetNames) {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
                        header: 1,
                        defval: ""
                    });

                    // Match teacher from sheet name
                    const docenteMatch = matchDocente(sheetName, docentes);

                    // Find the header row (contains "HORA" and day names)
                    let headerRowIdx = -1;
                    let dayColumns: Record<number, "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES"> = {};

                    for (let i = 0; i < Math.min(jsonData.length, 15); i++) {
                        const row = jsonData[i];
                        if (!row) continue;
                        const rowStr = row.map(c => c?.toString().toUpperCase().trim() || "");
                        const horaIdx = rowStr.findIndex(c => c === "HORA");

                        if (horaIdx >= 0) {
                            headerRowIdx = i;
                            // Find day columns
                            for (let j = horaIdx + 1; j < rowStr.length; j++) {
                                const cell = rowStr[j];
                                if (cell === "LUNES") dayColumns[j] = "LUNES";
                                else if (cell === "MARTES") dayColumns[j] = "MARTES";
                                else if (cell === "MIERCOLES" || cell === "MIÉRCOLES") dayColumns[j] = "MIERCOLES";
                                else if (cell === "JUEVES") dayColumns[j] = "JUEVES";
                                else if (cell === "VIERNES") dayColumns[j] = "VIERNES";
                            }
                            break;
                        }
                    }

                    if (headerRowIdx < 0 || Object.keys(dayColumns).length === 0) continue;

                    // Find the HORA column index
                    const horaColIdx = jsonData[headerRowIdx].findIndex(
                        (c: any) => c?.toString().toUpperCase().trim() === "HORA"
                    );

                    // Parse data rows
                    for (let i = headerRowIdx + 1; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        if (!row || !row[horaColIdx]) continue;

                        const timeRange = parseTimeRange(row[horaColIdx]?.toString());
                        if (!timeRange) continue;

                        // Check each day column
                        for (const [colIdxStr, dia] of Object.entries(dayColumns)) {
                            const colIdx = parseInt(colIdxStr);
                            const cellValue = row[colIdx]?.toString().trim();
                            if (!cellValue) continue;

                            const seccionRefs = parseSeccionCell(cellValue);
                            if (seccionRefs.length === 0) continue;

                            for (const secRef of seccionRefs) {
                                const seccionMatch = matchSeccion(secRef, secciones);

                                // Check if there's additional text in the cell (below line) for description
                                let descripcion: string | undefined;
                                const lines = cellValue.split("\n");
                                if (lines.length > 1) {
                                    const extraLines = lines.slice(1).map((l: string) => l.trim()).filter((l: string) => l && !parseSeccionCell(l).length);
                                    if (extraLines.length > 0) {
                                        descripcion = extraLines.join(" ");
                                    }
                                }

                                allEntries.push({
                                    profesorRaw: sheetName,
                                    docenteId: docenteMatch?.id || null,
                                    docenteNombre: docenteMatch?.nombre || null,
                                    seccionRaw: secRef,
                                    seccionId: seccionMatch?.id || null,
                                    seccionNombre: seccionMatch?.nombre || null,
                                    diaSemana: dia,
                                    horaInicio: timeRange.horaInicio,
                                    horaFin: timeRange.horaFin,
                                    descripcion,
                                    matched: !!docenteMatch && !!seccionMatch
                                });
                            }
                        }
                    }
                }

                setPreviewData(allEntries);
                setStep("preview");
            } catch (error) {
                console.error("Parse error:", error);
                toast.error("Error al leer el archivo. Asegúrate de que sea un Excel válido.");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleUpload = async () => {
        setIsLoading(true);
        try {
            // Step 1: Auto-create missing professors
            const unmatchedProfs = [...new Set(
                previewData
                    .filter(e => !e.docenteId)
                    .map(e => e.profesorRaw)
            )];

            // Clean teacher names for creation (remove PROF., LIC., etc.)
            const namesToCreate = unmatchedProfs.map(name => cleanTeacherName(name));

            let newDocenteMap: Record<string, string> = {}; // raw sheet name -> new ID

            if (namesToCreate.length > 0) {
                const createRes = await autoCreateDocentesFromNames(namesToCreate);
                if (!createRes.success) {
                    toast.error(createRes.error || "Error al crear docentes");
                    setIsLoading(false);
                    return;
                }
                // Map original sheet names to new IDs
                for (let i = 0; i < unmatchedProfs.length; i++) {
                    const created = createRes.created[i];
                    if (created) {
                        newDocenteMap[unmatchedProfs[i]] = created.id;
                    }
                }
                toast.success(`${createRes.created.length} docentes creados automáticamente`);
            }

            // Step 2: Update entries with new docente IDs
            const updatedEntries = previewData.map(e => {
                if (!e.docenteId && newDocenteMap[e.profesorRaw]) {
                    return { ...e, docenteId: newDocenteMap[e.profesorRaw] };
                }
                return e;
            });

            // Step 3: Insert horarios (only those with both docenteId and seccionId)
            const validEntries = updatedEntries.filter(e => e.docenteId && e.seccionId);
            if (validEntries.length === 0) {
                toast.error("No hay horarios válidos para importar. Verifica que las secciones existan en el sistema.");
                setIsLoading(false);
                return;
            }

            const formattedData = validEntries.map(e => ({
                docenteId: e.docenteId!,
                seccionId: e.seccionId!,
                diaSemana: e.diaSemana,
                horaInicio: e.horaInicio,
                horaFin: e.horaFin,
                descripcion: e.descripcion,
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

    const withSectionMatch = previewData.filter(e => e.seccionId).length;
    const withoutSection = previewData.filter(e => !e.seccionId).length;
    const unmatchedProfCount = [...new Set(previewData.filter(e => !e.docenteId).map(e => e.profesorRaw))].length;
    const profesores = [...new Set(previewData.map(e => e.profesorRaw))];

    const filteredPreview = filterProfesor === "all"
        ? previewData
        : filterProfesor === "unmatched"
            ? previewData.filter(e => !e.seccionId)
            : previewData.filter(e => e.profesorRaw === filterProfesor);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-6xl bg-card border border-border/40 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-border/40 flex items-center justify-between bg-accent/5">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Carga Masiva de Horarios
                        </h2>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                            Importe horarios de docentes desde un archivo Excel multi-pestaña
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
                                    <p className="text-sm font-bold uppercase tracking-widest text-primary">Haz clic para subir archivo</p>
                                    <p className="text-xs text-muted-foreground mt-2">Archivo Excel con pestañas de horarios por docente (.xlsx)</p>
                                </div>
                            </label>

                            <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-border/40 w-full max-w-2xl">
                                <h4 className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest mb-4">
                                    <AlertCircle className="w-4 h-4" /> Formato Esperado del Excel
                                </h4>
                                <div className="space-y-3 text-[11px] text-muted-foreground">
                                    <p className="flex items-center gap-2">
                                        <FileSpreadsheet className="w-4 h-4 text-primary flex-shrink-0" />
                                        <span>Cada <strong>pestaña</strong> = un docente (nombre en la pestaña, ej: "PROF. VICTOR LEÓN")</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                                        <span><strong>Columna HORA</strong> con rangos como "07:00 - 7:40", "9:50 - 10:30"</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                                        <span><strong>Columnas por día:</strong> LUNES, MARTES, MIÉRCOLES, JUEVES, VIERNES</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-primary flex-shrink-0" />
                                        <span><strong>Celdas:</strong> Sección asignada (ej: 4TO "A", 5TO "B", 3ERO "C")</span>
                                    </p>
                                </div>
                                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl">
                                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                                        ✨ Los profesores que no existan serán creados automáticamente como DOCENTE.
                                        Las secciones sí deben existir previamente.
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
                                        {withSectionMatch} importables
                                    </span>
                                </div>
                                {withoutSection > 0 && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl">
                                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                                        <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                            {withoutSection} sin sección
                                        </span>
                                    </div>
                                )}
                                {unmatchedProfCount > 0 && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-2xl">
                                        <User className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                                            {unmatchedProfCount} prof. a crear
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/30 rounded-2xl">
                                    <Users className="w-4 h-4 text-slate-600" />
                                    <span className="text-xs font-black text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                                        {profesores.length} profesores
                                    </span>
                                </div>
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
                                    <option value="all">Todos los profesores ({previewData.length})</option>
                                    {withoutSection > 0 && (
                                        <option value="unmatched">⚠️ Solo sin sección ({withoutSection})</option>
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
                                    <thead className="bg-accent/20 sticky top-0 backdrop-blur-sm z-10">
                                        <tr>
                                            <th className="p-3 font-black uppercase tracking-wider border-b border-border/40">Status</th>
                                            <th className="p-3 font-black uppercase tracking-wider border-b border-border/40">Profesor</th>
                                            <th className="p-3 font-black uppercase tracking-wider border-b border-border/40">Día</th>
                                            <th className="p-3 font-black uppercase tracking-wider border-b border-border/40">Hora</th>
                                            <th className="p-3 font-black uppercase tracking-wider border-b border-border/40">Sección (Excel)</th>
                                            <th className="p-3 font-black uppercase tracking-wider border-b border-border/40">Match en BD</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {filteredPreview.map((entry, i) => (
                                            <tr key={i} className={cn(
                                                "hover:bg-accent/5 transition-colors",
                                                !entry.matched && "bg-amber-50/50 dark:bg-amber-950/10"
                                            )}>
                                                <td className="p-3">
                                                    {entry.matched ? (
                                                        <span className="flex items-center gap-1 text-emerald-600">
                                                            <Check className="w-3 h-3" />
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-amber-500">
                                                            <AlertTriangle className="w-3 h-3" />
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <div>
                                                        <span className={cn(
                                                            "font-bold",
                                                            !entry.docenteId && "text-amber-600"
                                                        )}>
                                                            {entry.docenteNombre || entry.profesorRaw}
                                                        </span>
                                                        {!entry.docenteId && (
                                                            <p className="text-[9px] text-amber-500 font-bold mt-0.5">
                                                                NO ENCONTRADO
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-black uppercase">
                                                        {entry.diaSemana.substring(0, 3)}
                                                    </span>
                                                </td>
                                                <td className="p-3 font-mono text-[10px]">
                                                    {entry.horaInicio} - {entry.horaFin}
                                                </td>
                                                <td className="p-3 font-bold">
                                                    {entry.seccionRaw}
                                                    {entry.descripcion && (
                                                        <p className="text-[9px] text-muted-foreground italic mt-0.5">
                                                            {entry.descripcion}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {entry.seccionNombre ? (
                                                        <span className="inline-block px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded text-[9px] font-black">
                                                            {entry.seccionNombre}
                                                        </span>
                                                    ) : (
                                                        <span className="text-amber-500 text-[9px] font-bold">
                                                            NO ENCONTRADA
                                                        </span>
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
                                    Se importarán <strong className="text-emerald-600">{withSectionMatch}</strong> horarios.
                                    {unmatchedProfCount > 0 && <span className="text-blue-500"> {unmatchedProfCount} profesores serán creados.</span>}
                                    {withoutSection > 0 && <span className="text-amber-500"> {withoutSection} sin sección serán ignorados.</span>}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-accent rounded-2xl transition-all"
                            >
                                Cerrar
                            </button>
                            {step === "preview" && withSectionMatch > 0 && (
                                <button
                                    onClick={handleUpload}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isLoading ? "Importando..." : (
                                        <>
                                            <Upload className="w-4 h-4" /> Importar {withSectionMatch} Horarios
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
