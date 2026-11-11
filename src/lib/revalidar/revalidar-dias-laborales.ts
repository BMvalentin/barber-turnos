import { revalidatePath, revalidateTag } from "next/cache";

export function revalidarDiasLaborales(idBarbero?: string): void {
  revalidateTag("dias-laborales");
  revalidateTag("barberos");
  if (idBarbero) revalidateTag(`margenes-${idBarbero}`);
  revalidatePath("/admin/config/empleados/horarios-laborales");
  revalidatePath("/admin/barbero");
  revalidatePath("/admin/barbero/perfil");
  revalidatePath("/turno");
}
