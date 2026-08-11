import { revalidatePath } from "next/cache";

export function revalidarServicios(): void {
  revalidatePath("/servicio");
}
