import type { Session } from "next-auth";
import type { RolUsuario } from "@/types/usuario";

/**
 * Chequeo manual barato de rol ADMIN a partir del JWT de la sesión.
 * El rol del JWT puede quedar desactualizado respecto de la BD; para
 * autorización sensible usar requerirAdmin(), que consulta la BD.
 */
export function esAdmin(sesion: Session | null): boolean {
  return sesion?.user?.role === "ADMIN";
}

export function esEmpleado(sesion: Session | null): boolean {
  return sesion?.user?.role === "EMPLEADO";
}

export function obtenerRol(sesion: Session | null): RolUsuario | null {
  return sesion?.user?.role ?? null;
}
