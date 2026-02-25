"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Clock,
    User,
    Users,
    ChevronRight,
    Filter,
    FileSpreadsheet
} from "lucide-react";
import { cn, formatTime12h } from "@/lib/utils";
import { deleteHorario } from "@/lib/actions";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/components/common/DeleteConfirmModal";
import { HorarioModal } from "./HorarioModal";
import { BulkHorarioUploadModal } from "./BulkHorarioUploadModal";

interface HorariosContentProps {
    initialHorarios: any[];
    secciones: any[];
    materias: any[];
    docentes: any[];
    currentDay: string;
}

const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"];

export function HorariosContent({ initialHorarios, secciones, materias, docentes, currentDay }: HorariosContentProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingHorario, setEditingHorario] = useState<any>(null);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    const handleDelete = async () => {
        if (!idToDelete) return;
        const formData = new FormData();
        formData.append("id", idToDelete);
        const res = await deleteHorario(formData);
        if (res.success) {
            toast.success(res.message);
        } else {
            toast.error(res.error);
        }
        setIsDeleteModalOpen(false);
        setIdToDelete(null);
    };

    const filteredHorarios = initialHorarios.filter(h =>
    (h.materia?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        h.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
        h.docente?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        h.seccion?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        h.seccion?.grado?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Day Selector */}
            <div className="flex flex-wrap gap-2 pb-2">
                <div className="flex bg-accent/30 p-1.5 rounded-2xl border border-border/40 w-full overflow-x-auto scroolbar-hide">
                    {DIAS.map((dia) => (
                        <button
                            key={dia}
                            onClick={() => router.push(`/dashboard/horarios?day=${dia}`)}
                            className={cn(
                                "flex-1 min-w-[100px] px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                currentDay === dia
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                        >
                            {dia}
                        </button>
                    ))}
                </div>
            </div>

            {/* Unified Action Toolbar */}
            <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-2 bg-card/40 border border-border/40 rounded-[2rem] backdrop-blur-md shadow-sm">

                {/* Search */}
                <div className="flex flex-col md:flex-row flex-1 w-full gap-2 items-center px-2">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar materia, docente o sección..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-transparent border-none py-3 pl-8 pr-4 text-sm focus:ring-0 outline-none font-medium placeholder:text-muted-foreground/60"
                        />
                    </div>
                </div>

                <div className="w-full h-px bg-border/50 xl:hidden" />
                <div className="w-px h-8 bg-border/50 hidden xl:block mx-2" />

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto px-2 pb-2 xl:p-0">
                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-all ml-auto xl:ml-0 group"
                        title="Importar Excel"
                    >
                        <FileSpreadsheet className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline">Importar</span>
                    </button>
                    <button
                        onClick={() => {
                            setEditingHorario(null);
                            setIsFormModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 group ml-auto xl:ml-2"
                        title="Crear Horario"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        Nuevo Horario
                    </button>
                </div>
            </div>

            {/* Schedule Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredHorarios.map((h) => {
                    const isActivity = !h.materia;
                    const title = isActivity ? h.descripcion : h.materia?.nombre;
                    const subtitle = isActivity ? "Actividad Personal" : `${h.seccion?.nombre} - ${h.seccion?.grado}`;
                    const initial = title ? title[0] : "?";
                    const colorClass = isActivity ? "bg-indigo-600" : (h.materia?.color || "bg-primary/10");

                    return (
                        <div key={h.id} className="premium-card p-6 rounded-[2.5rem] space-y-4 group hover:border-primary/30 transition-all border-border/40">
                            <div className="flex items-start justify-between">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden",
                                    colorClass
                                )}>
                                    <div className="absolute inset-0 bg-white/10" />
                                    <span className="text-white font-black text-xl uppercase relative z-10">
                                        {initial}
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => {
                                            setEditingHorario(h);
                                            setIsFormModalOpen(true);
                                        }}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-accent rounded-xl text-muted-foreground transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIdToDelete(h.id);
                                            setIsDeleteModalOpen(true);
                                        }}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-destructive/10 rounded-xl text-destructive transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-black tracking-tight">{title}</h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                    <Users className="w-3 h-3 text-emerald-500" />
                                    {subtitle}
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2 bg-accent/30 p-3 rounded-xl border border-border/20">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-black tracking-tighter">{formatTime12h(h.horaInicio)}</span>
                                        <span className="text-[10px] text-muted-foreground font-bold">a</span>
                                        <span className="text-xs font-black tracking-tighter">{formatTime12h(h.horaFin)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-accent/30 p-3 rounded-xl border border-border/20">
                                    <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Responsable</p>
                                        <p className="text-xs font-bold leading-none">{h.docente?.nombre || "Asignar..."}</p>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-card border border-border/40 hover:bg-accent rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                Detalles del Bloque
                            </button>
                        </div>
                    );
                })}

                {/* Add Schedule Placeholder */}
                {/* Add Schedule Placeholder */}
                <button
                    onClick={() => {
                        setEditingHorario(null);
                        setIsFormModalOpen(true);
                    }}
                    className="border-2 border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/[0.02] rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 transition-all group min-h-[300px]"
                >
                    <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                        <Plus className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="text-center">
                        <p className="font-black">Nuevo Horario</p>
                        <p className="text-[10px] text-muted-foreground max-w-[120px] uppercase tracking-wider">Cargar clase</p>
                    </div>
                </button>
            </div>

            <HorarioModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setEditingHorario(null);
                }}
                secciones={secciones}
                materias={materias}
                docentes={docentes}
                editingHorario={editingHorario}
                day={currentDay}
            />

            <BulkHorarioUploadModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                docentes={docentes}
                secciones={secciones}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setIdToDelete(null);
                }}
                onConfirm={handleDelete}
                title="¿Eliminar Horario?"
                description="Esta acción eliminará este bloque de clase. No se puede deshacer."
            />
        </div>
    );
}
