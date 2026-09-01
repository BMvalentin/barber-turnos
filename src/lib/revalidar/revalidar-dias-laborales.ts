import { revalidatePath } from "next/cache";

export function revalidarDiasLaborales(): void {
  revalidatePath("/admin/config/empleados/horarios-laborales");
  revalidatePath("/admin/barbero");
}
