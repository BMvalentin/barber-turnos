import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

const DURACION_CACHE_ROL_MS = 60_000;

type EntradaCacheRol = {
  rol: string | null;
  expiraEn: number;
};

// Caché en módulo en lugar de unstable_cache: requerirAdmin se ejecuta dentro de
// Server Actions (contexto principal de uso), donde unstable_cache no está disponible.
const cacheRolPorUsuario = new Map<string, EntradaCacheRol>();

/**
 * Devuelve la sesión si hay un usuario autenticado, o null si no.
 * No lanza: todas las acciones pueden manejar el null con un error "No autorizado".
 */
export async function requerirSesion(): Promise<Session | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;
    return session;
  } catch (error) {
    return null;
  }
}

/**
 * Consulta el rol REAL del usuario en BD, con caché corta (60s) por usuario.
 * Devuelve null si el usuario fue eliminado de la BD.
 */
async function consultarRolReal(userId: string): Promise<string | null> {
  const ahora = Date.now();
  const entrada = cacheRolPorUsuario.get(userId);
  if (entrada && entrada.expiraEn > ahora) return entrada.rol;

  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  const rol = usuario?.role ?? null;
  cacheRolPorUsuario.set(userId, { rol, expiraEn: ahora + DURACION_CACHE_ROL_MS });
  return rol;
}

/**
 * Devuelve la sesión solo si el usuario es ADMIN en BD, o null en caso contrario.
 * No confía en el rol del JWT (puede quedar desactualizado): consulta la BD.
 */
export async function requerirAdmin(): Promise<Session | null> {
  const session = await requerirSesion();
  if (!session) return null;

  const rol = await consultarRolReal(session.user.id);
  if (rol !== "ADMIN") return null;
  return session;
}