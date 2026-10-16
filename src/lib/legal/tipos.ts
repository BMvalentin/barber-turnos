/* Tipos del dominio legal. El contenido vive en archivos versionados por Git;
   la base de datos solo guarda qué versión aceptó cada usuario. */

export const CLAVES_DOCUMENTO_LEGAL = [
  "terminos",
  "privacidad",
  "cookies",
  "pagos",
] as const;

export type ClaveDocumentoLegal = (typeof CLAVES_DOCUMENTO_LEGAL)[number];

export type SeccionLegal = {
  titulo: string;
  parrafos: string[];
};

/* Datos del responsable del sitio mostrados en las páginas legales. Se
   completan desde la configuración real; los faltantes quedan sin valor para
   que la vista los marque como PENDIENTE DE DEFINICIÓN. */
export type ResponsableLegal = {
  nombre: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  ciudad: string | null;
  provincia: string | null;
  pais: string | null;
};

export type DocumentoLegal = {
  clave: ClaveDocumentoLegal;
  /* Slug estable usado en la URL /legal/<slug>. No cambiarlo sin actualizar
     enlaces: forma parte de la trazabilidad de las aceptaciones. */
  slug: string;
  titulo: string;
  descripcion: string;
  /* Versión del documento que se persiste junto a cada aceptación. */
  version: string;
  /* Fecha de entrada en vigencia (ISO, YYYY-MM-DD). */
  vigenteDesde: string;
  /* Si es true, su aceptación se exige al crear una cuenta. */
  requiereAceptacion: boolean;
  /* Aspectos que no pueden definirse desde el código y requieren decisión del
     titular o revisión profesional. No son afirmaciones contractuales. */
  pendientes: string[];
  secciones: SeccionLegal[];
};
