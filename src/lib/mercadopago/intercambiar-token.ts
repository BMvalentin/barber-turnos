import "dotenv/config";
import { URL_TOKEN_MP } from "./constantes";
import { validarConfiguracionOAuthMP } from "./validar-oauth";
import { obtenerUriRedireccion } from "./uri-redireccion";
import type { RespuestaTokenMP } from "./tipos";
import { z } from "zod";

const esquemaRespuestaToken = z.object({
  access_token: z.string().min(1),
  token_type: z.string().optional(),
  expires_in: z.number().int().positive().optional(),
  scope: z.string().optional(),
  user_id: z.number().int().optional(),
  refresh_token: z.string().optional(),
  public_key: z.string().optional(),
  live_mode: z.boolean().optional(),
});

/**
 * Intercambia el código de autorización que devuelve Mercado Pago
 * por los tokens reales de la cuenta que se está conectando.
 */
export async function intercambiarCodigoPorToken(codigo: string, codeVerifier: string): Promise<RespuestaTokenMP> {
  validarConfiguracionOAuthMP();

  const cuerpo = {
    client_id: process.env.MP_CLIENT_ID!,
    client_secret: process.env.MP_CLIENT_SECRET!,
    grant_type: "authorization_code",
    code: codigo,
    redirect_uri: obtenerUriRedireccion(),
    code_verifier: codeVerifier,   // <--- agregado
  };

  const respuesta = await fetch(URL_TOKEN_MP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });

  const datos: unknown = await respuesta.json();

  if (!respuesta.ok) {
    console.error("Error al intercambiar el código de autorización MP. Status:", respuesta.status);
    throw new Error(`Error ${respuesta.status} al conectar con Mercado Pago`);
  }
  const validacion = esquemaRespuestaToken.safeParse(datos);
  if (!validacion.success) throw new Error("Respuesta inválida al conectar con Mercado Pago");
  return validacion.data;
}
