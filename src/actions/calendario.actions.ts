"use server";

import { prisma } from "@/lib/prisma";
import { addMinutes, format, isBefore, isEqual } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const TIMEZONE = "America/Argentina/Buenos_Aires";

export type SlotHorario = {
  hora: string;
  disponible: boolean;
  razon?: string;
};

export async function obtenerHorariosDisponibles(
  fechaString: string,
  vehiculoServicioId: string,
  turnoIdAExcluir?: string
) {
  try {
    // 1. Configurar fecha base (00:00 del día solicitado en Argentina)
    const fechaBaseArg = fromZonedTime(`${fechaString} 00:00:00`, TIMEZONE);
    const diaZonificado = toZonedTime(fechaBaseArg, TIMEZONE);
    const diaSemana = diaZonificado.getDay();

    // 2. Obtener configuración del servicio
    const configServicio = await prisma.vehiculo_servicio.findUnique({
      where: { id: vehiculoServicioId },
      select: { duracion: true }
    });

    if (!configServicio) throw new Error("Servicio no encontrado");
    const duracion = configServicio.duracion;

    // 3. Obtener horarios de apertura
    const diaLaboral = await prisma.dia_laboral.findFirst({
      where: { dia: diaSemana, estado: true },
      include: { margenes: { where: { estado: true } } }
    });

    if (!diaLaboral || diaLaboral.margenes.length === 0) {
      return { success: true, horarios: [], mensaje: "El local está cerrado este día" };
    }

    // 4. Definir rango de búsqueda en la DB (Todo el día)
    const inicioBusqueda = fechaBaseArg;
    const finBusqueda = addMinutes(fechaBaseArg, 1440);

    const [excepcionesRaw, turnosRaw] = await Promise.all([
      prisma.expeciones_laborales.findMany({
        where: {
          estado: true,
          AND: [{ desde: { lt: finBusqueda } }, { hasta: { gt: inicioBusqueda } }]
        }
      }),
      prisma.turno.findMany({
        where: {
          estado: 1,
          horarioReservado: { gte: inicioBusqueda, lt: finBusqueda },
          ...(turnoIdAExcluir && { id: { not: turnoIdAExcluir } })
        },
        include: { vehiculo_servicio: { select: { duracion: true } } }
      })
    ]);

    // NORMALIZACIÓN: Convertimos todo lo que viene de la DB (UTC) a Hora Argentina
    const turnosExistentes = turnosRaw.map(t => ({
      inicio: toZonedTime(t.horarioReservado, TIMEZONE),
      fin: addMinutes(toZonedTime(t.horarioReservado, TIMEZONE), t.vehiculo_servicio.duracion)
    }));

    const excepciones = excepcionesRaw.map(e => ({
      desde: toZonedTime(e.desde, TIMEZONE),
      hasta: toZonedTime(e.hasta, TIMEZONE)
    }));

    const slotsResultado: SlotHorario[] = [];
    const intervaloGeneracion = 30; // Minutos entre cada opción de inicio

    for (const margen of diaLaboral.margenes) {
      // Generamos el iterador basado en el string de la DB (ej: "09:00") en Argentina
      let iteradorFecha = fromZonedTime(`${fechaString} ${margen.desde}`, TIMEZONE);
      const finMargenFecha = fromZonedTime(`${fechaString} ${margen.hasta}`, TIMEZONE);

      while (isBefore(addMinutes(iteradorFecha, duracion), finMargenFecha) || isEqual(addMinutes(iteradorFecha, duracion), finMargenFecha)) {
        
        const slotInicio = iteradorFecha;
        const slotFin = addMinutes(slotInicio, duracion);
        let disponible = true;
        let razon = "";

        // Comparar contra turnos ya normalizados
        const chocaConTurno = turnosExistentes.some(t => (slotInicio < t.fin) && (slotFin > t.inicio));
        const chocaConExcepcion = excepciones.some(e => (slotInicio < e.hasta) && (slotFin > e.desde));
        
        const ahora = toZonedTime(new Date(), TIMEZONE);
        const esPasado = slotInicio < addMinutes(ahora, 15); // 15 min de margen

        if (chocaConTurno) { disponible = false; razon = "Ocupado"; }
        else if (chocaConExcepcion) { disponible = false; razon = "Cerrado"; }
        else if (esPasado) { disponible = false; razon = "Pasado"; }

        slotsResultado.push({
          hora: format(slotInicio, "HH:mm"), // Ya está en la zona correcta
          disponible,
          razon
        });

        iteradorFecha = addMinutes(iteradorFecha, intervaloGeneracion);
      }
    }

    // Eliminar duplicados si hay márgenes solapados
    const uniqueSlots = new Map();
    slotsResultado.forEach(s => {
      if (!uniqueSlots.has(s.hora) || s.disponible) uniqueSlots.set(s.hora, s);
    });

    const horariosFinales = Array.from(uniqueSlots.values()).sort((a, b) => a.hora.localeCompare(b.hora));

    return { success: true, horarios: horariosFinales };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: "Error al calcular disponibilidad" };
  }
}