import { prisma } from "@/lib/prisma";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { MAPA_DIA_SEMANA_DB, ESTADOS_TURNO_ACTIVOS, ZONA_HORARIA } from "@/lib/constants";
import { obtenerRangoDelDia } from "@/lib/utils/obtener-rango-del-dia";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import { filtrarHorariosPorDuracion, type CapacidadHoraria } from "@/lib/turnos/capacidad-horaria";

const GRANULARIDAD_MINUTOS = 15;
const MS_POR_MINUTO = 60_000;

function minutosDeHora(hora: string): number {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
}

export async function obtenerDisponibilidad(servicioId: string, barberoId: string, fechaInicio: string, fechaFin: string, turnoIdAExcluir?: string): Promise<Record<string, string[]>> {
  const [servicio, asignacion] = await Promise.all([
    prisma.servicio.findUnique({ where: { id: servicioId }, select: { duracion: true, estado: true } }),
    prisma.servicioxbarbero.findUnique({
      where: { barbero_servicio_unique: { barberoId, servicioId } },
      select: { id: true },
    }),
  ]);
  if (!servicio?.duracion) throw new Error("Servicio no encontrado");
  if (!servicio.estado || !asignacion) return {};

  const capacidad = await obtenerCapacidadHoraria(barberoId, fechaInicio, fechaFin, turnoIdAExcluir);
  return filtrarHorariosPorDuracion(capacidad, servicio.duracion);
}

export async function obtenerCapacidadHoraria(
  barberoId: string,
  fechaInicio: string,
  fechaFin: string,
  turnoIdAExcluir?: string,
): Promise<CapacidadHoraria> {
  const { inicio: inicioRango } = obtenerRangoDelDia(fechaInicio);
  const { fin: finRango } = obtenerRangoDelDia(fechaFin);
  const ahoraConsulta = new Date();
  if (finRango < ahoraConsulta) return {};
  const { inicio: inicioHoy } = obtenerRangoDelDia(obtenerFechaSola(ahoraConsulta));
  const inicioConsulta = inicioRango < inicioHoy ? inicioHoy : inicioRango;

  const [barbero, horariosBarbero, turnosRango, excepciones] = await Promise.all([
    prisma.barbero.findUnique({ where: { id: barberoId }, select: { estado: true } }),
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

  if (!barbero?.estado) return {};

  const horariosPorDia = new Map<string, typeof horariosBarbero>();
  for (const horario of horariosBarbero) {
    if (!horario.margenLaboral.estado || !horario.margenLaboral.dia.estado) continue;
    const dia = horario.margenLaboral.dia.dia;
    const horarios = horariosPorDia.get(dia) ?? [];
    horarios.push(horario);
    horariosPorDia.set(dia, horarios);
  }
  const turnosPorFecha = new Map<string, Array<{ inicio: number; fin: number }>>();
  for (const turno of turnosRango) {
    const fecha = obtenerFechaSola(turno.horarioReservado);
    const turnos = turnosPorFecha.get(fecha) ?? [];
    const inicio = turno.horarioReservado.getTime();
    turnos.push({ inicio, fin: inicio + turno.servicio.duracion * MS_POR_MINUTO });
    turnosPorFecha.set(fecha, turnos);
  }

  const cierres = excepciones.map(({ desde, hasta }) => ({ inicio: desde.getTime(), fin: hasta.getTime() }));
  const resultado: CapacidadHoraria = {};
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

    if (finDia < ahoraConsulta) {
      avanzarDia();
      continue;
    }
    const diaEnum = MAPA_DIA_SEMANA_DB[toZonedTime(inicioDia, ZONA_HORARIA).getDay()];
    const horariosDia = horariosPorDia.get(diaEnum) ?? [];
    const turnosDia = turnosPorFecha.get(fechaStr) ?? [];
    const cierresDelDia = cierres.filter(({ inicio, fin }) => inicio <= finDia.getTime() && fin >= inicioDia.getTime());

    const capacidadPorInicio = new Map<number, number>();
    for (const horario of horariosDia) {
      const limiteMinutos = minutosDeHora(horario.margenLaboral.hasta);
      const inicioMargen = minutosDeHora(horario.margenLaboral.desde);

      for (let minuto = inicioMargen; minuto < limiteMinutos; minuto += GRANULARIDAD_MINUTOS) {
        const hora = String(Math.floor(minuto / 60)).padStart(2, "0");
        const minutoHora = String(minuto % 60).padStart(2, "0");
        const inicioSlot = fromZonedTime(`${fechaStr}T${hora}:${minutoHora}:00`, ZONA_HORARIA).getTime();
        if (inicioSlot <= ahoraConsulta.getTime()) continue;

        let minutosDisponibles = limiteMinutos - minuto;
        for (const turno of turnosDia) {
          if (inicioSlot >= turno.fin) continue;
          minutosDisponibles = Math.min(minutosDisponibles, Math.floor((turno.inicio - inicioSlot) / MS_POR_MINUTO));
        }
        for (const cierre of cierresDelDia) {
          if (inicioSlot > cierre.fin) continue;
          // A diferencia de un turno, un cierre incluye sus dos extremos.
          minutosDisponibles = Math.min(minutosDisponibles, Math.ceil((cierre.inicio - inicioSlot) / MS_POR_MINUTO) - 1);
        }
        if (minutosDisponibles > (capacidadPorInicio.get(inicioSlot) ?? 0)) {
          capacidadPorInicio.set(inicioSlot, minutosDisponibles);
        }
      }
    }

    resultado[fechaStr] = [...capacidadPorInicio].sort(([a], [b]) => a - b);
    avanzarDia();
  }

  return resultado;
}
