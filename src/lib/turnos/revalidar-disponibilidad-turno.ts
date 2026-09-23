import { revalidateTag } from "next/cache";

/**
 * Invalida los datos afectados por una reserva sin forzar el render inmediato
 * de páginas completas dentro de la respuesta de la Server Action.
 */
export function revalidarDisponibilidadTurno(
  barberoId: string,
  fecha: string,
  userId: string,
): void {
  revalidateTag(`turnos-${barberoId}-${fecha}`);
  revalidateTag(`turnos-mes-${barberoId}-${fecha.substring(0, 7)}`);
  revalidateTag("turnos-global");
  revalidateTag(`turnos-user-${userId}`);
}
