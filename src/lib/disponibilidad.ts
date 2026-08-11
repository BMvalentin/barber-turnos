import { prisma } from "@/lib/prisma";
import { addMinutes } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { MAP_DIA_SEMANA } from "@/lib/constants";

const TIMEZONE = "America/Argentina/Buenos_Aires";
const GRANULARIDAD_MINUTOS = 15;

function minutosDeHora(hora: string): number {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
}

export async function obtenerDisponibilidad(servicioId: string, barberoId: string, fechaInicio: string, fechaFin: string, turnoIdAExcluir?: string): Promise<Record<string, string[]>> {
  const inicioRango = fromZonedTime(`${fechaInicio}T00:00:00`, TIMEZONE);
  const finRango = fromZonedTime(`${fechaFin}T23:59:59`, TIMEZONE);

  const [servicio, horariosBarbero, turnosRango, excepciones] = await Promise.all([
    prisma.servicio.findUnique({ where: { id: servicioId }, select: { duracion: true } }),
    prisma.margen_laboral_barbero.findMany({ where: { barberoId, estado: true }, include: { margenLaboral: { include: { dia: true } } } }),
    prisma.turno.findMany({ where: { barberoId, horarioReservado: { gte: inicioRango, lte: finRango }, estado: { notIn: ["CANCELADO"] }, ...(turnoIdAExcluir && { id: { not: turnoIdAExcluir } }) }, include: { servicio: { select: { duracion: true } } } }),
    prisma.excepcion_laboral.findMany({ where: { estado: true, desde: { lte: finRango }, hasta: { gte: inicioRango }, OR: [{ barberoId }, { barberoId: null }] } }),
  ]);

  if (!servicio?.duracion) throw new Error("Servicio no encontrado");

  const resultado: Record<string, string[]> = {};
  const ahora = new Date();
  let [anio, mes, dia] = fechaInicio.split("-").map(Number);
  const [anioFin, mesFin, diaFin] = fechaFin.split("-").map(Number);
  const tope = anioFin * 10000 + mesFin * 100 + diaFin;

  while (anio * 10000 + mes * 100 + dia <= tope) {
    const fechaStr = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const inicioDia = fromZonedTime(`${fechaStr}T00:00:00`, TIMEZONE);
    const finDia = fromZonedTime(`${fechaStr}T23:59:59`, TIMEZONE);

    if (finDia.getTime() < ahora.getTime()) continue;
    if (excepciones.some((ex) => inicioDia < ex.hasta && finDia > ex.desde)) continue;

    const diaEnum = MAP_DIA_SEMANA[toZonedTime(inicioDia, TIMEZONE).getDay()];
    const horariosDia = horariosBarbero
      .filter((h) => h.margenLaboral.dia.dia === diaEnum && h.margenLaboral.estado === true)
      .sort((a, b) => minutosDeHora(a.margenLaboral.desde) - minutosDeHora(b.margenLaboral.desde));

    const turnosDia = turnosRango.filter((t) => {
      const tZoned = toZonedTime(t.horarioReservado, TIMEZONE);
      return `${tZoned.getFullYear()}-${String(tZoned.getMonth() + 1).padStart(2, "0")}-${String(tZoned.getDate()).padStart(2, "0")}` === fechaStr;
    });

    const slots: string[] = [];
    for (const horario of horariosDia) {
      let actualMinutos = minutosDeHora(horario.margenLaboral.desde);
      const limiteMinutos = minutosDeHora(horario.margenLaboral.hasta);

      while (actualMinutos + servicio.duracion <= limiteMinutos) {
        const slotUTC = fromZonedTime(`${fechaStr}T${String(Math.floor(actualMinutos / 60)).padStart(2, "0")}:${String(actualMinutos % 60).padStart(2, "0")}:00`, TIMEZONE);

        if (!turnosDia.some((t) => slotUTC < addMinutes(t.horarioReservado, t.servicio.duracion) && addMinutes(slotUTC, servicio.duracion) > t.horarioReservado)
          && slotUTC.getTime() > ahora.getTime() + 10 * 60 * 1000) {
          slots.push(slotUTC.toISOString());
        }
        actualMinutos += GRANULARIDAD_MINUTOS;
      }
    }

    resultado[fechaStr] = [...new Set(slots)].sort();

    const siguiente = new Date(anio, mes - 1, dia + 1);
    [anio, mes, dia] = [siguiente.getFullYear(), siguiente.getMonth() + 1, siguiente.getDate()];
  }

  return resultado;
}