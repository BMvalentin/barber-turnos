import { calcularRazonDeContraste } from "./calcular-razon-de-contraste";
import { COLOR_TEXTO_OSCURO, COLOR_TEXTO_CLARO } from "./constantes";

/**
 * Devuelve `COLOR_TEXTO_OSCURO` o `COLOR_TEXTO_CLARO` según el fondo:
 * gana el de mayor contraste; idealmente cumple `UMBRAL_CONTRASTE_MINIMO`.
 */
export function elegirColorTexto(colorDeFondo: string): string {
  const contrasteOscuro = calcularRazonDeContraste(colorDeFondo, COLOR_TEXTO_OSCURO);
  const contrasteClaro = calcularRazonDeContraste(colorDeFondo, COLOR_TEXTO_CLARO);

  return contrasteOscuro >= contrasteClaro ? COLOR_TEXTO_OSCURO : COLOR_TEXTO_CLARO;
}
