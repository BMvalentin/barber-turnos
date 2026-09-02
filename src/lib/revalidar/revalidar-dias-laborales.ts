import { revalidatePath, revalidateTag } from "next/cache";

export function revalidarDiasLaborales(idBarbero?: string): void {
  if (idBarbero) revalidateTag(`margenes-${idBarbero}`);
  revalidatePath("/admin/config/empleados/horarios-laborales");
  revalidatePath("/admin/barbero");
  revalidatePath("/turno");
}
