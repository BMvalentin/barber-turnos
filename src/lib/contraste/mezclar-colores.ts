export function mezclarColores(color: string, destino: string, proporcion: number): string {
  const proporcionSegura = Math.min(1, Math.max(0, proporcion));
  let resultado = "#";

  for (let indice = 1; indice < color.length; indice += 2) {
    const origen = Number.parseInt(color.slice(indice, indice + 2), 16);
    const final = Number.parseInt(destino.slice(indice, indice + 2), 16);
    const canal = Math.round(origen + (final - origen) * proporcionSegura);
    resultado += canal.toString(16).padStart(2, "0");
  }

  return resultado;
}
