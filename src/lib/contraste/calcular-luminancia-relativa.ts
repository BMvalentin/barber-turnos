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
