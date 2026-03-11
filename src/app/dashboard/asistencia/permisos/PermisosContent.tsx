"use client";

import { useState } from "react";
import { Plus, Trash2, X, Save, Calendar, User, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPermiso, deletePermiso } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { getVenezuelaDate, formatToVenezuelaDate } from "@/lib/dateUtils";

const TIPO_LABELS: Record<string, { label: string; color: string }> = {
    REPOSO_MEDICO: { label: "Reposo Médico", color: "text-blue-600 bg-blue-500/10 border-blue-500/20" },
    PERMISO_PERSONAL: { label: "Permiso Personal", color: "text-violet-600 bg-violet-500/10 border-violet-500/20" },
    BECA: { label: "Beca / Comisión", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
    VACACIONES: { label: "Vacaciones", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
    OTRO: { label: "Otro Motivo", color: "text-slate-600 bg-slate-500/10 border-slate-500/20" },
};

interface PermisosContentProps {
    permisosIniciales: any[];
    docentes: any[];
}

export function PermisosContent({ permisosIniciales, docentes }: PermisosContentProps) {
    const [permisos, setPermisos] = useState(permisosIniciales);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const router = useRouter();

    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null,
    });

    const requestDelete = (id: string) => {
        setConfirmDialog({ open: true, id });
    };

    const confirmDelete = async () => {
        if (!confirmDialog.id) return;
        const id = confirmDialog.id;
        setConfirmDialog({ open: false, id: null });
        setDeletingId(id);
        const res = await deletePermiso(id);
        setDeletingId(null);
        if (res.success) {
            toast.success("Permiso eliminado");
            setPermisos(prev => prev.filter(p => p.id !== id));
        } else {
            toast.error(res.error);
        }
    };

    // Form state
    const [docenteId, setDocenteId] = useState("");
    const [tipo, setTipo] = useState("REPOSO_MEDICO");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [observaciones, setObservaciones] = useState("");

    const resetForm = () => {
        setDocenteId(""); setTipo("REPOSO_MEDICO");
        setFechaInicio(""); setFechaFin(""); setObservaciones("");
    };

    const handleCreate = async () => {
        if (!docenteId || !fechaInicio || !fechaFin) {
            toast.error("Completa todos los campos obligatorios");
            return;
        }
        if (fechaInicio > fechaFin) {
            toast.error("La fecha de inicio no puede ser posterior a la fecha de fin");
            return;
        }
        setSaving(true);
        const res = await createPermiso({ docenteId, tipo, fechaInicio, fechaFin, observaciones });
        setSaving(false);
        if (res.success) {
            toast.success("Permiso registrado correctamente");
            setIsModalOpen(false);
            resetForm();
            router.refresh();
        } else {
            toast.error(res.error || "Error al guardar");
        }
    };

    const handleDelete = async (id: string) => {
        requestDelete(id);
    };

    const today = getVenezuelaDate();
    const activePermisos = permisos.filter(p => p.fechaFin >= today);
    const pastPermisos = permisos.filter(p => p.fechaFin < today);

    const renderPermiso = (permiso: any, isPast: boolean) => {
        const tipoInfo = TIPO_LABELS[permiso.tipo] || TIPO_LABELS.OTRO;
        const startStr = formatToVenezuelaDate(permiso.fechaInicio, { day: "2-digit", month: "short", year: "numeric" });
        const endStr = formatToVenezuelaDate(permiso.fechaFin, { day: "2-digit", month: "short", year: "numeric" });
        const diffDays = Math.round((new Date(permiso.fechaFin).getTime() - new Date(permiso.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)) + 1;

        return (
            <div key={permiso.id} className={cn(
                "premium-card p-5 rounded-[2rem] border flex items-start gap-4 transition-all",
                isPast ? "opacity-50 border-border/30" : "border-border/40"
            )}>
                <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center font-black text-sm text-primary shrink-0">
                    {permiso.docente.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm uppercase tracking-tight">{permiso.docente}</p>
                        <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", tipoInfo.color)}>
                            {tipoInfo.label}
                        </span>
                        {!isPast && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> Activo
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex-wrap">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {startStr} → {endStr}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {diffDays} día(s)</span>
                    </div>
                    {permiso.observaciones && (
                        <p className="text-[11px] text-muted-foreground font-medium italic mt-1">{permiso.observaciones}</p>
                    )}
                </div>

                <button
                    onClick={() => handleDelete(permiso.id)}
                    disabled={deletingId === permiso.id}
                    className="p-2 hover:bg-destructive/10 rounded-xl text-destructive/50 hover:text-destructive transition-all shrink-0"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Actions bar */}
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {activePermisos.length} permiso(s) activo(s)
                </p>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 h-11 px-5 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Permiso
                </button>
            </div>

            {/* Active permits */}
            {activePermisos.length > 0 ? (
                <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Permisos Activos</h3>
                    {activePermisos.map(p => renderPermiso(p, false))}
                </div>
            ) : (
                <div className="p-16 text-center premium-card rounded-[2.5rem] border border-dashed border-border/40">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="font-black text-sm uppercase tracking-widest text-muted-foreground">No hay permisos activos</p>
                </div>
            )}

            {/* Historical permits */}
            {pastPermisos.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Historial</h3>
                    {pastPermisos.map(p => renderPermiso(p, true))}
                </div>
            )}

            {/* CREATE MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                    <div className="bg-card w-full max-w-lg p-6 rounded-[2.5rem] shadow-2xl border border-border/40 space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">Nuevo Permiso</h3>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Ausencia extendida / Reposo</p>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 hover:bg-accent rounded-full transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Docente select */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1 flex items-center gap-1.5">
                                    <User className="w-3 h-3" /> Docente / Personal *
                                </label>
                                <select
                                    value={docenteId}
                                    onChange={e => setDocenteId(e.target.value)}
                                    className="w-full h-14 bg-accent/30 rounded-2xl px-4 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="">Seleccionar persona...</option>
                                    {docentes.map((d: any) => (
                                        <option key={d.id} value={d.id}>{d.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Tipo */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1">Tipo de Permiso *</label>
                                <select
                                    value={tipo}
                                    onChange={e => setTipo(e.target.value)}
                                    className="w-full h-14 bg-accent/30 rounded-2xl px-4 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    {Object.entries(TIPO_LABELS).map(([key, val]) => (
                                        <option key={key} value={key}>{val.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date range */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1">Desde *</label>
                                    <input
                                        type="date"
                                        value={fechaInicio}
                                        onChange={e => setFechaInicio(e.target.value)}
                                        className="w-full h-14 bg-accent/30 rounded-2xl px-4 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1">Hasta *</label>
                                    <input
                                        type="date"
                                        value={fechaFin}
                                        onChange={e => setFechaFin(e.target.value)}
                                        className="w-full h-14 bg-accent/30 rounded-2xl px-4 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            {/* Duration preview */}
                            {fechaInicio && fechaFin && fechaInicio <= fechaFin && (
                                <div className="px-4 py-3 bg-primary/5 rounded-2xl border border-primary/10 text-xs font-black text-primary uppercase tracking-widest text-center">
                                    Duración: {Math.round((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (1000 * 60 * 60 * 24)) + 1} día(s)
                                </div>
                            )}

                            {/* Observaciones */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1">Observaciones</label>
                                <textarea
                                    rows={3}
                                    value={observaciones}
                                    onChange={e => setObservaciones(e.target.value)}
                                    placeholder="Certificado médico, número de oficio, detalles..."
                                    className="w-full bg-accent/30 rounded-2xl p-4 text-sm font-medium border-none outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => { setIsModalOpen(false); resetForm(); }}
                                className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest bg-accent hover:bg-accent/80 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={saving}
                                className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? "Guardando..." : "Registrar Permiso"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={confirmDialog.open}
                title="¿Eliminar Permiso?"
                description="Esta acción eliminará permanentemente el registro del permiso. ¿Deseas continuar?"
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                variant="danger"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmDialog({ open: false, id: null })}
            />
        </div>
    );
}
