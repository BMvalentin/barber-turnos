import { revalidatePath, revalidateTag } from "next/cache";

export function revalidarCacheTurno(barberoId: string, fecha: string, userId?: string): void {
  revalidateTag(`turnos-${barberoId}-${fecha}`);
  revalidateTag(`turnos-mes-${barberoId}-${fecha.substring(0, 7)}`);
  revalidateTag("turnos-global");
  if (userId) {
    revalidateTag(`turnos-user-${userId}`);
  }
  revalidatePath("/turno");
  revalidatePath("/admin");
}
