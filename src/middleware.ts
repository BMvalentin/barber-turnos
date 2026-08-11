import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const { nextUrl } = req;

  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  const isProtectedRoute = ["/dashboard", "/turno", "/admin"].some((route) => 
    nextUrl.pathname.startsWith(route)
  );

  // 1. .redirect
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // 2. Lógica de ADMIN
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const callbackUrl = nextUrl.pathname + nextUrl.search;
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl));
    }
    
    if (userRole !== "ADMIN") {
      // Redirigir si no tiene permisos
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    
    return NextResponse.next();
  }

  // 3. Protección de rutas generales
  if (isProtectedRoute && !isLoggedIn) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl));
  }

  // 4. Requiere teléfono para sacar turno
  if (nextUrl.pathname.startsWith("/turno") && isLoggedIn && !req.auth?.user?.telefono) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

// Alcance del JWT: solo las rutas que este middleware realmente protege.
// /api/auth y el resto de rutas públicas ya no pasan por el JWT (objetivo Fase 1.5).
export const config = {
  matcher: ["/admin/:path*", "/turno/:path*", "/dashboard/:path*", "/login", "/register"],
};