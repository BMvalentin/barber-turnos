import { prisma } from "@/lib/prisma";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { MAPA_DIA_SEMANA_DB, ESTADOS_TURNO_ACTIVOS, MINIMO_ANTICIPACION_MS, ZONA_HORARIA } from "@/lib/constants";
import { obtenerRangoDelDia } from "@/lib/utils/obtener-rango-del-dia";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";

const GRANULARIDAD_MINUTOS = 15;

function minutosDeHora(hora: string): number {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
}

export async function obtenerDisponibilidad(servicioId: string, barberoId: string, fechaInicio: string, fechaFin: string, turnoIdAExcluir?: string): Promise<Record<string, string[]>> {
  const { inicio: inicioRango } = obtenerRangoDelDia(fechaInicio);
  const { fin: finRango } = obtenerRangoDelDia(fechaFin);
  const ahoraConsulta = new Date();
  if (finRango < ahoraConsulta) return {};
  const { inicio: inicioHoy } = obtenerRangoDelDia(obtenerFechaSola(ahoraConsulta));
  const inicioConsulta = inicioRango < inicioHoy ? inicioHoy : inicioRango;

  const [servicio, barbero, horariosBarbero, turnosRango, excepciones] = await Promise.all([
    prisma.servicio.findUnique({ where: { id: servicioId }, select: { duracion: true, estado: true } }),
    prisma.barbero.findUnique({
      where: { id: barberoId },
      select: {
        estado: true,
        servicios: { where: { servicioId }, select: { id: true }, take: 1 },
      },
    }),
    prisma.margen_laboral_barbero.findMany({
      where: { barberoId, estado: true },
      select: {
        margenLaboral: {
          select: {
            estado: true,
            desde: true,
            hasta: true,
            dia: { select: { dia: true, estado: true } },
          },
        },
      },
    }),
    prisma.turno.findMany({
      where: {
        barberoId,
        horarioReservado: { gte: inicioConsulta, lte: finRango },
        estado: { in: [...ESTADOS_TURNO_ACTIVOS] },
        ...(turnoIdAExcluir && { id: { not: turnoIdAExcluir } }),
      },
      select: {
        horarioReservado: true,
        servicio: { select: { duracion: true } },
      },
    }),
    prisma.excepcion_laboral.findMany({
      where: {
        estado: true,
        desde: { lte: finRango },
        hasta: { gte: inicioConsulta },
        OR: [{ barberoId }, { barberoId: null }],
      },
      select: { desde: true, hasta: true },
    }),
  ]);

  if (!servicio?.duracion) throw new Error("Servicio no encontrado");
  if (!servicio.estado || !barbero?.estado || barbero.servicios.length === 0) return {};

  const horariosPorDia = new Map<string, typeof horariosBarbero>();
  for (const horario of horariosBarbero) {
    if (!horario.margenLaboral.estado || !horario.margenLaboral.dia.estado) continue;
    const dia = horario.margenLaboral.dia.dia;
    const horarios = horariosPorDia.get(dia) ?? [];
    horarios.push(horario);
    horariosPorDia.set(dia, horarios);
  }
  for (const horarios of horariosPorDia.values()) {
    horarios.sort(
      (primero, segundo) =>
        minutosDeHora(primero.margenLaboral.desde) -
        minutosDeHora(segundo.margenLaboral.desde),
    );
  }

  const turnosPorFecha = new Map<string, Array<{ inicio: number; fin: number }>>();
  for (const turno of turnosRango) {
    const fecha = obtenerFechaSola(turno.horarioReservado);
    const turnos = turnosPorFecha.get(fecha) ?? [];
    const inicio = turno.horarioReservado.getTime();
    turnos.push({ inicio, fin: inicio + turno.servicio.duracion * 60_000 });
    turnosPorFecha.set(fecha, turnos);
  }

  const resultado: Record<string, string[]> = {};
  const ahora = new Date();
  let [anio, mes, dia] = fechaInicio.split("-").map(Number);
  const [anioFin, mesFin, diaFin] = fechaFin.split("-").map(Number);
  const tope = anioFin * 10000 + mesFin * 100 + diaFin;

  while (anio * 10000 + mes * 100 + dia <= tope) {
    const fechaStr = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const { inicio: inicioDia, fin: finDia } = obtenerRangoDelDia(fechaStr);

    // Avanzar siempre al día siguiente, incluso en los `continue` (evita loop infinito)
    const siguienteDia = new Date(Date.UTC(anio, mes - 1, dia + 1));
    const avanzarDia = () => {
      [anio, mes, dia] = [siguienteDia.getUTCFullYear(), siguienteDia.getUTCMonth() + 1, siguienteDia.getUTCDate()];
    };

    if (finDia.getTime() < ahora.getTime()) {
      avanzarDia();
      continue;
    }
    const diaEnum = MAPA_DIA_SEMANA_DB[toZonedTime(inicioDia, ZONA_HORARIA).getDay()];
    const horariosDia = horariosPorDia.get(diaEnum) ?? [];
    const turnosDia = turnosPorFecha.get(fechaStr) ?? [];

    const slots: string[] = [];
    for (const horario of horariosDia) {
      let actualMinutos = minutosDeHora(horario.margenLaboral.desde);
      const limiteMinutos = minutosDeHora(horario.margenLaboral.hasta);

      while (actualMinutos + servicio.duracion <= limiteMinutos) {
        const slotUTC = fromZonedTime(fechaStr + "T" + `${String(Math.floor(actualMinutos / 60)).padStart(2, "0")}:${String(actualMinutos % 60).padStart(2, "0")}:00`, ZONA_HORARIA);
        const inicioSlot = slotUTC.getTime();
        const finSlot = inicioSlot + servicio.duracion * 60_000;

        if (!excepciones.some((ex) => ex.desde.getTime() <= finSlot && ex.hasta.getTime() >= inicioSlot)
          && !turnosDia.some((turno) => inicioSlot < turno.fin && finSlot > turno.inicio)
          && inicioSlot > ahora.getTime() + MINIMO_ANTICIPACION_MS) {
          slots.push(slotUTC.toISOString());
        }
        actualMinutos += GRANULARIDAD_MINUTOS;
      }
    }

    resultado[fechaStr] = [...new Set(slots)].sort();

    avanzarDia();
  }

  return resultado;
}
