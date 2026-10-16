import { cookies } from "next/headers";
import { construirAceptacionesVigentes } from "@/lib/legal/consentimiento";
import {
  COOKIE_INTENCION_CONSENTIMIENTO,
  TTL_INTENCION_CONSENTIMIENTO_MS,
  firmarIntencion,
  verificarIntencion,
  type IntencionConsentimiento,
} from "@/lib/legal/intencion-consentimiento";

/* Emite la intención de consentimiento para el flujo de Google. Debe llamarse
   solo dentro de un contexto de request (Server Action o Route Handler). */
export async function emitirIntencionConsentimiento(): Promise<void> {
  const tienda = await cookies();
  tienda.set(
    COOKIE_INTENCION_CONSENTIMIENTO,
    firmarIntencion(construirAceptacionesVigentes()),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.floor(TTL_INTENCION_CONSENTIMIENTO_MS / 1000),
    },
  );
}

export async function leerIntencionConsentimiento(): Promise<IntencionConsentimiento | null> {
  const tienda = await cookies();
  return verificarIntencion(tienda.get(COOKIE_INTENCION_CONSENTIMIENTO)?.value);
}

export async function limpiarIntencionConsentimiento(): Promise<void> {
  const tienda = await cookies();
  try {
    tienda.delete(COOKIE_INTENCION_CONSENTIMIENTO);
  } catch {
    /* Best effort: si no se puede borrar, la cookie expira por su TTL corto. */
  }
}
