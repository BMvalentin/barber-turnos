import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import type { Session } from "next-auth";

/**
 * Devuelve la sesión si el usuario es el propietario del recurso (userId) o
 * un admin con rol vigente en BD, o null en caso contrario. El caller decide qué
 * devolver ante el null (mensaje de error, redirección, lista vacía, etc.).
 */
export async function requerirPropietarioOAdmin(userId: string): Promise<Session | null> {
  const sesion = await requerirSesion();
  if (!sesion) return null;
  if (sesion.user.id === userId) return sesion;
  const sesionAdmin = await requerirAdmin();
  if (sesionAdmin) return sesionAdmin;
  return null;
}
