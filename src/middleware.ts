import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

// 1. Especificar rutas protegidas y públicas
const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login", "/"];

export default async function middleware(req: NextRequest) {
    // 2. Verificar si la ruta actual está protegida
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
    const isPublicRoute = publicRoutes.includes(path);

    // 3. Obtener la sesión de la cookie
    const cookie = req.cookies.get("session")?.value;
    const session = cookie ? await decrypt(cookie).catch(() => null) : null;

    // 4. Redirigir a /login si no hay sesión y la ruta es protegida
    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // 5. Redirigir a /dashboard si hay sesión y la ruta es pública (login)
    if (isPublicRoute && session && path === "/login") {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    return NextResponse.next();
}

// Configurar en qué rutas se debe ejecutar el middleware
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
