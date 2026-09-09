import { MAX_IMAGENES_SERVICIO } from "./constantes";

/* Contrato entre el formulario y las server actions para imágenes de servicio.
   Por cada slot i (0..MAX_IMAGENES_SERVICIO-1):
   - `slotTipo${i}` = "url" | "archivo"
   - si "url": `slot${i}` = URL existente (string)
   - si "archivo": `slotArchivo${i}` = archivo nuevo (File) */

type EntradaSlotImagen = string | File;

/* Extrae de un FormData la lista ordenada de entradas de imágenes
   (URLs existentes como string, archivos nuevos como File). */
export function leerSlotsImagenesServicio(formData: FormData): EntradaSlotImagen[] {
  const resultado: EntradaSlotImagen[] = [];

  for (let i = 0; i < MAX_IMAGENES_SERVICIO; i++) {
    const tipo = formData.get(`slotTipo${i}`);

    if (tipo === "url") {
      const url = formData.get(`slot${i}`);

      if (typeof url === "string" && url.trim() !== "") {
        resultado.push(url.trim());
      }
      continue;
    }

    if (tipo === "archivo") {
      const archivo = formData.get(`slotArchivo${i}`);

      if (archivo instanceof File && archivo.size > 0) {
        resultado.push(archivo);
      }
    }
  }

  return resultado;
}
