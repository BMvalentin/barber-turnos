import { revalidatePath, revalidateTag } from "next/cache";

export function revalidarCacheTurno(barberoId: string, fecha: string): void {
  revalidateTag(`turnos-${barberoId}-${fecha}`);
  revalidateTag("turnos-global");
  revalidatePath("/turno");
  revalidatePath("/admin");
}
