import { calcularLuminanciaRelativa } from "./calcular-luminancia-relativa";

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
