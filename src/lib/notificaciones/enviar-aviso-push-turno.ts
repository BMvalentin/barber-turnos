import { createHash } from "node:crypto";
import { sendNotification, WebPushError } from "web-push";
import { ESTADOS_TURNO_ACTIVOS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";
import { obtenerConfiguracionPush } from "./configuracion-push";
import { endpointPush } from "./suscripcion-push";

const mensajes = {
  CONFIRMADO: { titulo: "Turno confirmado", cuerpo: "Encontrá los detalles en Mis turnos." },
  ACTUALIZADO: { titulo: "Tu turno cambió", cuerpo: "Revisá la información actualizada en Mis turnos." },
  CANCELADO: { titulo: "Turno cancelado", cuerpo: "Consultá el estado de tus reservas en Mis turnos." },
  NUEVO_BARBERO: { titulo: "Nuevo turno en tu agenda", cuerpo: "Abrí tu agenda para ver la reserva." },
  RECORDATORIO: { titulo: "Recordatorio de turno", cuerpo: "Revisá la fecha y la hora en Mis turnos." },
};

type TipoAviso = keyof typeof mensajes;
type TurnoParaAviso = { id: string; userId: string; barberoId: string; horarioReservado: Date };

function obtenerDestinatario(turno: TurnoParaAviso, tipo: TipoAviso): Prisma.userWhereInput {
  const reserva = { id: turno.id };
  if (tipo === "NUEVO_BARBERO") {
    return {
      role: { in: ["ADMIN", "EMPLEADO"] },
      barbero: {
        id: turno.barberoId,
        estado: true,
        turnos: { some: { ...reserva, estado: { in: [...ESTADOS_TURNO_ACTIVOS] } } },
      },
    };
  }

  if (tipo === "CANCELADO") {
    return { id: turno.userId, NOT: { turno: { some: { ...reserva, estado: { not: "CANCELADO" } } } } };
  }
  const estado = tipo === "ACTUALIZADO" ? { in: [...ESTADOS_TURNO_ACTIVOS] } : "CONFIRMADO";
  const horario = tipo === "CONFIRMADO" ? {} : { horarioReservado: turno.horarioReservado };
  return { id: turno.userId, turno: { some: { ...reserva, ...horario, estado } } };
}

export async function enviarAvisoPushTurno(turno: TurnoParaAviso, tipo: TipoAviso) {
  const configuracion = obtenerConfiguracionPush();
  if (!configuracion) return { enviados: 0, reintentar: false };
  const esParaBarbero = tipo === "NUEVO_BARBERO";
  const destino = esParaBarbero ? "/admin/turno?agenda=personal" : "/dashboard?tab=turnos";
  const tag = createHash("sha256").update(`${turno.id}:${destino}`).digest("hex").slice(0, 32);
  const mensaje = JSON.stringify({ ...mensajes[tipo], tag, destino });
  const vencimiento = Math.floor((turno.horarioReservado.getTime() - Date.now()) / 1000);
  const ttl = tipo === "CANCELADO" ? 14_400 : Math.min(vencimiento, tipo === "RECORDATORIO" ? 86_400 : 14_400);
  if (ttl <= 0) return { enviados: 0, reintentar: false };

  try {
    const suscripciones = await prisma.suscripcion_push.findMany({
      where: {
        claveVapid: configuracion.publicKey,
        user: { esInvitado: false, ...obtenerDestinatario(turno, tipo) },
      },
      select: { id: true, userId: true, actualizadoEn: true, endpoint: true, clavePublica: true, auth: true },
    });

    let enviados = 0;
    let falloTransitorio = false;
    for (let inicio = 0; inicio < suscripciones.length; inicio += 8) {
      const resultados = await Promise.all(suscripciones.slice(inicio, inicio + 8).map(async (suscripcion) => {
        const endpoint = endpointPush.safeParse(suscripcion.endpoint);
        if (!endpoint.success) return "invalida";
        try {
          await sendNotification(
            { endpoint: endpoint.data, keys: { p256dh: suscripcion.clavePublica, auth: suscripcion.auth } },
            mensaje,
            { vapidDetails: configuracion, timeout: 4_000, TTL: ttl, topic: tag },
          );
          return "enviada";
        } catch (error) {
          const codigo = error instanceof WebPushError ? error.statusCode : null;
          if (codigo === 404 || codigo === 410) {
            const { id, userId, actualizadoEn } = suscripcion;
            try {
              await prisma.suscripcion_push.deleteMany({ where: { id, userId, actualizadoEn } });
            } catch {
              console.error("No se pudo limpiar una suscripción push vencida.");
            }
            return "vencida";
          }
          console.error("No se pudo enviar una notificación de turno.", { tipo, codigo });
          return codigo === null || codigo === 429 || codigo >= 500 ? "transitoria" : "rechazada";
        }
      }));
      enviados += resultados.filter((resultado) => resultado === "enviada").length;
      falloTransitorio ||= resultados.includes("transitoria");
    }
    return { enviados, reintentar: enviados === 0 && falloTransitorio };
  } catch {
    console.error("No se pudieron consultar las suscripciones para el aviso de turno.");
    return { enviados: 0, reintentar: true };
  }
}
