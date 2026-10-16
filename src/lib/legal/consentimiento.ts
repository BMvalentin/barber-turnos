import { DOCUMENTOS_CON_ACEPTACION, DOCUMENTOS_LEGALES } from "@/lib/legal/documentos";
import type { ClaveDocumentoLegal } from "@/lib/legal/tipos";

export type ClaveDocumentoAceptacion = (typeof DOCUMENTOS_CON_ACEPTACION)[number];

export type VersionAceptada = {
  documento: ClaveDocumentoLegal;
  version: string;
};

export type ResultadoVersiones =
  | { valido: true }
  | { valido: false; faltantes: ClaveDocumentoLegal[]; desactualizados: ClaveDocumentoLegal[] };

/* Construye la lista de aceptaciones obligatorias con las versiones vigentes.
   Es la fuente que usa el servidor al registrar credenciales: el cliente nunca
   define la versión aceptada. */
export function construirAceptacionesVigentes(): VersionAceptada[] {
  return DOCUMENTOS_CON_ACEPTACION.map((documento) => ({
    documento,
    version: DOCUMENTOS_LEGALES[documento].version,
  }));
}

/* Verifica que una lista de aceptaciones cubra todos los documentos
   obligatorios con su versión vigente. Se usa para validar la intención de
   aceptación de Google OAuth, que sí viaja firmada desde el navegador. */
export function validarVersionesObligatorias(
  aceptadas: readonly VersionAceptada[],
): ResultadoVersiones {
  const faltantes: ClaveDocumentoLegal[] = [];
  const desactualizados: ClaveDocumentoLegal[] = [];

  for (const documento of DOCUMENTOS_CON_ACEPTACION) {
    const aceptada = aceptadas.find((entrada) => entrada.documento === documento);
    if (!aceptada) {
      faltantes.push(documento);
      continue;
    }
    if (aceptada.version !== DOCUMENTOS_LEGALES[documento].version) {
      desactualizados.push(documento);
    }
  }

  if (faltantes.length === 0 && desactualizados.length === 0) return { valido: true };
  return { valido: false, faltantes, desactualizados };
}

/* Indica si una versión concreta es la vigente para un documento. */
export function esVersionVigente(documento: ClaveDocumentoLegal, version: string): boolean {
  return DOCUMENTOS_LEGALES[documento].version === version;
}
