import type { DocumentoLegal } from "@/lib/legal/tipos";

/* Borrador redactado a partir del funcionamiento real de la aplicación.
   NO está validado jurídicamente: requiere revisión profesional. */

export const DOCUMENTO_COOKIES: DocumentoLegal = {
  clave: "cookies",
  slug: "cookies",
  titulo: "Política de Cookies",
  descripcion:
    "Qué cookies utiliza el sitio, con qué finalidad y cómo gestionarlas desde el navegador.",
  version: "1.0.0",
  vigenteDesde: "2026-10-16",
  requiereAceptacion: false,
  pendientes: [
    "Incorporación de cookies no esenciales (analítica, publicidad u otras) en el futuro: PENDIENTE DE DEFINICIÓN. Si se agregaran, esta Política y el mecanismo de consentimiento deberían actualizarse.",
  ],
  secciones: [
    {
      titulo: "1. Qué son las cookies",
      parrafos: [
        "Las cookies son pequeños archivos que el navegador almacena al visitar un sitio y que permiten recordar información entre solicitudes.",
      ],
    },
    {
      titulo: "2. Cookies que utiliza este sitio",
      parrafos: [
        "Actualmente el sitio utiliza únicamente cookies esenciales para su funcionamiento, asociadas al sistema de autenticación: mantienen la sesión iniciada y protegen los formularios frente a usos indebidos.",
        "Estas cookies son necesarias para que el inicio de sesión y las áreas protegidas funcionen; sin ellas, el Servicio no puede operar correctamente.",
        "Al día de esta versión, el sitio no utiliza cookies de publicidad ni de analítica de terceros.",
      ],
    },
    {
      titulo: "3. Cómo gestionar las cookies",
      parrafos: [
        "Podés eliminar o bloquear las cookies desde la configuración de tu navegador. Si bloqueás las cookies esenciales, es posible que no puedas iniciar sesión ni usar las funciones que requieren una cuenta.",
      ],
    },
    {
      titulo: "4. Cambios a esta Política",
      parrafos: [
        "Si en el futuro se incorporan cookies no esenciales, se actualizará esta Política y, cuando corresponda, se solicitará el consentimiento aplicable. Cada versión se identifica con un número y una fecha de vigencia.",
      ],
    },
  ],
};
