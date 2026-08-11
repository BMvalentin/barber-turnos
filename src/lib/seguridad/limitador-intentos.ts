/* Limitador de intentos de autenticación en memoria (primera capa; sin
   infraestructura nueva). Compartido entre login y registro: el Map es de
   nivel de módulo, por lo que todos los llamadores comparten el mismo estado. */
const VENTANA_BLOQUEO_MS = 15 * 60 * 1000; // 15 minutos
const intentos = new Map<string, { cantidad: number; bloqueadoHasta: number }>();

export const MENSAJE_BLOQUEO = "Demasiados intentos. Intentá de nuevo más tarde.";

export function crearLimitadorDeIntentos() {
  return {
    estaBloqueado(clave: string): boolean {
      const registro = intentos.get(clave);
      if (!registro) return false;
      if (Date.now() < registro.bloqueadoHasta) return true;
      intentos.delete(clave);
      return false;
    },
    registrarIntento(clave: string, maximo: number): void {
      const registro = intentos.get(clave) ?? { cantidad: 0, bloqueadoHasta: 0 };
      registro.cantidad += 1;
      if (registro.cantidad >= maximo) registro.cantidad = 0;
      registro.bloqueadoHasta = Date.now() + VENTANA_BLOQUEO_MS;
      intentos.set(clave, registro);
    },
    limpiarIntentos(clave: string): void {
      intentos.delete(clave);
    },
  };
}
