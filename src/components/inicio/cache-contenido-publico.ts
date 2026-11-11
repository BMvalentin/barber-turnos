type EntradaCache<T> = {
  expiraEn: number;
  datos: T;
};

export function leerCachePublica<T>(
  clave: string,
  validar: (valor: unknown) => valor is T,
): T | null {
  try {
    const guardado = localStorage.getItem(clave);
    if (!guardado) return null;

    const entrada: unknown = JSON.parse(guardado);
    if (
      !entrada ||
      typeof entrada !== "object" ||
      !("expiraEn" in entrada) ||
      typeof entrada.expiraEn !== "number" ||
      !Number.isFinite(entrada.expiraEn) ||
      entrada.expiraEn <= Date.now() ||
      !("datos" in entrada) ||
      !validar(entrada.datos)
    ) {
      localStorage.removeItem(clave);
      return null;
    }

    return entrada.datos;
  } catch {
    try {
      localStorage.removeItem(clave);
    } catch {
      // El almacenamiento puede estar bloqueado por el navegador.
    }
    return null;
  }
}

export function guardarCachePublica<T>(clave: string, datos: T, duracionMs: number): void {
  const entrada: EntradaCache<T> = { expiraEn: Date.now() + duracionMs, datos };
  try {
    localStorage.setItem(clave, JSON.stringify(entrada));
  } catch {
    // El almacenamiento puede estar deshabilitado; la vista sigue funcionando.
  }
}
