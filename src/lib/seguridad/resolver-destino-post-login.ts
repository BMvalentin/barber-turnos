import { prisma } from "@/lib/prisma";
import type { RolUsuario } from "@/types/usuario";

/* Destinos de navegación post-login según el estado persistido del perfil. */
const RUTA_HOME = "/";
const RUTA_PANEL = "/admin";

/**
 * Única fuente de verdad sobre qué datos del perfil se exigen. Hoy sólo el
 * teléfono: es lo que el modal de `/dashboard` y el gate de `/turno` aplican,
 * y `name` no está validado en servidor (el esquema acepta cadena vacía).
 */
export function tienePerfilCompleto(
  usuario: { telefono?: string | null } | null | undefined,
): boolean {
  return Boolean(usuario?.telefono?.trim());
}

/* Panel de destino de un perfil completo según el rol. */
export function destinoSegunRol(rol: RolUsuario): string {
  return rol === "ADMIN" || rol === "EMPLEADO" ? RUTA_PANEL : RUTA_HOME;
}

/**
 * Resuelve el destino post-login con datos persistidos en BD (fuente de
 * verdad, no la sesión JWT). Devuelve `null` cuando falta el teléfono: el
 * usuario debe permanecer en `/dashboard`, sin importar su rol.
 */
export async function obtenerDestinoPostLogin(
  userId: string,
): Promise<string | null> {
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, telefono: true },
  });
  if (!usuario) return RUTA_HOME;
  return tienePerfilCompleto(usuario) ? destinoSegunRol(usuario.role) : null;
}
