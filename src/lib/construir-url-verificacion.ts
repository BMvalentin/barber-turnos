/**
 * Construye la URL de activación de cuenta a partir del token.
 * Usa `NEXT_PUBLIC_APP_URL` para soportar desarrollo y producción.
 */
export function construirUrlVerificacion(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/api/verificar-email?token=${encodeURIComponent(token)}`;
}
