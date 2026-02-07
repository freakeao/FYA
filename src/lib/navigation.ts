import {
    Users,
    Calendar,
    BookOpen,
    ClipboardCheck,
    LayoutDashboard,
    UserX,
    UserCog,
    ShieldCheck,
    BarChart3
} from "lucide-react";

export const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Asistencia Alumnos", href: "/dashboard/asistencia", icon: ClipboardCheck },
    { name: "Asistencia Personal", href: "/dashboard/asistencia/personal", icon: ShieldCheck, adminOrCoord: true },
    { name: "Horarios", href: "/dashboard/horarios", icon: Calendar, adminOrCoord: true },
    { name: "Secciones", href: "/dashboard/secciones", icon: Users, adminOrCoord: true },
    { name: "Materias", href: "/dashboard/materias", icon: BookOpen, adminOrCoord: true },
    { name: "Reportes", href: "/dashboard/reportes", icon: BarChart3 },
    { name: "Mis Inasistencias", href: "/dashboard/mis-inasistencias", icon: UserX, docenteOnly: true },
    { name: "Personal", href: "/dashboard/personal", icon: UserCog, adminOrCoord: true },
    { name: "Usuarios", href: "/dashboard/usuarios", icon: ShieldCheck, adminOnly: true },
];
