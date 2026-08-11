import "dotenv/config";
import { validarConfiguracionOAuthMP } from "./validar-oauth";
import { obtenerUriRedireccion } from "./uri-redireccion";

// URL base de autenticación para Argentina
const URL_BASE_AUTORIZACION =
  process.env.MP_AUTH_BASE_URL || "https://auth.mercadopago.com.ar";

/**
 * Construye la URL a la que se redirige al admin para autorizar la app
 * en su cuenta de Mercado Pago.
 */
export function construirUrlAutorizacionMP(estado: string, codeChallenge: string): string {
  validarConfiguracionOAuthMP();

  const parametros = new URLSearchParams({
    client_id: process.env.MP_CLIENT_ID!,
    response_type: "code",
    redirect_uri: obtenerUriRedireccion(),
    state: estado,
    scope: "read write offline_access",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `${URL_BASE_AUTORIZACION}/authorization?${parametros.toString()}`;
}
