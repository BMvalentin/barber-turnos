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
  } catch {
    return null;
  }
}
