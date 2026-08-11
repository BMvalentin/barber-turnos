/**
 * Contraste de texto según color de marca (WCAG 1.4.3).
 * Fuente única de la lógica de contraste del proyecto. Consumido por
 * `layout.tsx` (`elegirColorTexto`, `obtenerTintaLejible`) y por
 * `GeneralConfigForm.tsx`. La fuente real de defaults CSS es `:root` en globals.css.
 */

/** Texto oscuro para fondos claros: `#09090b` (zinc-950). */
export const COLOR_TEXTO_OSCURO = "#09090b";

/** Texto claro para fondos oscuros: `#ffffff`. */
export const COLOR_TEXTO_CLARO = "#ffffff";

/** Umbral WCAG AA para texto normal (4.5:1). */
export const UMBRAL_CONTRASTE_MINIMO = 4.5;

/** Luminancia mínima a partir de la cual la marca es lejible sin aclarar. */
export const UMBRAL_TINTA = 0.18;

/** Luminancia objetivo al aclarar la marca con blanco. */
export const LUMINANCIA_OBJETIVO_TINTA = 0.4;
