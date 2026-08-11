import { prisma } from "@/lib/prisma";
import { ID_CONFIGURACION_MP } from "./constantes";
import type { RespuestaTokenMP, OpcionesGuardarMP } from "./tipos";

/**
 * Guarda o actualiza en la base de datos la configuración de la cuenta conectada.
 * Función de bajo nivel: no valida el bloqueo, eso lo decide quien la llama.
 */
export async function guardarConfiguracionMP(
  datos: RespuestaTokenMP,
  opciones: OpcionesGuardarMP = {},
) {
  const { bloquearDespuesDeGuardar = true } = opciones;

  const fechaExpiracion = datos.expires_in
    ? new Date(Date.now() + datos.expires_in * 1000)
    : null;
  console.log("Guardando configuración de MP en DB...");
  console.log("   Datos a guardar:", {
    accessToken: datos.access_token ? "presente" : "ausente",
    refreshToken: datos.refresh_token ? "presente" : "ausente",
    publicKey: datos.public_key ? "presente" : "ausente",
    mpUserId: datos.user_id ? String(datos.user_id) : null,
    liveMode: datos.live_mode,
    expiraEn: fechaExpiracion,
    bloqueado: bloquearDespuesDeGuardar,
  });

  await prisma.configuracion_mercadopago.upsert({
    where: { id: ID_CONFIGURACION_MP },
    create: {
      id: ID_CONFIGURACION_MP,
      accessToken: datos.access_token,
      refreshToken: datos.refresh_token ?? null,
      publicKey: datos.public_key ?? null,
      mpUserId: datos.user_id ? String(datos.user_id) : null,
      scope: datos.scope ?? null,
      liveMode: datos.live_mode ?? true,
      expiraEn: fechaExpiracion,
      conectado: true,
      bloqueado: bloquearDespuesDeGuardar,
      updatedAt: new Date(),
    },
    update: {
      accessToken: datos.access_token,
      refreshToken: datos.refresh_token ?? null,
      publicKey: datos.public_key ?? null,
      mpUserId: datos.user_id ? String(datos.user_id) : null,
      scope: datos.scope ?? null,
      liveMode: datos.live_mode ?? true,
      expiraEn: fechaExpiracion,
      conectado: true,
      bloqueado: bloquearDespuesDeGuardar,
    },
  });
}
