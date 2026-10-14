/**
 * Construye la URL de activación de cuenta a partir del token.
 * Recibe la URL base ya resuelta por `obtenerUrlApp`.
 */
export function construirUrlVerificacion(token: string, baseUrl: string): string {
  return `${baseUrl}/api/verificar-email?token=${encodeURIComponent(token)}`;
}
