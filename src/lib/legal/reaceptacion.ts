import { DOCUMENTOS_CON_ACEPTACION, DOCUMENTOS_LEGALES } from "@/lib/legal/documentos";
import type { ClaveDocumentoLegal } from "@/lib/legal/tipos";

/* Estrategia de re-aceptación INERTE para usuarios existentes.

   No se invoca desde la interfaz, no bloquea el acceso y no se evalúa
   automáticamente. Identifica qué documentos obligatorios tienen una versión
   distinta de la vigente (o sin aceptación registrada) para un usuario, a fin
   de poder solicitar una aceptación actualizada cuando se decida activarlo.

   La activación requiere una regla explícita y aprobación (ver
   docs/consentimiento-legal.md). Por defecto permanece desactivada. */
export const REACEPTACION_ACTIVA = false;

export type AceptacionRegistrada = {
  documento: ClaveDocumentoLegal;
  version: string;
};

/* Devuelve los documentos obligatorios cuya versión aceptada no coincide con la
   vigente, o que no tienen aceptación registrada. */
export function documentosConVersionVencida(
  aceptaciones: readonly AceptacionRegistrada[],
): ClaveDocumentoLegal[] {
  return DOCUMENTOS_CON_ACEPTACION.filter((documento) => {
    const aceptada = aceptaciones.find((entrada) => entrada.documento === documento);
    return !aceptada || aceptada.version !== DOCUMENTOS_LEGALES[documento].version;
  });
}

/* Indica si el usuario debería aceptar algún documento. Inerte mientras
   REACEPTACION_ACTIVA sea false. */
export function requiereReaceptacion(
  aceptaciones: readonly AceptacionRegistrada[],
): boolean {
  if (!REACEPTACION_ACTIVA) return false;
  return documentosConVersionVencida(aceptaciones).length > 0;
}
