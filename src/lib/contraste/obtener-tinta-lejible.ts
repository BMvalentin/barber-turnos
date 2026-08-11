import { calcularLuminanciaRelativa } from "./calcular-luminancia-relativa";
import { mezclarConBlanco } from "./mezclar-con-blanco";
import { UMBRAL_TINTA, LUMINANCIA_OBJETIVO_TINTA } from "./constantes";

/** Paso de proporción de blanco usado para aclarar la tinta. */
const PASO_MEZCLA_BLANCO = 0.05;

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
