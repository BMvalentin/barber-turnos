import { prisma } from "@/lib/prisma";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import { obtenerRangoDelDia } from "@/lib/utils/obtener-rango-del-dia";
import { enviarAvisoPushTurno } from "./enviar-aviso-push-turno";

type TurnoParaRecordar = {
  id: string;
  userId: string;
  barberoId: string;
  horarioReservado: Date;
  recordatorioPushPara: Date | null;
};

const TAMANO_LOTE = 5;

function inicioDeDiaPosterior(hoy: string, dias: number): Date {
  const fecha = new Date(`${hoy}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return obtenerRangoDelDia(fecha.toISOString().slice(0, 10)).inicio;
}

async function enviarRecordatorio(turno: TurnoParaRecordar) {
  const { id, userId, horarioReservado, recordatorioPushPara } = turno;
  const marca = await prisma.turno.updateMany({
    where: { id, userId, estado: "CONFIRMADO", horarioReservado, recordatorioPushPara },
    data: { recordatorioPushPara: horarioReservado },
  });
  if (marca.count === 0) return { enviados: 0, reintentar: false };

  const resultado = await enviarAvisoPushTurno(turno, "RECORDATORIO");
  if (resultado.reintentar) {
    await prisma.turno.updateMany({
      where: { id, userId, recordatorioPushPara: horarioReservado },
      data: { recordatorioPushPara },
    });
  }
  return resultado;
}

export async function recordarTurnos(ahora: Date, claveVapid: string) {
  const hoy = obtenerFechaSola(ahora);
  const turnos = await prisma.turno.findMany({
    where: {
      estado: "CONFIRMADO",
      horarioReservado: { gte: inicioDeDiaPosterior(hoy, 1), lt: inicioDeDiaPosterior(hoy, 2) },
      user: { suscripcionesPush: { some: { claveVapid } } },
      OR: [
        { recordatorioPushPara: null },
        { NOT: { recordatorioPushPara: { equals: prisma.turno.fields.horarioReservado } } },
      ],
    },
    select: { id: true, userId: true, barberoId: true, horarioReservado: true, recordatorioPushPara: true },
  });

  let enviados = 0;
  let reintentables = 0;
  let errores = 0;
  for (let indice = 0; indice < turnos.length; indice += TAMANO_LOTE) {
    const lote = turnos.slice(indice, indice + TAMANO_LOTE);
    const resultados = await Promise.allSettled(lote.map(enviarRecordatorio));
    for (const resultado of resultados) {
      if (resultado.status === "rejected") {
        errores++;
        continue;
      }
      enviados += resultado.value.enviados;
      if (resultado.value.reintentar) reintentables++;
    }
  }

  return { enviados, reintentables, errores };
}
