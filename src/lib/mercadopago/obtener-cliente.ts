import MercadoPagoConfig from "mercadopago";
import { obtenerConfiguracionMP } from "./obtener-config";

/**
 * Devuelve un cliente de Mercado Pago listo para usar.
 * Prioriza el token guardado en DB; si no hay, usa el del .env como respaldo.
 */
export async function obtenerClienteMP(): Promise<MercadoPagoConfig> {
  const configuracion = await obtenerConfiguracionMP();
  const tokenAcceso =
    configuracion?.accessToken || "";

  if (!tokenAcceso) {
    throw new Error(
      "No hay ninguna cuenta de Mercado Pago conectada ni token configurado en el .env",
    );
  }

  return new MercadoPagoConfig({
    accessToken: tokenAcceso,
    options: { timeout: 5000 },
  });
}
