"use server";

import { obtenerConfiguracionPush } from "@/lib/notificaciones/configuracion-push";
import { endpointPush, obtenerHashEndpoint, suscripcionPush } from "@/lib/notificaciones/suscripcion-push";
import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { Prisma } from "../../../generated/prisma/client";

type ResultadoSuscripcion = { success: true; activa: boolean } | { success: false; error: string };

export async function consultarSuscripcionPush(endpoint: unknown): Promise<ResultadoSuscripcion> {
  const sesion = await requerirSesion();
  if (!sesion) return { success: false, error: "Iniciá sesión para consultar tus notificaciones." };
  const configuracion = obtenerConfiguracionPush();
  if (!configuracion) return { success: true, activa: false };
  const resultado = endpointPush.safeParse(endpoint);
  if (!resultado.success) return { success: false, error: "El dispositivo no tiene una suscripción compatible." };

  try {
    const registro = await prisma.suscripcion_push.findUnique({
      where: {
        endpointHash: obtenerHashEndpoint(resultado.data),
        userId: sesion.user.id,
        claveVapid: configuracion.publicKey,
      },
      select: { id: true },
    });
    return { success: true, activa: Boolean(registro) };
  } catch {
    return { success: false, error: "No se pudo consultar el estado de las notificaciones." };
  }
}

export async function guardarSuscripcionPush(suscripcion: unknown): Promise<ResultadoSuscripcion> {
  const sesion = await requerirSesion();
  if (!sesion) return { success: false, error: "Iniciá sesión para activar las notificaciones." };
  const configuracion = obtenerConfiguracionPush();
  if (!configuracion) return { success: false, error: "Las notificaciones todavía no están disponibles." };
  const resultado = suscripcionPush.safeParse(suscripcion);
  if (!resultado.success) return { success: false, error: "El dispositivo no tiene una suscripción compatible." };

  const { endpoint, keys } = resultado.data;
  const where = { endpointHash: obtenerHashEndpoint(endpoint) };
  const datos = {
    endpoint,
    clavePublica: keys.p256dh,
    auth: keys.auth,
    claveVapid: configuracion.publicKey,
    user: { connect: { id: sesion.user.id } },
  };

  try {
    try {
      await prisma.suscripcion_push.upsert({ where, create: { ...where, ...datos }, update: datos, select: { id: true } });
    } catch (error) {
      // En MySQL dos altas concurrentes pueden competir por el índice único.
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
      await prisma.suscripcion_push.update({ where, data: datos, select: { id: true } });
    }
    return { success: true, activa: true };
  } catch {
    return { success: false, error: "No se pudieron activar las notificaciones. Intentá de nuevo." };
  }
}

export async function eliminarSuscripcionPush(endpoint: unknown): Promise<ResultadoSuscripcion> {
  const sesion = await requerirSesion();
  if (!sesion) return { success: false, error: "Iniciá sesión para desactivar las notificaciones." };
  const resultado = endpointPush.safeParse(endpoint);
  if (!resultado.success) return { success: false, error: "El dispositivo no tiene una suscripción compatible." };

  try {
    await prisma.suscripcion_push.deleteMany({
      where: { endpointHash: obtenerHashEndpoint(resultado.data), userId: sesion.user.id },
    });
    return { success: true, activa: false };
  } catch {
    return { success: false, error: "No se pudieron desactivar las notificaciones. Intentá de nuevo." };
  }
}
