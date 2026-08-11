import "dotenv/config";
import { URL_TOKEN_MP } from "./constantes";
import { obtenerConfiguracionMP } from "./obtener-config";
import { validarConfiguracionOAuthMP } from "./validar-oauth";
import { guardarConfiguracionMP } from "./guardar-config";
import type { RespuestaTokenMP } from "./tipos";

/**
 * Renueva el access_token usando el refresh_token guardado.
 * El bloqueo NO se modifica: es la misma cuenta, no un cambio de credenciales.
 */
export async function refrescarTokenMP(): Promise<RespuestaTokenMP> {
  const configuracion = await obtenerConfiguracionMP();

  if (!configuracion?.refreshToken) {
    throw new Error("No hay refresh_token guardado para renovar la conexión");
  }

  validarConfiguracionOAuthMP();

  const respuesta = await fetch(URL_TOKEN_MP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.MP_CLIENT_ID!,
      client_secret: process.env.MP_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: configuracion.refreshToken,
    }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    console.error("Error al refrescar el token de MP. Status:", respuesta.status);
    throw new Error("No se pudo renovar la conexión con Mercado Pago");
  }

  // Preserva el estado de bloqueo actual al refrescar
  await guardarConfiguracionMP(datos, {
    bloquearDespuesDeGuardar: configuracion.bloqueado,
  });

  return datos as RespuestaTokenMP;
}
