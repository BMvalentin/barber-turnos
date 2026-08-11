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
