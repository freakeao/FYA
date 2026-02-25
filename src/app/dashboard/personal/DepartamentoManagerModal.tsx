"use client";

import { useState, useEffect } from "react";
import { X, Plus, Edit2, Check, Loader2, Hash, Layers } from "lucide-react";
import { getDepartamentos, createDepartamento, updateDepartamento } from "@/lib/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DepartamentoManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DepartamentoManagerModal({ isOpen, onClose }: DepartamentoManagerModalProps) {
    const [departamentos, setDepartamentos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [nombre, setNombre] = useState("");
    const [codigo, setCodigo] = useState("");

    async function fetchDepartamentos() {
        setLoading(true);
        const data = await getDepartamentos();
        setDepartamentos(data);
        setLoading(false);
    }

    useEffect(() => {
        if (isOpen) {
            fetchDepartamentos();
        }
    }, [isOpen]);

    const handleSave = async (id?: string) => {
        if (!nombre.trim()) {
            toast.error("El nombre es requerido");
            return;
        }

        setSubmitting(true);
        let res;
        if (id) {
            res = await updateDepartamento(id, nombre, codigo);
        } else {
            res = await createDepartamento(nombre, codigo);
        }

        if (res.success) {
            toast.success(res.message);
            setNombre("");
            setCodigo("");
            setIsAdding(false);
            setEditingId(null);
            fetchDepartamentos();
        } else {
            toast.error(res.error);
        }
        setSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-card border border-border/40 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-border/40 flex items-center justify-between bg-accent/5">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary" />
                            Coordinaciones
                        </h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                            Administre los nombres de departamentos
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* List */}
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
                            </div>
                        ) : departamentos.length === 0 ? (
                            <p className="text-center py-8 text-xs text-muted-foreground italic">No hay departamentos registrados.</p>
                        ) : (
                            departamentos.map(d => (
                                <div key={d.id} className="group flex items-center justify-between p-3 bg-accent/10 hover:bg-accent/20 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                                    {editingId === d.id ? (
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                autoFocus
                                                value={nombre}
                                                onChange={e => setNombre(e.target.value)}
                                                className="flex-1 bg-background border border-primary/30 rounded-lg px-3 py-1 text-xs outline-none"
                                            />
                                            <button
                                                onClick={() => handleSave(d.id)}
                                                disabled={submitting}
                                                className="p-1.5 bg-primary text-primary-foreground rounded-lg"
                                            >
                                                <Check className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex flex-col">
                                                <p className="text-sm font-bold">{d.nombre}</p>
                                                {d.codigo && <p className="text-[10px] font-mono text-primary uppercase">{d.codigo}</p>}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setEditingId(d.id);
                                                    setNombre(d.nombre);
                                                    setCodigo(d.codigo || "");
                                                }}
                                                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-primary/10 text-primary rounded-xl transition-all"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add New */}
                    {!isAdding && !editingId && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 rounded-2xl text-xs font-bold text-muted-foreground hover:text-primary transition-all group"
                        >
                            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                            Añadir Coordinación
                        </button>
                    )}

                    {isAdding && (
                        <div className="space-y-3 p-4 bg-accent/5 rounded-2xl border border-border/40 animate-in slide-in-from-top-2">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nombre</label>
                                <input
                                    autoFocus
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    placeholder="Ej. Media General"
                                    className="w-full bg-background border border-border/40 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Código (Opcional)</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                    <input
                                        value={codigo}
                                        onChange={e => setCodigo(e.target.value)}
                                        placeholder="MG"
                                        className="w-full bg-background border border-border/40 rounded-xl pl-8 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 py-2 text-[10px] font-bold uppercase bg-accent/30 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleSave()}
                                    disabled={submitting}
                                    className="flex-1 py-2 text-[10px] font-bold uppercase bg-primary text-primary-foreground rounded-xl flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                    Guardar
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-accent/5 border-t border-border/40 flex justify-center">
                    <button
                        onClick={onClose}
                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Salir
                    </button>
                </div>
            </div>
        </div>
    );
}
