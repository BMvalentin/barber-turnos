import { calcularRazonDeContraste } from "./calcular-razon-de-contraste";
import { mezclarColores } from "./mezclar-colores";

export function ajustarColorParaContraste(
  color: string,
  fondo: string,
  contrasteMinimo = 4.5
): string {
  if (calcularRazonDeContraste(color, fondo) >= contrasteMinimo) return color;

  for (let paso = 1; paso <= 20; paso += 1) {
    const proporcion = paso / 20;
    const oscuro = mezclarColores(color, "#000000", proporcion);
    const claro = mezclarColores(color, "#ffffff", proporcion);
    const oscuroCumple = calcularRazonDeContraste(oscuro, fondo) >= contrasteMinimo;
    const claroCumple = calcularRazonDeContraste(claro, fondo) >= contrasteMinimo;

    if (oscuroCumple && claroCumple) {
      return calcularRazonDeContraste(oscuro, fondo) >= calcularRazonDeContraste(claro, fondo)
        ? oscuro
        : claro;
    }
    if (oscuroCumple) return oscuro;
    if (claroCumple) return claro;
  }

  return calcularRazonDeContraste("#000000", fondo) >=
    calcularRazonDeContraste("#ffffff", fondo)
    ? "#000000"
    : "#ffffff";
}
