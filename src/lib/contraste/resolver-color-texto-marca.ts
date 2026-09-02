import { ajustarColorParaContraste } from "./ajustar-color-para-contraste";
import { calcularRazonDeContraste } from "./calcular-razon-de-contraste";

const CONTRASTE_MINIMO_IDENTIDAD = 3;

export function resolverColorTextoMarca(
  marca: string,
  fondo: string,
  textoNeutro: string
): string {
  const contrasteMarca = calcularRazonDeContraste(marca, fondo);

  if (contrasteMarca >= 4.5) return marca;
  if (contrasteMarca < CONTRASTE_MINIMO_IDENTIDAD) return textoNeutro;

  return ajustarColorParaContraste(marca, fondo);
}
