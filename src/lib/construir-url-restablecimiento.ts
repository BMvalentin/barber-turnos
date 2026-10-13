/**
 * Construye la URL de restablecimiento de contraseña a partir del token.
 * Usa `NEXT_PUBLIC_APP_URL` para soportar desarrollo y producción.
 */
export function construirUrlRestablecimiento(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/restablecer-password?token=${encodeURIComponent(token)}`;
}
