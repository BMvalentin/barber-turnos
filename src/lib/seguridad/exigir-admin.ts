import { requerirAdmin } from "@/lib/seguridad/requerir-admin";

/**
 * Envuelve una server action que exige un ADMIN real (rol en BD): ejecuta
 * requerirAdmin() al inicio y, si no hay admin, devuelve el error estándar
 * { success: false, error: "No autorizado" }. Mantiene la firma y el tipo de
 * retorno de la acción original.
 * Un fallo de BD durante la consulta del rol también devuelve el error estándar:
 * el wrapper nunca rechaza por el chequeo de autorización.
 */
export function exigirAdmin<Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R>,
): (...args: Args) => Promise<R> {
  return async (...args: Args): Promise<R> => {
    let sesion: Awaited<ReturnType<typeof requerirAdmin>>;
    try {
      sesion = await requerirAdmin();
    } catch {
      return { success: false, error: "No autorizado" } as R;
    }
    if (!sesion) {
      return { success: false, error: "No autorizado" } as R;
    }
    return fn(...args);
  };
}
