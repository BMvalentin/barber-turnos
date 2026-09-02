import { prisma } from "@/lib/prisma";
import { addMinutes } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { MAPA_DIA_SEMANA_DB, ESTADOS_TURNO, MINIMO_ANTICIPACION_MS, ZONA_HORARIA } from "@/lib/constants";
import { obtenerRangoDelDia } from "@/lib/utils/obtener-rango-del-dia";

const GRANULARIDAD_MINUTOS = 15;

function minutosDeHora(hora: string): number {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
}

export async function obtenerDisponibilidad(servicioId: string, barberoId: string, fechaInicio: string, fechaFin: string, turnoIdAExcluir?: string): Promise<Record<string, string[]>> {
  const { inicio: inicioRango } = obtenerRangoDelDia(fechaInicio);
  const { fin: finRango } = obtenerRangoDelDia(fechaFin);

  const [servicio, horariosBarbero, turnosRango, excepciones] = await Promise.all([
    prisma.servicio.findUnique({ where: { id: servicioId }, select: { duracion: true } }),
    prisma.margen_laboral_barbero.findMany({ where: { barberoId, estado: true }, include: { margenLaboral: { include: { dia: true } } } }),
    prisma.turno.findMany({ where: { barberoId, horarioReservado: { gte: inicioRango, lte: finRango }, estado: { notIn: [ESTADOS_TURNO[3]] }, ...(turnoIdAExcluir && { id: { not: turnoIdAExcluir } }) }, include: { servicio: { select: { duracion: true } } } }),
    prisma.excepcion_laboral.findMany({ where: { estado: true, desde: { lte: finRango }, hasta: { gte: inicioRango }, OR: [{ barberoId }, { barberoId: null }] } }),
  ]);

  if (!servicio?.duracion) throw new Error("Servicio no encontrado");

  const horariosPorDia = new Map<string, typeof horariosBarbero>();
  for (const horario of horariosBarbero) {
    if (!horario.margenLaboral.estado) continue;
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

  const turnosPorFecha = new Map<string, typeof turnosRango>();
  for (const turno of turnosRango) {
    const fechaZonificada = toZonedTime(turno.horarioReservado, ZONA_HORARIA);
    const fecha = `${fechaZonificada.getFullYear()}-${String(fechaZonificada.getMonth() + 1).padStart(2, "0")}-${String(fechaZonificada.getDate()).padStart(2, "0")}`;
    const turnos = turnosPorFecha.get(fecha) ?? [];
    turnos.push(turno);
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
    const siguienteDia = new Date(anio, mes - 1, dia + 1);
    const avanzarDia = () => {
      [anio, mes, dia] = [siguienteDia.getFullYear(), siguienteDia.getMonth() + 1, siguienteDia.getDate()];
    };

    if (finDia.getTime() < ahora.getTime()) {
      avanzarDia();
      continue;
    }
    if (excepciones.some((ex) => inicioDia < ex.hasta && finDia > ex.desde)) {
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

        if (!turnosDia.some((t) => slotUTC < addMinutes(t.horarioReservado, t.servicio.duracion) && addMinutes(slotUTC, servicio.duracion) > t.horarioReservado)
          && slotUTC.getTime() > ahora.getTime() + MINIMO_ANTICIPACION_MS) {
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
