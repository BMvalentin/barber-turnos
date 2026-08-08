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

/** Regex de color hex en formato `#rrggbb`. */
const HEX_VALIDO = /^#[0-9a-fA-F]{6}$/;

/** Paso de proporción de blanco usado para aclarar la tinta. */
const PASO_MEZCLA_BLANCO = 0.05;

/**
 * Devuelve true si `color` es un hex válido de 6 dígitos (`#rrggbb`).
 */
export function esColorHexValido(color: string): boolean {
  return HEX_VALIDO.test(color);
}

/**
 * Luminancia relativa WCAG 1.4.3 de un color hex (precondición: color ya validado).
 */
export function calcularLuminanciaRelativa(color: string): number {
  const canales = [
    parseInt(color.slice(1, 3), 16) / 255,
    parseInt(color.slice(3, 5), 16) / 255,
    parseInt(color.slice(5, 7), 16) / 255,
  ];

  const lineales = canales.map((canal) =>
    canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4
  );

  return (
    0.2126 * lineales[0] + 0.7152 * lineales[1] + 0.0722 * lineales[2]
  );
}

/**
 * Razón de contraste WCAG entre dos colores: `(Lmayor + 0.05) / (Lmenor + 0.05)`.
 */
export function calcularRazonDeContraste(primero: string, segundo: string): number {
  const luminanciaPrimero = calcularLuminanciaRelativa(primero);
  const luminanciaSegundo = calcularLuminanciaRelativa(segundo);

  const mayor = Math.max(luminanciaPrimero, luminanciaSegundo);
  const menor = Math.min(luminanciaPrimero, luminanciaSegundo);

  return (mayor + 0.05) / (menor + 0.05);
}

/**
 * Devuelve `COLOR_TEXTO_OSCURO` o `COLOR_TEXTO_CLARO` según el fondo:
 * gana el de mayor contraste; idealmente cumple `UMBRAL_CONTRASTE_MINIMO`.
 */
export function elegirColorTexto(colorDeFondo: string): string {
  const contrasteOscuro = calcularRazonDeContraste(colorDeFondo, COLOR_TEXTO_OSCURO);
  const contrasteClaro = calcularRazonDeContraste(colorDeFondo, COLOR_TEXTO_CLARO);

  return contrasteOscuro >= contrasteClaro ? COLOR_TEXTO_OSCURO : COLOR_TEXTO_CLARO;
}

/**
 * Mezcla lineal de `color` con blanco en `proporcionDeBlanco` (0..1),
 * devolviendo el resultado como `#rrggbb` en minúsculas.
 */
export function mezclarConBlanco(color: string, proporcionDeBlanco: number): string {
  let resultado = "#";

  for (let indice = 1; indice < color.length; indice += 2) {
    const canal = parseInt(color.slice(indice, indice + 2), 16);
    const mezclado = Math.round(canal + (255 - canal) * proporcionDeBlanco);
    resultado += mezclado.toString(16).padStart(2, "0");
  }

  return resultado;
}

/**
 * Devuelve la marca legible: si su luminancia supera `UMBRAL_TINTA` la deja
 * intacta; si no, la aclara con blanco por pasos del 5% hasta alcanzar
 * `LUMINANCIA_OBJETIVO_TINTA` (o proporcion = 1, nunca la excede).
 */
export function obtenerTintaLejible(color: string): string {
  if (calcularLuminanciaRelativa(color) >= UMBRAL_TINTA) {
    return color;
  }

  let proporcion = PASO_MEZCLA_BLANCO;
  let tinta = color;

  while (proporcion <= 1) {
    tinta = mezclarConBlanco(color, proporcion);

    if (calcularLuminanciaRelativa(tinta) >= LUMINANCIA_OBJETIVO_TINTA) {
      break;
    }

    proporcion += PASO_MEZCLA_BLANCO;
  }

  return tinta;
}