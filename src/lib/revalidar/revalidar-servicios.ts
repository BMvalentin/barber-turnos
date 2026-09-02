import { revalidatePath, revalidateTag } from "next/cache";

export function revalidarServicios(idServicio?: string): void {
  revalidateTag("servicios");
  if (idServicio) revalidateTag(`servicio-${idServicio}`);
  revalidatePath("/");
  revalidatePath("/servicio");
  revalidatePath("/admin/servicio");
  revalidatePath("/turno");
}
