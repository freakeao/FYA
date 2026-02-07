"use client";

import { useState } from "react";
import { Upload, X, FileSpreadsheet, AlertCircle, Check } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { bulkCreateEstudiantes } from "@/lib/actions";

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    seccionId: string;
}

export function BulkUploadModal({ isOpen, onClose, seccionId }: BulkUploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<"upload" | "preview">("upload");

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseFile(selectedFile);
        }
    };

    const parseFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // Basic validation and mapping
                // Assuming format: [No, Nombre, Genero, Cedula] (header row skipped if present)
                const processedData = jsonData
                    .slice(1) // Skip header
                    .filter((row: any) => row.length >= 2) // Basic check for empty rows
                    .map((row: any) => ({
                        numeroLista: parseInt(row[0]) || 0,
                        nombre: row[1]?.toString().trim(),
                        genero: row[2]?.toString().toUpperCase().startsWith("H") ? "HEMBRA" : "VARON",
                        cedula: row[3]?.toString().trim() || ""
                    }));

                setPreviewData(processedData);
                setStep("preview");
            } catch (error) {
                toast.error("Error al leer el archivo. Asegúrate de que sea un Excel o CSV válido.");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleUpload = async () => {
        setIsLoading(true);
        try {
            const formattedData = previewData.map(d => ({
                ...d,
                seccionId,
                genero: d.genero as "HEMBRA" | "VARON"
            }));

            const res = await bulkCreateEstudiantes(formattedData);
            if (res.success) {
                toast.success(res.message);
                onClose();
                setFile(null);
                setPreviewData([]);
                setStep("upload");
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Error inesperado al subir los datos.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-card border border-border/40 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-border/40 flex items-center justify-between bg-accent/5">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-primary" />
                            Carga Masiva de Alumnos
                        </h2>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                            Importar desde Excel (.xlsx) o CSV
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
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold uppercase tracking-widest text-primary">Haz clic para subir archivo</p>
                                    <p className="text-xs text-muted-foreground mt-2">Soporta formatos .xlsx y .csv</p>
                                </div>
                            </label>

                            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 w-full max-w-md">
                                <h4 className="flex items-center gap-2 text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-2">
                                    <AlertCircle className="w-4 h-4" /> Formato Requerido
                                </h4>
                                <p className="text-xs text-muted-foreground mb-2">El archivo debe tener las siguientes columnas en orden:</p>
                                <div className="grid grid-cols-4 gap-2 text-[10px] font-mono bg-background/50 p-2 rounded border border-border/20">
                                    <div className="font-bold">Col 1</div>
                                    <div className="font-bold">Col 2</div>
                                    <div className="font-bold">Col 3</div>
                                    <div className="font-bold">Col 4</div>
                                    <div>Nº Lista</div>
                                    <div>Nombre</div>
                                    <div>Género (H/V)</div>
                                    <div>Cédula</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold uppercase tracking-widest">Vista Previa ({previewData.length} registros)</h3>
                                <button
                                    onClick={() => { setFile(null); setStep("upload"); }}
                                    className="text-xs text-primary hover:underline font-bold uppercase tracking-wider"
                                >
                                    Cambiar archivo
                                </button>
                            </div>

                            <div className="max-h-60 overflow-y-auto custom-scrollbar border border-border/40 rounded-xl">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-accent/10 sticky top-0">
                                        <tr>
                                            <th className="p-3 font-bold uppercase tracking-wider">Nº</th>
                                            <th className="p-3 font-bold uppercase tracking-wider">Nombre</th>
                                            <th className="p-3 font-bold uppercase tracking-wider">Género</th>
                                            <th className="p-3 font-bold uppercase tracking-wider">Cédula</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {previewData.map((row, i) => (
                                            <tr key={i} className="hover:bg-accent/5">
                                                <td className="p-3">{row.numeroLista}</td>
                                                <td className="p-3 font-medium">{row.nombre}</td>
                                                <td className="p-3">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                        row.genero === "HEMBRA" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
                                                    )}>
                                                        {row.genero === "HEMBRA" ? "F" : "M"}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-muted-foreground">{row.cedula}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-accent rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        {step === "preview" && (
                            <button
                                onClick={handleUpload}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? "Importando..." : (
                                    <>
                                        <Check className="w-4 h-4" /> Confirmar Importación
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
