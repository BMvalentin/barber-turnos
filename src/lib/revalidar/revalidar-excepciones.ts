import { revalidatePath, revalidateTag } from "next/cache";

export function revalidarExcepciones(idBarbero: string | null | undefined): void {
  revalidateTag("excepciones-globales");
  if (idBarbero) revalidateTag(`excepciones-${idBarbero}`);
  revalidatePath("/admin/config/empleados/horarios-laborales/excepciones");
  revalidatePath("/turno");
}
