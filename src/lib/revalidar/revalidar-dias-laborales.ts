import { revalidatePath } from "next/cache";

export function revalidarDiasLaborales(): void {
  revalidatePath("/diaLaboral");
}
