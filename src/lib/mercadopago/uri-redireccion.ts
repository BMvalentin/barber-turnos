import "dotenv/config";

/**
 * Construye la URI de redirección exacta que debe estar registrada
 * en el panel de Mercado Pago → Tu aplicación → Redirect URI
 */
export function obtenerUriRedireccion(): string {
  // Preferimos NEXT_PUBLIC_APP_URL si está definida (producción)
  let urlBase = process.env.NEXT_PUBLIC_APP_URL;

  if (!urlBase) {
    // En Vercel, VERCEL_URL está disponible en runtime (ej: "proyecto-git-rama.vercel.app")
    const vercelUrl = process.env.VERCEL_URL;
    if (!vercelUrl) {
      throw new Error(
        "Falta configurar NEXT_PUBLIC_APP_URL o VERCEL_URL. " +
        "Ejemplo: NEXT_PUBLIC_APP_URL=http://localhost:3000"
      );
    }
    // VERCEL_URL no incluye protocolo, lo agregamos
    urlBase = `https://${vercelUrl}`;
  }

  return `${urlBase}/api/mercadopago/oauth/callback`;
}
