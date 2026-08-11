import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { esAdmin } from "@/lib/seguridad/es-admin";
import type { Session } from "next-auth";

/**
 * Devuelve la sesión si el usuario es el propietario del recurso (userId) o
 * un admin según el JWT, o null en caso contrario. El caller decide qué
 * devolver ante el null (mensaje de error, redirección, lista vacía, etc.).
 */
export async function requerirPropietarioOAdmin(userId: string): Promise<Session | null> {
  const sesion = await requerirSesion();
  if (!sesion) return null;
  if (esAdmin(sesion) || sesion.user.id === userId) return sesion;
  return null;
}
