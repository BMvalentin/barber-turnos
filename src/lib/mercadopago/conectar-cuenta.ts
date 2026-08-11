import { estaBloqueadaMP } from "./esta-bloqueada";
import { intercambiarCodigoPorToken } from "./intercambiar-token";
import { guardarConfiguracionMP } from "./guardar-config";

/**
 * Flujo de alto nivel para conectar/reconectar una cuenta.
 * Valida el bloqueo antes de guardar nada.
 */
export async function conectarCuentaMP(codigo: string, codeVerifier: string) {
  const bloqueada = await estaBloqueadaMP();
  if (bloqueada) {
    throw new Error(
      "La configuración de Mercado Pago está bloqueada. " +
      "Pedile al equipo de desarrollo que cambie 'bloqueado' a false en la base de datos.",
    );
  }

  const tokens = await intercambiarCodigoPorToken(codigo, codeVerifier);
  await guardarConfiguracionMP(tokens, { bloquearDespuesDeGuardar: true });
  return tokens;
}
