"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Search,
    Edit2,
    Trash2,
    ArrowLeft,
    GraduationCap,
    RefreshCw
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { deleteEstudiante, assignDocenteToSeccion, removeDocenteFromSeccion } from "@/lib/actions";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/components/common/DeleteConfirmModal";
import { useRouter } from "next/navigation";
import { EstudianteModal } from "./EstudianteModal";
import { BulkUploadModal } from "./BulkUploadModal";
import { User, UserPlus, UserMinus, UserCheck, ChevronDown } from "lucide-react";

interface EstudiantesContentProps {
    seccion: any;
    initialAlumnos: any[];
    initialDocentes: any[];
    availableDocentes: any[];
}

export function EstudiantesContent({ seccion, initialAlumnos, initialDocentes, availableDocentes }: EstudiantesContentProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [editingEstudiante, setEditingEstudiante] = useState<any>(null);
    const [deletionType, setDeletionType] = useState<"estudiante" | "docente">("estudiante");

    const [activeTab, setActiveTab] = useState<"alumnos" | "docentes">("alumnos");
    const [docentes, setDocentes] = useState(initialDocentes);
    const [selectedDocenteId, setSelectedDocenteId] = useState("");
    const [isAssigning, setIsAssigning] = useState(false);
    const [docenteQuery, setDocenteQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Automatic Update: Poll every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setIsRefreshing(true);
            router.refresh();
            setTimeout(() => setIsRefreshing(false), 2000);
        }, 60000);
        return () => clearInterval(interval);
    }, [router]);


    const handleDelete = async () => {
        if (!idToDelete) return;

        if (deletionType === "estudiante") {
            const formData = new FormData();
            formData.append("id", idToDelete);
            formData.append("seccionId", seccion.id);
            const res = await deleteEstudiante(formData);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } else {
            const res = await removeDocenteFromSeccion(seccion.id, idToDelete);
            if (res.success) {
                toast.success(res.message);
                setDocentes(docentes.filter((d: any) => d.id !== idToDelete));
                router.refresh();
            } else {
                toast.error(res.error);
            }
        }

        setIsDeleteModalOpen(false);
        setIdToDelete(null);
    };

    const filteredAlumnos = initialAlumnos.filter(a =>
        a.nombre.toLowerCase().includes(search.toLowerCase())
    );

    const handleAssignDocente = async () => {
        if (!selectedDocenteId) return;
        setIsAssigning(true);
        const res = await assignDocenteToSeccion(seccion.id, selectedDocenteId);
        if (res.success) {
            toast.success(res.message);
            const newDocente = (availableDocentes as any[]).find(d => d.id === selectedDocenteId);
            if (newDocente) setDocentes([...docentes, { ...newDocente, materias: [] }]);
            setSelectedDocenteId("");
            setDocenteQuery("");
            router.refresh();
        } else {
            toast.error(res.error);
        }
        setIsAssigning(false);
    };

    const handleConfirmRemoveDocente = (docenteId: string) => {
        setIdToDelete(docenteId);
        setDeletionType("docente");
        setIsDeleteModalOpen(true);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard/secciones"
                            className="p-2 hover:bg-accent rounded-xl transition-all duration-300 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                            <Users className="w-4 h-4" />
                            Gestión de Estudiantes
                        </div>
                    </div>
                    <h2 suppressHydrationWarning className="text-3xl font-bold tracking-tight px-2">{seccion?.nombre || "Cargando..."}</h2>
                    <p suppressHydrationWarning className="text-sm text-muted-foreground px-2">Total: <span className="text-foreground font-bold">{initialAlumnos.length} Estudiantes</span></p>
                </div>

                <div className="flex bg-accent/30 p-1.5 rounded-2xl border border-border/40">
                    <button
                        onClick={() => setActiveTab("alumnos")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            activeTab === "alumnos"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                    >
                        <GraduationCap className="w-4 h-4" />
                        Estudiantes
                    </button>
                    <button
                        onClick={() => setActiveTab("docentes")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            activeTab === "docentes"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                    >
                        <User className="w-4 h-4" />
                        Docentes
                    </button>
                </div>
            </div>

            {/* Floating Sync Indicator */}
            <div className="fixed bottom-6 right-6 z-50">
                <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 shadow-xl shadow-emerald-500/10 transition-all duration-1000",
                    isRefreshing ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-4 pointer-events-none"
                )}>
                    <RefreshCw className={cn("w-3.5 h-3.5 text-emerald-600", isRefreshing && "animate-spin")} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Sincronizado</span>
                </div>
            </div>

            {/* Unified Action Toolbar */}
            <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-2 bg-card/40 border border-border/40 rounded-[2rem] backdrop-blur-md shadow-sm">

                {activeTab === "alumnos" ? (
                    <div className="flex flex-col md:flex-row flex-1 w-full gap-2 items-center px-2">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar estudiante por nombre o cédula..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent border-none py-3 pl-8 pr-4 text-sm focus:ring-0 outline-none font-medium placeholder:text-muted-foreground/60"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row flex-1 w-full gap-2 items-center px-2 relative">
                        <div className="relative flex-1 w-full group">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar docente por nombre o cédula..."
                                value={docenteQuery}
                                onChange={(e) => {
                                    setDocenteQuery(e.target.value);
                                    setIsSearchOpen(true);
                                }}
                                onFocus={() => setIsSearchOpen(true)}
                                className="w-full bg-transparent border-none py-3 pl-8 pr-4 text-sm focus:ring-0 outline-none font-medium placeholder:text-muted-foreground/60 focus:placeholder:text-muted-foreground"
                            />

                            {isSearchOpen && docenteQuery.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-4 bg-card border border-border/40 rounded-[2rem] shadow-2xl z-50 max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 p-2">
                                    {(availableDocentes as any[])
                                        .filter(ad =>
                                            !docentes.some((d: any) => d.id === ad.id) &&
                                            (ad.nombre.toLowerCase().includes(docenteQuery.toLowerCase()) ||
                                                ad.cedula?.toLowerCase().includes(docenteQuery.toLowerCase()))
                                        )
                                        .map((ad: any) => (
                                            <button
                                                key={ad.id}
                                                onClick={() => {
                                                    setSelectedDocenteId(ad.id);
                                                    setDocenteQuery(ad.nombre);
                                                    setIsSearchOpen(false);
                                                }}
                                                className="w-full text-left px-5 py-3 rounded-2xl hover:bg-accent/50 transition-colors flex flex-col gap-0.5"
                                            >
                                                <span className="text-sm font-bold">{ad.nombre}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{ad.cedula || "Sin cédula"} • {ad.rol}</span>
                                            </button>
                                        ))}
                                    {(availableDocentes as any[]).filter(ad =>
                                        !docentes.some((d: any) => d.id === ad.id) &&
                                        (ad.nombre.toLowerCase().includes(docenteQuery.toLowerCase()) ||
                                            ad.cedula?.toLowerCase().includes(docenteQuery.toLowerCase()))
                                    ).length === 0 && (
                                            <div className="p-4 text-center text-xs text-muted-foreground font-medium uppercase tracking-widest">
                                                No se encontraron docentes disponibles
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="w-full h-px bg-border/50 xl:hidden" />
                <div className="w-px h-8 bg-border/50 hidden xl:block mx-2" />

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto px-2 pb-2 xl:p-0">
                    {activeTab === "alumnos" ? (
                        <>
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
                            >
                                Importar Excel/CSV
                            </button>
                            <button
                                onClick={() => {
                                    setEditingEstudiante(null);
                                    setIsFormModalOpen(true);
                                }}
                                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 group ml-auto xl:ml-2"
                            >
                                <UserPlus className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                Nuevo Estudiante
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleAssignDocente}
                            disabled={!selectedDocenteId || isAssigning}
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 group disabled:opacity-50 ml-auto xl:ml-2 disabled:active:scale-100"
                        >
                            <UserCheck className="w-4 h-4" />
                            {isAssigning ? "Asignando..." : "Asignar"}
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            {
                activeTab === "alumnos" ? (
                    <div className="premium-card rounded-[2rem] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[700px]">
                                <thead className="bg-accent/10 border-b border-border/40">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Nº Lista</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Cédula / ID</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Nombre del Estudiante</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Género</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20">
                                    {filteredAlumnos.map((alumno) => (
                                        <tr key={alumno.id} className="group hover:bg-accent/5 transition-colors">
                                            <td className="px-8 py-5">
                                                <span className="text-sm font-black text-muted-foreground/70 group-hover:text-primary transition-colors">
                                                    {alumno.numeroLista?.toString().padStart(2, "0")}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-sm font-bold text-muted-foreground">
                                                    {alumno.cedula || "S/C"}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                                                        <GraduationCap className="w-5 h-5 text-muted-foreground" />
                                                    </div>
                                                    <span className="text-sm font-bold">{alumno.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={cn(
                                                    "text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider",
                                                    alumno.genero === "HEMBRA"
                                                        ? "bg-rose-50 border-rose-100 text-rose-600"
                                                        : "bg-blue-50 border-blue-100 text-blue-600"
                                                )}>
                                                    {alumno.genero === "HEMBRA" ? "Hembra" : "Varón"}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setEditingEstudiante(alumno);
                                                            setIsFormModalOpen(true);
                                                        }}
                                                        className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIdToDelete(alumno.id);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors group/del"
                                                    >
                                                        <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredAlumnos.length === 0 && (
                                <div className="p-20 text-center space-y-4">
                                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                                        <Search className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold">No se encontraron estudiantes</p>
                                        <p className="text-sm text-muted-foreground">Todavía no hay estudiantes cargados en esta sección.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Docentes Tab Content */
                    <div className="premium-card rounded-[2rem] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead className="bg-accent/10 border-b border-border/40">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Docente</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Materias que dicta</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Rol / Dept</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20">
                                    {docentes.map((docente: any) => (
                                        <tr key={docente.id} className="group hover:bg-accent/5 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold">{docente.nombre}</span>
                                                        <span className="text-[10px] text-muted-foreground">{docente.cedula || "S/C"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {docente.materias && docente.materias.length > 0 ? (
                                                        docente.materias.map((m: string, idx: number) => (
                                                            <span key={idx} className="text-[9px] font-black px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10 uppercase tracking-tighter">
                                                                {m}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-muted-foreground/50 italic uppercase tracking-widest">
                                                            Sin materias en horario
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[10px] font-black px-2 py-1 rounded-lg border border-border bg-accent/30 uppercase tracking-widest text-muted-foreground">
                                                    {docente.rol} {docente.departamentoNombre ? `/ ${docente.departamentoNombre}` : ""}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => handleConfirmRemoveDocente(docente.id)}
                                                    className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors group/del"
                                                    title="Remover docente de sección"
                                                >
                                                    <UserMinus className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {docentes.length === 0 && (
                                <div className="p-20 text-center space-y-4">
                                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                        <User className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold">No hay equipo docente asignado</p>
                                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                            Busca y asigna profesores usando el selector superior para conformar el equipo de esta sección.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            <EstudianteModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setEditingEstudiante(null);
                }}
                seccionId={seccion.id}
                editingEstudiante={editingEstudiante}
                nextNumeroLista={initialAlumnos.length + 1}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setIdToDelete(null);
                }}
                onConfirm={handleDelete}
                title={deletionType === "estudiante" ? "¿Eliminar Estudiante?" : "¿Remover Docente?"}
                description={deletionType === "estudiante"
                    ? "Esta acción eliminará al estudiante de forma permanente. No se puede deshacer."
                    : "Esta acción removerá al docente de esta sección, pero sus datos personales se mantendrán en el sistema."
                }
            />

            <BulkUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                seccionId={seccion.id}
            />
        </div>
    );
}
