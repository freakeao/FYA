"use client";

import { useState, useRef } from "react";
import { UserCheck, UserX, Search, AlertCircle, Calendar as CalendarIcon, X, Save, RotateCcw, Shield, Clock, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { upsertAsistenciaDocente, deleteAsistenciaDocente, getHorariosDelDia } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface AsistenciaPersonalContentProps {
    docentes: any[];
    asistenciaInicial: any[];
    selectedDate: string;
}

export function AsistenciaPersonalContent({ docentes, asistenciaInicial, selectedDate }: AsistenciaPersonalContentProps) {
    const [search, setSearch] = useState("");
    const [asistencias, setAsistencias] = useState(asistenciaInicial);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Modal state
    const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
    const [selectedDocenteForAbsence, setSelectedDocenteForAbsence] = useState<string | null>(null);
    const [absenceType, setAbsenceType] = useState("INJUSTIFICADA");
    const [observaciones, setObservaciones] = useState("");
    const [horariosDelDia, setHorariosDelDia] = useState<any[]>([]);
    const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]); // "ALL" or horarioId[]
    const [isFullDay, setIsFullDay] = useState(true);
    const [loadingHorarios, setLoadingHorarios] = useState(false);

    // Confirm dialog state
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; docenteId: string | null }>({
        open: false,
        docenteId: null,
    });

    const requestReset = (docenteId: string) => {
        setConfirmDialog({ open: true, docenteId });
    };

    const confirmReset = async () => {
        if (!confirmDialog.docenteId) return;
        const docenteId = confirmDialog.docenteId;
        setConfirmDialog({ open: false, docenteId: null });
        setLoadingId(docenteId);
        const res = await deleteAsistenciaDocente(docenteId, selectedDate);
        setLoadingId(null);
        if (res.success) {
            toast.success("Asistencia restablecida");
            setAsistencias(prev => prev.filter(a => a.docenteId !== docenteId));
        } else {
            toast.error(res.error);
        }
    };

    const handlePresent = async (docenteId: string) => {
        setLoadingId(docenteId);
        const res = await upsertAsistenciaDocente({
            docenteId,
            presente: true,
            fecha: selectedDate,
            observaciones: "",
            tipo: null as any
        });
        setLoadingId(null);

        if (res.success) {
            toast.success("Marcado como PRESENTE");
            updateLocalState(docenteId, true, null, "", null);
        } else {
            toast.error(res.error);
        }
    };

    const handleReset = async (docenteId: string) => {
        requestReset(docenteId);
    };

    const openAbsenceModal = async (docenteId: string) => {
        const existing = asistencias.find(a => a.docenteId === docenteId);
        setSelectedDocenteForAbsence(docenteId);
        setAbsenceType(existing?.tipo || "INJUSTIFICADA");
        setObservaciones(existing?.observaciones || "");
        setIsFullDay(true);
        setSelectedBlocks([]);
        setHorariosDelDia([]);
        setIsAbsenceModalOpen(true);

        // Fetch teacher's schedule blocks for the selected day
        setLoadingHorarios(true);
        const blocks = await getHorariosDelDia(docenteId, selectedDate);
        setHorariosDelDia(blocks);
        setLoadingHorarios(false);
    };

    const toggleBlock = (blockId: string) => {
        setSelectedBlocks(prev =>
            prev.includes(blockId) ? prev.filter(id => id !== blockId) : [...prev, blockId]
        );
    };

    const saveAbsence = async () => {
        if (!selectedDocenteForAbsence) return;

        setLoadingId(selectedDocenteForAbsence);
        setIsAbsenceModalOpen(false);

        if (isFullDay) {
            // Register a full-day absence (no horarioId)
            const res = await upsertAsistenciaDocente({
                docenteId: selectedDocenteForAbsence,
                presente: false,
                fecha: selectedDate,
                observaciones,
                tipo: absenceType,
                horarioId: null
            });
            if (res.success) {
                toast.success("Ausencia de día completo registrada");
                updateLocalState(selectedDocenteForAbsence, false, absenceType, observaciones, null);
            } else {
                toast.error(res.error);
            }
        } else {
            // Register per-block absences
            if (selectedBlocks.length === 0) {
                toast.error("Selecciona al menos un bloque horario");
                setLoadingId(null);
                return;
            }
            let anyError = false;
            for (const blockId of selectedBlocks) {
                const res = await upsertAsistenciaDocente({
                    docenteId: selectedDocenteForAbsence,
                    presente: false,
                    fecha: selectedDate,
                    observaciones,
                    tipo: absenceType,
                    horarioId: blockId
                });
                if (!res.success) anyError = true;
            }
            if (anyError) {
                toast.error("Algunas ausencias no pudieron registrarse");
            } else {
                toast.success(`${selectedBlocks.length} bloque(s) marcados como ausentes`);
            }
            router.refresh();
        }

        setLoadingId(null);
    };

    const updateLocalState = (docenteId: string, presente: boolean, tipo: string | null, obs: string, horarioId: string | null) => {
        setAsistencias(prev => {
            const filtered = prev.filter(a => a.docenteId !== docenteId || (horarioId && a.horarioId !== horarioId));
            return [...filtered, { docenteId, presente, tipo, observaciones: obs, horarioId }];
        });
    };

    const filteredDocentes = docentes.filter(d =>
        d.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (d.usuario && d.usuario.toLowerCase().includes(search.toLowerCase()))
    );

    const getDocenteStatus = (docenteId: string) => {
        const records = asistencias.filter(a => a.docenteId === docenteId);
        if (records.length === 0) return { status: "pending", label: "Pendiente" };
        const hasAbsent = records.some(a => a.presente === false);
        const hasPresent = records.some(a => a.presente === true);
        if (hasPresent && !hasAbsent) return { status: "present", label: "Presente" };
        if (hasAbsent && !hasPresent) {
            const blockCount = records.filter(a => a.horarioId).length;
            return blockCount > 0
                ? { status: "partial", label: `${blockCount} bloque(s) ausente` }
                : { status: "absent", label: records[0]?.tipo?.replace(/_/g, " ") || "AUSENTE" };
        }
        return { status: "mixed", label: `Parcial` };
    };

    return (
        <div className="space-y-6">
            {/* Search and Date Navigator Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar docente..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-14 bg-card/40 backdrop-blur-xl border border-border/40 rounded-3xl pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                </div>

                <div className="flex items-center gap-2 bg-white/70 backdrop-blur-3xl border border-white/40 rounded-3xl p-1.5 h-14 w-full lg:w-auto shadow-sm">
                    <button
                        type="button"
                        onClick={() => {
                            const d = new Date(selectedDate + "T12:00:00");
                            d.setDate(d.getDate() - 1);
                            router.push(`/dashboard/asistencia/personal?date=${d.toISOString().split("T")[0]}`);
                        }}
                        className="h-11 w-11 flex items-center justify-center rounded-2xl hover:bg-accent transition-all active:scale-90 text-muted-foreground hover:text-primary"
                        title="Día Anterior"
                    >
                        <RotateCcw className="w-4 h-4 -rotate-90" />
                    </button>

                    <div
                        onClick={() => dateInputRef.current?.showPicker()}
                        className="relative flex-1 lg:flex-none flex items-center justify-center min-w-[200px] px-4 group cursor-pointer hover:bg-accent/30 rounded-2xl transition-all h-11"
                    >
                        <CalendarIcon className="w-4 h-4 text-primary/40 mr-3" />
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest leading-none mb-0.5">
                                {new Date(selectedDate + "T12:00:00").toLocaleDateString('es-ES', { weekday: 'long' })}
                            </span>
                            <span className="text-xs font-black uppercase tracking-tighter">
                                {new Date(selectedDate + "T12:00:00").toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        <input
                            ref={dateInputRef}
                            type="date"
                            value={selectedDate}
                            onChange={(e) => router.push(`/dashboard/asistencia/personal?date=${e.target.value}`)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full pointer-events-none"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            const d = new Date(selectedDate + "T12:00:00");
                            d.setDate(d.getDate() + 1);
                            router.push(`/dashboard/asistencia/personal?date=${d.toISOString().split("T")[0]}`);
                        }}
                        className="h-11 w-11 flex items-center justify-center rounded-2xl hover:bg-accent transition-all active:scale-90 text-muted-foreground hover:text-primary"
                        title="Día Siguiente"
                    >
                        <RotateCcw className="w-4 h-4 rotate-90" />
                    </button>
                </div>
            </div>

            {/* Teacher Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocentes.map((docente: any) => {
                    const { status, label } = getDocenteStatus(docente.id);
                    const isPending = status === "pending";
                    const isPresent = status === "present";

                    return (
                        <div key={docente.id} className={cn(
                            "premium-card p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group flex flex-col gap-4",
                            status === "absent" ? "border-destructive/20" :
                                status === "partial" ? "border-amber-400/30" :
                                    status === "present" ? "border-emerald-500/20" :
                                        "border-border/40"
                        )}>
                            {/* Status Indicator Stripe */}
                            <div className={cn(
                                "absolute top-0 left-0 w-full h-1.5",
                                status === "absent" ? "bg-destructive" :
                                    status === "partial" ? "bg-amber-400" :
                                        status === "present" ? "bg-emerald-500" :
                                            "bg-border/40"
                            )} />

                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg uppercase transition-colors shrink-0",
                                        status === "present" ? "bg-emerald-500/10 text-emerald-600" :
                                            status === "absent" ? "bg-destructive/10 text-destructive" :
                                                status === "partial" ? "bg-amber-400/10 text-amber-600" :
                                                    "bg-accent text-muted-foreground"
                                    )}>
                                        {docente.nombre[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-lg leading-tight line-clamp-1 truncate">{docente.nombre}</p>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            {docente.cedula ? `V-${docente.cedula}` : "Sin Cédula"}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border bg-accent/50 text-muted-foreground border-border/50 shrink-0">
                                    {docente.rol}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-border/40 gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    {docente.usuario ? (
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md max-w-[120px] md:max-w-none">
                                            <Shield className="w-3 h-3 shrink-0" />
                                            <span className="truncate">@{docente.usuario}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">
                                            <UserX className="w-3 h-3 shrink-0" />
                                            Sin Acceso
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    {isPending ? (
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handlePresent(docente.id)}
                                                disabled={loadingId === docente.id}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-accent/50 hover:bg-emerald-500/10 rounded-xl text-muted-foreground hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-500/20"
                                                title="Marcar Presente"
                                            >
                                                <UserCheck className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Presente</span>
                                            </button>
                                            <button
                                                onClick={() => openAbsenceModal(docente.id)}
                                                disabled={loadingId === docente.id}
                                                className="p-2 hover:bg-destructive/10 rounded-xl text-destructive transition-colors"
                                                title="Registrar Ausencia"
                                            >
                                                <UserX className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                                isPresent ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                                    status === "partial" ? "bg-amber-400/10 text-amber-700 border-amber-400/20" :
                                                        "bg-destructive/10 text-destructive border-destructive/20"
                                            )}>
                                                {label}
                                            </div>
                                            <button
                                                onClick={() => handleReset(docente.id)}
                                                className="p-2 hover:bg-accent rounded-xl text-muted-foreground transition-all hover:rotate-180 duration-500"
                                                title="Restablecer"
                                                disabled={loadingId === docente.id}
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openAbsenceModal(docente.id)}
                                                disabled={loadingId === docente.id}
                                                className="p-2 hover:bg-destructive/10 rounded-xl text-destructive/60 hover:text-destructive transition-colors"
                                                title="Editar/Agregar Ausencia"
                                            >
                                                <UserX className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredDocentes.length === 0 && (
                <div className="p-20 text-center space-y-4 premium-card rounded-[3rem] bg-accent/10">
                    <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto border border-border/40 shadow-xl">
                        <AlertCircle className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-black text-xl uppercase tracking-tighter text-muted-foreground">No se encontraron docentes</p>
                        <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Asegúrese de haber registrado personal docente en el módulo de Usuarios.</p>
                    </div>
                </div>
            )}

            {/* ABSENCE MODAL */}
            {isAbsenceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                    <div className="bg-card w-full max-w-lg p-6 rounded-[2.5rem] shadow-2xl space-y-6 border border-border/40 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black uppercase tracking-tight">Registrar Ausencia</h3>
                            <button onClick={() => setIsAbsenceModalOpen(false)} className="p-2 hover:bg-accent rounded-full transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Full Day vs Blocks Toggle */}
                        <div className="flex gap-2 p-1 bg-accent/30 rounded-2xl">
                            <button
                                onClick={() => setIsFullDay(true)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    isFullDay ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <CalendarIcon className="w-3.5 h-3.5" />
                                Día Completo
                            </button>
                            <button
                                onClick={() => setIsFullDay(false)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    !isFullDay ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Layers className="w-3.5 h-3.5" />
                                Por Bloques
                            </button>
                        </div>

                        {/* Block Selector */}
                        {!isFullDay && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" /> Seleccionar Bloques Ausentes
                                </label>
                                {loadingHorarios ? (
                                    <div className="py-6 text-center text-xs text-muted-foreground font-bold uppercase tracking-widest animate-pulse">
                                        Cargando bloques...
                                    </div>
                                ) : horariosDelDia.length === 0 ? (
                                    <div className="py-6 text-center text-xs text-muted-foreground font-bold uppercase tracking-widest bg-accent/30 rounded-2xl">
                                        No hay bloques programados para este día
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {horariosDelDia.map((bloque: any) => (
                                            <button
                                                key={bloque.id}
                                                onClick={() => toggleBlock(bloque.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all",
                                                    selectedBlocks.includes(bloque.id)
                                                        ? "border-destructive/50 bg-destructive/5"
                                                        : "border-border/40 bg-accent/10 hover:bg-accent/30"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
                                                    selectedBlocks.includes(bloque.id)
                                                        ? "border-destructive bg-destructive"
                                                        : "border-border/60"
                                                )}>
                                                    {selectedBlocks.includes(bloque.id) && (
                                                        <div className="w-2 h-2 rounded-full bg-white" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm">{bloque.materia}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{bloque.seccion}</p>
                                                </div>
                                                <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-[10px] font-black">{bloque.horaInicio} – {bloque.horaFin}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1">Tipo de Ausencia</label>
                                <select
                                    className="w-full h-14 bg-accent/30 rounded-2xl px-4 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary/20"
                                    value={absenceType}
                                    onChange={(e) => setAbsenceType(e.target.value)}
                                >
                                    <option value="INJUSTIFICADA">Injustificada</option>
                                    <option value="REPOSO_MEDICO">Reposo Médico</option>
                                    <option value="PERMISO_PERSONAL">Permiso Personal</option>
                                    <option value="VACACIONES">Vacaciones</option>
                                    <option value="OTRO">Otro Motivo</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1">Observaciones</label>
                                <textarea
                                    className="w-full h-28 bg-accent/30 rounded-2xl p-4 text-sm font-medium border-none outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                    placeholder="Detalles adicionales sobre la ausencia..."
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setIsAbsenceModalOpen(false)}
                                className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest bg-accent hover:bg-accent/80 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={saveAbsence}
                                className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Guardar Ausencia
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Reset Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.open}
                title="¿Restablecer Asistencia?"
                description="Se eliminará el registro de asistencia de este docente para el día de hoy. Esta acción no se puede deshacer."
                confirmLabel="Restablecer"
                cancelLabel="Cancelar"
                variant="danger"
                onConfirm={confirmReset}
                onCancel={() => setConfirmDialog({ open: false, docenteId: null })}
            />
        </div>
    );
}
