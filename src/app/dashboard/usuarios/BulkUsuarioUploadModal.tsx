"use client";

import { useState } from "react";
import { Upload, X, FileSpreadsheet, AlertCircle, Check, Shield } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { bulkCreateUsuarios } from "@/lib/actions";

interface BulkUsuarioUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BulkUsuarioUploadModal({ isOpen, onClose }: BulkUsuarioUploadModalProps) {
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

                // Format: [Nombre, Cédula, Rol, Departamento, ¿Acceso?, Usuario, Password]
                const processedData = jsonData
                    .slice(1) // Skip header
                    .filter((row: any) => row[0]) // Basic check for name
                    .map((row: any) => {
                        const hasAccessRaw = row[4]?.toString().toUpperCase().trim();
                        const hasAccess = hasAccessRaw === "SI" || hasAccessRaw === "YES" || hasAccessRaw === "TRUE";

                        return {
                            nombre: row[0]?.toString().trim(),
                            cedula: row[1]?.toString().trim() || "",
                            rol: row[2]?.toString().toUpperCase().trim(),
                            departamento: row[3]?.toString().trim() || "",
                            grantAccess: hasAccess,
                            usuario: row[5]?.toString().trim() || null,
                            password: row[6]?.toString().trim() || null
                        };
                    });

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
            const validRoles = ["ADMINISTRADOR", "COORDINADOR", "DOCENTE", "ADMINISTRATIVO", "OBRERO"];
            const formattedData = previewData.map(d => {
                let role = d.rol;
                if (role === "ADMIN") role = "ADMINISTRADOR";
                if (role === "PROFE" || role === "PROFESOR") role = "DOCENTE";
                if (role === "AMBIENTALISTA") role = "OBRERO";

                return {
                    ...d,
                    rol: validRoles.includes(role) ? role : "DOCENTE"
                };
            });

            const res = await bulkCreateUsuarios(formattedData);
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
            <div className="w-full max-w-4xl bg-card border border-border/40 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-border/40 flex items-center justify-between bg-accent/5">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            Carga Masiva de Personal v2
                        </h2>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                            Gestione usuarios, accesos y coordinaciones desde Excel
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
                                id="file-upload-users"
                            />
                            <label htmlFor="file-upload-users" className="cursor-pointer flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold uppercase tracking-widest text-primary">Haz clic para subir archivo</p>
                                    <p className="text-xs text-muted-foreground mt-2">Personal, Coordinaciones y Accesos (.xlsx, .csv)</p>
                                </div>
                            </label>

                            <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-border/40 w-full max-w-2xl">
                                <h4 className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest mb-4">
                                    <AlertCircle className="w-4 h-4" /> Estructura de Columnas
                                </h4>
                                <div className="grid grid-cols-7 gap-1 text-[9px] font-mono bg-background/50 p-3 rounded-lg border border-border/20 text-center">
                                    <div className="font-bold border-b pb-1">Col 1</div>
                                    <div className="font-bold border-b pb-1">Col 2</div>
                                    <div className="font-bold border-b pb-1">Col 3</div>
                                    <div className="font-bold border-b pb-1">Col 4</div>
                                    <div className="font-bold border-b pb-1">Col 5</div>
                                    <div className="font-bold border-b pb-1">Col 6</div>
                                    <div className="font-bold border-b pb-1">Col 7</div>
                                    <div className="pt-1">Nombre</div>
                                    <div className="pt-1">Cédula</div>
                                    <div className="pt-1">Rol</div>
                                    <div className="pt-1">Depto</div>
                                    <div className="pt-1">¿Acceso?</div>
                                    <div className="pt-1">Usuario</div>
                                    <div className="pt-1">Password</div>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <p className="text-[10px] text-muted-foreground">
                                        • <strong>¿Acceso?:</strong> Use "SI" para crear credenciales, de lo contrario deje vacío o use "NO".
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        • <strong>Depto:</strong> Nombre del departamento (ej: "Media General"). Si no existe, se dejará nulo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold uppercase tracking-widest">Vista Previa de Importación</h3>
                                <button
                                    onClick={() => { setFile(null); setStep("upload"); }}
                                    className="text-xs text-primary hover:underline font-bold uppercase tracking-wider"
                                >
                                    Cambiar archivo
                                </button>
                            </div>

                            <div className="max-h-80 overflow-y-auto custom-scrollbar border border-border/40 rounded-2xl">
                                <table className="w-full text-left text-[11px]">
                                    <thead className="bg-accent/20 sticky top-0 backdrop-blur-sm">
                                        <tr>
                                            <th className="p-3 font-black uppercase tracking-wider border-b border-border/40">Personal</th>
                                            <th className="p-3 font-black uppercase tracking-wider border-b border-border/40">Cédula</th>
                                            <th className="p-3 font-black uppercase tracking-wider border-b border-border/40">Rol/Depto</th>
                                            <th className="p-3 font-black uppercase tracking-wider border-b border-border/40">Acceso</th>
                                            <th className="p-3 font-black uppercase tracking-wider border-b border-border/40">Credenciales</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {previewData.map((row, i) => (
                                            <tr key={i} className="hover:bg-accent/5 transition-colors">
                                                <td className="p-3 font-bold">{row.nombre}</td>
                                                <td className="p-3 font-mono">{row.cedula}</td>
                                                <td className="p-3">
                                                    <div className="space-y-1">
                                                        <span className="inline-block px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-black uppercase">
                                                            {row.rol}
                                                        </span>
                                                        <p className="text-[10px] text-muted-foreground font-bold italic">{row.departamento || "Sin Depto"}</p>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    {row.grantAccess ? (
                                                        <span className="flex items-center gap-1 text-emerald-600 font-black uppercase text-[9px]">
                                                            <Check className="w-3 h-3" /> SI
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-slate-400 font-black uppercase text-[9px]">
                                                            <X className="w-3 h-3" /> NO
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {row.grantAccess && row.usuario ? (
                                                        <div className="font-mono text-[9px]">
                                                            <p>U: {row.usuario}</p>
                                                            <p>P: ********</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground italic text-[9px]">N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-accent rounded-2xl transition-all"
                        >
                            Cerrar
                        </button>
                        {step === "preview" && (
                            <button
                                onClick={handleUpload}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? "Procesando..." : (
                                    <>
                                        <Upload className="w-4 h-4" /> Ejecutar Importación
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
