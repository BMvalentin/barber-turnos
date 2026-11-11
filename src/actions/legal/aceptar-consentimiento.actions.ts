"use server";

import { aceptacionLegalSchema } from "@/lib/zod";
import { emitirIntencionConsentimiento } from "@/lib/legal/intencion-cookies";

type ResultadoAceptacion =
  | { success: true }
  | { success: false; error: string };

export async function aceptarConsentimientoInicial(
  formData: FormData,
): Promise<ResultadoAceptacion> {
  const resultado = aceptacionLegalSchema.safeParse({
    aceptaTerminos: formData.get("aceptaTerminos"),
  });

  if (!resultado.success) {
    return {
      success: false,
      error: "Aceptá los Términos y Condiciones y la Política de Privacidad para continuar.",
    };
  }

  try {
    await emitirIntencionConsentimiento();
    return { success: true };
  } catch {
    return {
      success: false,
      error: "No se pudo guardar la aceptación. Intentá de nuevo.",
    };
  }
}
