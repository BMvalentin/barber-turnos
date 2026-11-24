import { revalidatePath, revalidateTag } from "next/cache";

export function revalidarBarberos(): void {
  revalidateTag("barberos");
  revalidatePath("/admin/barbero");
  revalidatePath("/admin/barbero/perfil");
  revalidatePath("/admin/config/empleados/horarios-laborales");
  revalidatePath("/admin/config/empleados/horarios-laborales/excepciones");
  revalidatePath("/dashboard");
  revalidatePath("/admin/turno");
}
