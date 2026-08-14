import { obtenerConfiguracionMP } from "./obtener-config";

/**
 * Indica si la configuración actual está bloqueada.
 * Si hay error de DB (ej: migración no ejecutada), devuelve false
 * para no bloquear el flujo de conexión inicial.
 */
export async function estaBloqueadaMP(): Promise<boolean> {
  try {
    const configuracion = await obtenerConfiguracionMP();
    return configuracion?.bloqueado ?? false;
  } catch (error) {
    console.error("Error al verificar bloqueo de MP:", error);
    // Si falla la consulta (tabla/columna no existe), no bloqueamos
    return false;
  }
}
