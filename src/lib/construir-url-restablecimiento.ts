/**
 * Construye la URL de restablecimiento de contraseña a partir del token.
 * Recibe la URL base ya resuelta por `obtenerUrlApp`.
 */
export function construirUrlRestablecimiento(token: string, baseUrl: string): string {
  return `${baseUrl}/restablecer-password?token=${encodeURIComponent(token)}`;
}
