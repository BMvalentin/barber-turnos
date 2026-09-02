import { intercambiarCodigoPorToken } from "./intercambiar-token";
import { guardarConfiguracionMP } from "./guardar-config";

/**
 * Flujo de alto nivel para conectar o reemplazar la cuenta vinculada.
 */
export async function conectarCuentaMP(codigo: string, codeVerifier: string) {
  const tokens = await intercambiarCodigoPorToken(codigo, codeVerifier);
  await guardarConfiguracionMP(tokens, { bloquearDespuesDeGuardar: false });
  return tokens;
}
