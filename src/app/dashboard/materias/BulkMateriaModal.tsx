"use client";

import { useState, useRef } from "react";
import {
    X,
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Download
} from "lucide-react";
import { bulkCreateMaterias } from "@/lib/actions";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface BulkMateriaModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BulkMateriaModal({ isOpen, onClose }: BulkMateriaModalProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Basic validation: must have 'nombre' or 'materia'
                const formatted = data.map((item: any) => ({
                    nombre: item.nombre || item.NOMBRE || item.materia || item.MATERIA,
                    codigo: item.codigo || item.CODIO || item.id || ""
                })).filter(i => i.nombre);

                if (formatted.length === 0) {
                    toast.error("El archivo no contiene datos válidos. Use las columnas 'nombre' y 'codigo'.");
                    return;
                }

                setPreviewData(formatted);
            } catch (err) {
                toast.error("Error al leer el archivo Excel");
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleProcess = async () => {
        setIsUploading(true);
        try {
            const res = await bulkCreateMaterias(previewData);
            if (res.success) {
                toast.success(res.message);
                onClose();
                setPreviewData([]);
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Error crítico procesando la carga");
        } finally {
            setIsUploading(false);
        }
    };

    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { nombre: "Matemática 1", codigo: "MAT1" },
            { nombre: "Lengua y Literatura", codigo: "LEN1" }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Materias");
        XLSX.writeFile(wb, "plantilla_materias.xlsx");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card w-full max-w-2xl rounded-[2.5rem] border border-border/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-border/40 flex items-center justify-between bg-accent/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight uppercase tracking-widest">Carga Masiva</h2>
                            <p className="text-xs text-muted-foreground font-bold">Importe sus materias desde Excel</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {previewData.length === 0 ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-border/60 rounded-[2rem] p-12 flex flex-col items-center gap-4 hover:border-primary/40 hover:bg-primary/[0.02] transition-all cursor-pointer group"
                        >
                            <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                                <FileText className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="text-center">
                                <p className="font-black text-lg">Subir archivo Excel o CSV</p>
                                <p className="text-xs text-muted-foreground font-medium mt-1">Haga clic o arrastre su archivo aquí</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".xlsx, .xls, .csv"
                                className="hidden"
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    Vista Previa ({previewData.length} materias)
                                </p>
                                <button
                                    onClick={() => setPreviewData([])}
                                    className="text-[10px] font-black underline hover:text-primary transition-colors"
                                >
                                    Cambiar archivo
                                </button>
                            </div>
                            <div className="max-h-60 overflow-y-auto rounded-2xl border border-border/40 bg-accent/10">
                                <table className="w-full text-left text-sm">
                                    <thead className="sticky top-0 bg-accent text-xs font-black uppercase tracking-widest border-b border-border/40">
                                        <tr>
                                            <th className="px-4 py-3">Nombre</th>
                                            <th className="px-4 py-3">Código</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {previewData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-accent/30 transition-colors">
                                                <td className="px-4 py-3 font-bold">{row.nombre}</td>
                                                <td className="px-4 py-3 font-mono text-[10px] uppercase">{row.codigo}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Importante</p>
                            <p className="text-[11px] text-amber-600 font-bold leading-relaxed">
                                El archivo debe contener las columnas <span className="underline">nombre</span> y opcionalmente <span className="underline">codigo</span>.
                                Si la materia ya existe, se creará un duplicado si no tienen códigos únicos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-accent/20 border-t border-border/40 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <button
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Descargar Plantilla
                    </button>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 md:flex-none px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-border/40 hover:bg-accent transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={previewData.length === 0 || isUploading}
                            onClick={handleProcess}
                            className="flex-1 md:flex-none px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 min-w-[140px]"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                "Confirmar Carga"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
