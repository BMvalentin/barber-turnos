import { COLORES_TEMA_POR_DEFECTO } from "./colores-tema-por-defecto";
import { esColorHexValido } from "./es-color-hex-valido";
import type { ColoresTemaNormalizados, EntradasTema } from "./tipos-tema";

export function normalizarColoresTema(entradas: EntradasTema): ColoresTemaNormalizados {
  const normalizar = (color: string | null | undefined, reemplazo: string) =>
    color && esColorHexValido(color.trim()) ? color.trim().toLowerCase() : reemplazo;

  return {
    primario: normalizar(entradas.primario, COLORES_TEMA_POR_DEFECTO.primario),
    secundario: normalizar(entradas.secundario, COLORES_TEMA_POR_DEFECTO.secundario),
    fondo: normalizar(entradas.fondo, COLORES_TEMA_POR_DEFECTO.fondo),
  };
}
