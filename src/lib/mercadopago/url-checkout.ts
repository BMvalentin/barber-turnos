/* Único punto para resolver la URL del checkout de Mercado Pago.
   Con credenciales de prueba (token `TEST-...`) MP devuelve `sandbox_init_point`;
   con credenciales de producción devuelve `init_point`. */

interface PreferenciaConUrls {
  init_point?: string;
  sandbox_init_point?: string;
}

export type ResultadoUrlCheckout = {
  url: string;
  esSandbox: boolean;
};

/** Devuelve la URL correcta del checkout según el token de acceso. */
export function obtenerUrlCheckout(
  preferencia: PreferenciaConUrls,
  tokenAcceso: string,
): ResultadoUrlCheckout {
  const esSandbox = tokenAcceso.startsWith("TEST-");
  if (esSandbox) {
    const url = preferencia.sandbox_init_point ?? preferencia.init_point;
    return { url: url ?? "", esSandbox: true };
  }
  const url = preferencia.init_point ?? preferencia.sandbox_init_point;
  return { url: url ?? "", esSandbox: false };
}
