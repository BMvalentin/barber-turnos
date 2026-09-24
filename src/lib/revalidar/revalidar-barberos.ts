import { revalidatePath, revalidateTag } from "next/cache";

export function revalidarBarberos(): void {
  revalidateTag("barberos");
  revalidatePath("/admin/barbero");
  revalidatePath("/admin/barbero/perfil");
  revalidatePath("/turno");
}
