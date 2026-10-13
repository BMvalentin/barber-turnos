/* Prefijo del identificador de los tokens de restablecimiento de contraseña.
   Permite reutilizar la tabla `verificacion_usuario` sin que estos tokens
   interfieran con los de verificación de email, que usan el correo como
   identificador. */
export const PREFIJO_TOKEN_RESTABLECIMIENTO = "restablecer-password:";

export function identificadorTokenRestablecimiento(email: string): string {
  return `${PREFIJO_TOKEN_RESTABLECIMIENTO}${email}`;
}

export function esIdentificadorDeRestablecimiento(identifier: string): boolean {
  return identifier.startsWith(PREFIJO_TOKEN_RESTABLECIMIENTO);
}
