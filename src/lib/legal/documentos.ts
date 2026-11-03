import {
  CLAVES_DOCUMENTO_LEGAL,
  type ClaveDocumentoLegal,
  type DocumentoLegal,
} from "@/lib/legal/tipos";
import { DOCUMENTO_TERMINOS } from "@/lib/legal/contenido-terminos";
import { DOCUMENTO_PRIVACIDAD } from "@/lib/legal/contenido-privacidad";
import { DOCUMENTO_COOKIES } from "@/lib/legal/contenido-cookies";
import { DOCUMENTO_PAGOS } from "@/lib/legal/contenido-pagos";

/* Registro único de documentos legales. El orden del índice sigue el orden de
   `CLAVES_DOCUMENTO_LEGAL`. */
export const DOCUMENTOS_LEGALES: Record<ClaveDocumentoLegal, DocumentoLegal> = {
  terminos: DOCUMENTO_TERMINOS,
  privacidad: DOCUMENTO_PRIVACIDAD,
  cookies: DOCUMENTO_COOKIES,
  pagos: DOCUMENTO_PAGOS,
};

/* Documentos cuya aceptación expresa se exige al crear una cuenta. */
export const DOCUMENTOS_CON_ACEPTACION: readonly ClaveDocumentoLegal[] =
  CLAVES_DOCUMENTO_LEGAL.filter((clave) => DOCUMENTOS_LEGALES[clave].requiereAceptacion);

/* Versiones vigentes que deben figurar en una aceptación para considerarla
   válida. Se usa como fuente única en el registro y en la validación servidor. */
export function obtenerVersionesVigentes(): Record<ClaveDocumentoLegal, string> {
  return CLAVES_DOCUMENTO_LEGAL.reduce(
    (acumulado, clave) => {
      acumulado[clave] = DOCUMENTOS_LEGALES[clave].version;
      return acumulado;
    },
    {} as Record<ClaveDocumentoLegal, string>,
  );
}

/* Versiones vigentes solo de los documentos de aceptación obligatoria. */
export function obtenerVersionesVigentesObligatorias(): Record<
  (typeof DOCUMENTOS_CON_ACEPTACION)[number],
  string
> {
  return DOCUMENTOS_CON_ACEPTACION.reduce(
    (acumulado, clave) => {
      acumulado[clave] = DOCUMENTOS_LEGALES[clave].version;
      return acumulado;
    },
    {} as Record<(typeof DOCUMENTOS_CON_ACEPTACION)[number], string>,
  );
}

export function listarDocumentosLegales(): DocumentoLegal[] {
  return CLAVES_DOCUMENTO_LEGAL.map((clave) => DOCUMENTOS_LEGALES[clave]);
}

export function obtenerDocumentoLegal(clave: ClaveDocumentoLegal): DocumentoLegal {
  return DOCUMENTOS_LEGALES[clave];
}

export function obtenerDocumentoLegalPorSlug(slug: string): DocumentoLegal | undefined {
  return listarDocumentosLegales().find((documento) => documento.slug === slug);
}
