/* Limitador local de primera capa. En despliegues con múltiples instancias no
   reemplaza un rate limit compartido en el borde o Redis; evita abusos dentro
   de cada instancia sin conservar entradas indefinidamente. */
const VENTANA_BLOQUEO_MS = 15 * 60 * 1000; // 15 minutos
const MAXIMO_ENTRADAS = 10_000;

type RegistroIntentos = {
  cantidad: number;
  inicioVentana: number;
  bloqueadoHasta: number;
};

const intentos = new Map<string, RegistroIntentos>();

export const MENSAJE_BLOQUEO = "Demasiados intentos. Intentá de nuevo más tarde.";

function limpiarRegistrosVencidos(ahora: number): void {
  for (const [clave, registro] of intentos) {
    if (registro.bloqueadoHasta <= ahora && registro.inicioVentana + VENTANA_BLOQUEO_MS <= ahora) {
      intentos.delete(clave);
    }
  }

  while (intentos.size >= MAXIMO_ENTRADAS) {
    const claveMasAntigua = intentos.keys().next().value;
    if (!claveMasAntigua) break;
    intentos.delete(claveMasAntigua);
  }
}

export function crearLimitadorDeIntentos() {
  return {
    estaBloqueado(clave: string): boolean {
      const ahora = Date.now();
      limpiarRegistrosVencidos(ahora);
      const registro = intentos.get(clave);
      if (!registro) return false;
      if (ahora < registro.bloqueadoHasta) return true;
      if (registro.inicioVentana + VENTANA_BLOQUEO_MS <= ahora) intentos.delete(clave);
      return false;
    },
    registrarIntento(clave: string, maximo: number, duracionBloqueoMs = VENTANA_BLOQUEO_MS): void {
      const ahora = Date.now();
      limpiarRegistrosVencidos(ahora);
      const anterior = intentos.get(clave);
      const registro = !anterior || anterior.inicioVentana + VENTANA_BLOQUEO_MS <= ahora
        ? { cantidad: 0, inicioVentana: ahora, bloqueadoHasta: 0 }
        : anterior;

      registro.cantidad += 1;
      if (registro.cantidad >= maximo) {
        registro.bloqueadoHasta = ahora + duracionBloqueoMs;
      }
      intentos.set(clave, registro);
    },
    limpiarIntentos(clave: string): void {
      intentos.delete(clave);
    },
  };
}
