import { revalidatePath } from "next/cache";

export function revalidarBarberos(): void {
  revalidatePath("/admin/barbero");
}
