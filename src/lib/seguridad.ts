import { auth } from "@/auth";
import type { Session } from "next-auth";

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
 * Devuelve la sesión solo si el usuario es ADMIN, o null en caso contrario.
 */
export async function requerirAdmin(): Promise<Session | null> {
  const session = await requerirSesion();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}