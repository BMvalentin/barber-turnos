"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath,revalidateTag } from "next/cache";
import { addMinutes } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { auth } from "@/auth";
import { MAP_DIA_SEMANA } from "@/lib/constants";
import { sendTurnoEmail } from "@/lib/email";
import { getCachedData } from "@/lib/cache";

const TIMEZONE = "America/Argentina/Buenos_Aires";

const revalidateBarberoCache = (barberoId: string, fecha: string) => {
  revalidateTag(`turnos-${barberoId}-${fecha}`);
  revalidateTag("turnos-global");
  revalidatePath("/turno");
  revalidatePath("/admin");
};

export type ActionState = {
  success: boolean;
  error?: string;
  data?: any;
};

/* =========================
   OBTENER DÍAS DISPONIBLES DEL MES
========================= */

export async function obtenerDiasDisponibles(
  mes: string,
  servicioId: string,
  barberoId: string,
  turnoIdAExcluir?: string,
): Promise<{ success: boolean; data?: string[]; error?: string }> {
  
  const cacheKey = ["dias-disponibles", mes, servicioId, barberoId, turnoIdAExcluir || "none"];
  const cacheTags = [`turnos-mes-${barberoId}-${mes}`, `servicio-${servicioId}`, `margenes-${barberoId}`, "turnos-global"];

  // Envolvemos toda la lógica pesada en una función para el caché
  const calcularDiasDisponibles = async () => {

    const inicioDeMes = fromZonedTime(`${mes}-01T00:00:00`, TIMEZONE);
    const [anio, numMes] = mes.split("-").map(Number);
    const ultimoDia = new Date(anio, numMes, 0).getDate();
    const finDeMes = fromZonedTime(`${mes}-${ultimoDia.toString().padStart(2, "0")}T23:59:59`, TIMEZONE);

    // Obtenemos datos necesarios (estas consultas individuales ya están cacheadas por tu getCachedData)
    const [servicio, horariosBarbero, turnosMes] = await Promise.all([
      prisma.servicio.findUnique({ where: { id: servicioId }, select: { duracion: true } }),
      prisma.margen_laboral_barbero.findMany({
        where: { barberoId, estado: true },
        include: { margenLaboral: { include: { dia: true } } },
      }),
      prisma.turno.findMany({
        where: {
          barberoId,
          horarioReservado: { gte: inicioDeMes, lte: finDeMes },
          estado: { notIn: ["CANCELADO"] },
          ...(turnoIdAExcluir && { id: { not: turnoIdAExcluir } }),
        },
        include: { servicio: { select: { duracion: true } } },
      }),
    ]);

    if (!servicio?.duracion) throw new Error("Servicio no encontrado");

    const diasConDisponibilidad: string[] = [];
    const ahora = new Date();

    for (let dia = 1; dia <= ultimoDia; dia++) {
      const fechaStr = `${mes}-${dia.toString().padStart(2, "0")}`;
      const inicioDia = fromZonedTime(`${fechaStr}T00:00:00`, TIMEZONE);
      const finDia = fromZonedTime(`${fechaStr}T23:59:59`, TIMEZONE);

      if (finDia.getTime() < ahora.getTime()) continue;

      const diaSemana = toZonedTime(inicioDia, TIMEZONE).getDay();
      const diaEnum = MAP_DIA_SEMANA[diaSemana];

      const margenesDia = horariosBarbero.filter((h: any) => 
        h.margenLaboral.dia.dia === diaEnum && h.margenLaboral.estado === true
      );

      if (margenesDia.length === 0) continue;

      const turnosDia = turnosMes.filter((t: any) => {
        const tZoned = toZonedTime(new Date(t.horarioReservado), TIMEZONE);
        const tFechaStr = `${tZoned.getFullYear()}-${String(tZoned.getMonth() + 1).padStart(2, "0")}-${String(tZoned.getDate()).padStart(2, "0")}`;
        return tFechaStr === fechaStr;
      });

      // Lógica de detección de slots
      let tieneSlot = false;
      for (const horario of margenesDia) {
        if (tieneSlot) break;
        const [hInicio, mInicio] = horario.margenLaboral.desde.split(":").map(Number);
        const [hFin, mFin] = horario.margenLaboral.hasta.split(":").map(Number);
        let actualMinutos = hInicio * 60 + mInicio;
        const limiteMinutos = hFin * 60 + mFin;

        while (actualMinutos + servicio.duracion <= limiteMinutos) {
          const hora = Math.floor(actualMinutos / 60);
          const min = actualMinutos % 60;
          const slotUTC = fromZonedTime(`${fechaStr}T${hora.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:00`, TIMEZONE);
          
          if (slotUTC.getTime() > ahora.getTime() + 10 * 60 * 1000) {
            const estaOcupado = turnosDia.some((turno: any) => {
              const inicioT = new Date(turno.horarioReservado);
              const finT = addMinutes(inicioT, turno.servicio.duracion);
              const finS = addMinutes(slotUTC, servicio.duracion);
              return slotUTC < finT && finS > inicioT;
            });
            if (!estaOcupado) { tieneSlot = true; break; }
          }
          actualMinutos += 30;
        }
      }
      if (tieneSlot) diasConDisponibilidad.push(fechaStr);
    }
    return diasConDisponibilidad;
  };

  try {
    const data = await getCachedData(cacheKey, cacheTags, calcularDiasDisponibles, 60);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Error al calcular disponibilidad" };
  }
}
/* =========================
   HELPERS
========================= */

function getMinutesFromZonedDate(date: Date): number {
  const zoned = toZonedTime(date, TIMEZONE);
  return zoned.getHours() * 60 + zoned.getMinutes();
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/* =========================
   CREATE TURNO
========================= */

export async function createTurno(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const servicioId = formData.get("servicioId") as string;
    const userId = formData.get("userId") as string;
    const barberoId = formData.get("barberoId") as string;
    const horarioStr = formData.get("horarioReservado") as string;

    if (!servicioId || !userId || !barberoId || !horarioStr) {
      return { success: false, error: "Datos incompletos" };
    }

    const inicio = new Date(horarioStr);
    if (isNaN(inicio.getTime())) {
      return { success: false, error: "Fecha inválida" };
    }

    const ahora = new Date();
    if (inicio.getTime() <= ahora.getTime() + 10 * 60 * 1000) {
      return { success: false, error: "Reservá con 10 minutos de anticipación" };
    }

    const servicio = await prisma.servicio.findUnique({ where: { id: servicioId } });
    if (!servicio) return { success: false, error: "Servicio no encontrado" };

    const fin = addMinutes(inicio, servicio.duracion);
    const zonedInicio = toZonedTime(inicio, TIMEZONE);
    const diaSemana = zonedInicio.getDay();
    const fechaSolo = toZonedTime(inicio, TIMEZONE).toISOString().split("T")[0];
    const inicioDia = fromZonedTime(`${fechaSolo}T00:00:00`, TIMEZONE);
    const finDia = fromZonedTime(`${fechaSolo}T23:59:59`, TIMEZONE);

    const [diaLaboral, excepciones, turnosDelDia] = await Promise.all([
      prisma.dia_laboral.findFirst({
        where: { dia: MAP_DIA_SEMANA[diaSemana] as any, estado: true },
        include: { margenes: { where: { estado: true } } },
      }),
      prisma.excepcion_laboral.findMany({
        where: { estado: true, desde: { lte: fin }, hasta: { gte: inicio } },
      }),
      prisma.turno.findMany({
        where: {
          estado: { in: ["PENDIENTE", "CONFIRMADO"] },
          horarioReservado: { gte: inicioDia, lte: finDia },
        },
        include: { servicio: { select: { duracion: true } } },
      }),
    ]);

    if (excepciones.length > 0) return { success: false, error: excepciones[0].motivo };
    if (!diaLaboral) return { success: false, error: "El negocio está cerrado ese día" };

    const minInicio = zonedInicio.getHours() * 60 + zonedInicio.getMinutes();
    const minFin = minInicio + servicio.duracion;

    const entraEnMargen = diaLaboral.margenes.some((m: any) => {
      const [hDesde, mDesde] = m.desde.split(":").map(Number);
      const [hHasta, mHasta] = m.hasta.split(":").map(Number);
      const desdeMin = hDesde * 60 + mDesde;
      const hastaMin = hHasta * 60 + mHasta;
      return minInicio >= desdeMin && minFin <= hastaMin;
    });

    if (!entraEnMargen) return { success: false, error: "Horario fuera del rango laboral" };

    const hayChoque = turnosDelDia.some((t: any) => {
      const tFin = addMinutes(new Date(t.horarioReservado), t.servicio.duracion);
      return inicio < tFin && fin > t.horarioReservado;
    });

    if (hayChoque) return { success: false, error: "Horario ocupado" };

    const turno = await prisma.turno.create({
      data: {
        servicioId,
        userId,
        barberoId,
        horarioReservado: inicio,
        precioCongelado: servicio.precio,
        seniaCongelada: servicio.senia,
        estado: "PENDIENTE",
      },
      include: { user: true, barbero: true, servicio: true },
    });

    // Invalidar cache
    revalidateBarberoCache(barberoId, fechaSolo);
    revalidateTag(`turnos-mes-${barberoId}-${fechaSolo.substring(0, 7)}`);
    revalidateTag(`turnos-user-${userId}`);

    try {
      const zoned = toZonedTime(inicio, TIMEZONE);
      const dayName = new Intl.DateTimeFormat("es-AR", { weekday: "long" }).format(zoned);
      const timeString = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(zoned);
      await sendTurnoEmail(turno.user.email, {
        clienteNombre: turno.user.name || "Cliente",
        servicioNombre: turno.servicio.nombre,
        barberoNombre: turno.barbero.nombre,
        fechaSemana: dayName,
        fechaHora: timeString,
        estado: "CREADO",
      });
    } catch (e) {
      console.error("Error enviando email de creación:", e);
    }

    return {
      success: true,
      data: {
        ...turno,
        precioCongelado: Number(turno.precioCongelado),
        seniaCongelada: Number(turno.seniaCongelada),
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al crear turno" };
  }
}

/* =========================
   GET TURNOS
========================= */

export async function getTurnos(): Promise<ActionState> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "No autorizado" };

    const isAdmin = session.user.role === "ADMIN";
    const userId = session.user.id;
    
    // Identificador único para el caché
    const cacheKey = ["turnos-list", isAdmin ? "admin" : userId];
    const cacheTags = [isAdmin ? "turnos-global" : `turnos-user-${userId}`];

    // La lógica de obtención y formateo queda dentro del caché
    const fetchAndFormatTurnos = async () => {
      
      const turnos = await prisma.turno.findMany({
        where: isAdmin ? {} : { userId: userId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          servicio: { select: { id: true, nombre: true, duracion: true } },
          barbero: { select: { id: true, nombre: true } },
        },
        orderBy: { horarioReservado: "asc" },
      });

      // Formateamos numeros, para que el caché guarde el objeto listo
      return turnos.map((t) => ({
        ...t,
        precioCongelado: Number(t.precioCongelado),
        seniaCongelada: Number(t.seniaCongelada),
      }));
    };

    const data = await getCachedData(cacheKey, cacheTags, fetchAndFormatTurnos, 60);

    return { success: true, data };
  } catch (error) {
    console.error("Error en getTurnos:", error);
    return { success: false, error: "Error al obtener turnos" };
  }
}

/* =========================
   OBTENER HORARIOS DISPONIBLES
========================= */

export async function obtenerHorariosDisponibles(
  fecha: string,
  servicioId: string,
  barberoId: string,
  turnoIdAExcluir?: string,
): Promise<ActionState> {
  
  // Clave única para el resultado final procesado
  const cacheKey = ["horarios-finales", fecha, servicioId, barberoId, turnoIdAExcluir || "none"];
  
  // Tags que invalidarán este caché si algo cambia
  const cacheTags = [`turnos-${barberoId}-${fecha}`, `servicio-${servicioId}`, "turnos-global"];

  // Lógica completa de cálculo
  const calcularSlotsFinales = async () => {
    // 1. Obtener datos (estas llamadas ya están cacheadas individualmente)
    const [servicio, horariosBarbero, turnosReservados] = await Promise.all([
      prisma.servicio.findUnique({ where: { id: servicioId }, select: { id: true, nombre: true, duracion: true } }),
      prisma.margen_laboral_barbero.findMany({
        where: { barberoId, estado: true },
        include: { margenLaboral: { include: { dia: true } } },
      }),
      prisma.turno.findMany({
        where: {
          barberoId,
          horarioReservado: { gte: fromZonedTime(`${fecha}T00:00:00`, TIMEZONE), lte: fromZonedTime(`${fecha}T23:59:59`, TIMEZONE) },
          estado: { notIn: ["CANCELADO"] },
          ...(turnoIdAExcluir && { id: { not: turnoIdAExcluir } }),
        },
        include: { servicio: { select: { duracion: true } } },
      }),
    ]);

    if (!servicio?.duracion) throw new Error("Servicio no encontrado");

    // 2. Procesar lógica de slots
    const slotsDisponibles: string[] = [];
    const ahora = new Date();
    const diaSemana = toZonedTime(fromZonedTime(`${fecha}T00:00:00`, TIMEZONE), TIMEZONE).getDay();
    const diaEnum = MAP_DIA_SEMANA[diaSemana];

    const horariosDia = horariosBarbero.filter((h: any) => h.margenLaboral.dia.dia === diaEnum && h.margenLaboral.estado === true);

    for (const horario of horariosDia) {
      const { desde, hasta } = horario.margenLaboral;
      let actualMinutos = parseInt(desde.split(":")[0]) * 60 + parseInt(desde.split(":")[1]);
      const limiteMinutos = parseInt(hasta.split(":")[0]) * 60 + parseInt(hasta.split(":")[1]);

      while (actualMinutos + servicio.duracion <= limiteMinutos) {
        const slotUTC = fromZonedTime(`${fecha}T${Math.floor(actualMinutos/60).toString().padStart(2, '0')}:${(actualMinutos%60).toString().padStart(2, '0')}:00`, TIMEZONE);

        const estaOcupado = (turnosReservados as any[]).some((turno) => {
          const inicioT = new Date(turno.horarioReservado);
          return slotUTC < addMinutes(inicioT, turno.servicio.duracion) && addMinutes(slotUTC, servicio.duracion) > inicioT;
        });

        if (!estaOcupado && slotUTC.getTime() > ahora.getTime() + 10 * 60 * 1000) {
          slotsDisponibles.push(slotUTC.toISOString());
        }
        actualMinutos += 30;
      }
    }
    return slotsDisponibles; // Retornamos el array final calculado
  };

  try {
    // Usamos el caché envolviendo todo el cálculo
    const data = await getCachedData(cacheKey, cacheTags, calcularSlotsFinales, 60);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Error al obtener horarios" };
  }
}

/* =========================
   ACTUALIZAR TURNO
========================= */

export async function actualizarTurno(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const id = formData.get("id") as string;
    if (!id) return { success: false, error: "ID de turno no proporcionado" };

    const rawEstado = formData.get("estado") as string;
    const rawServicioId = formData.get("servicioId") as string;
    const rawBarberoId = formData.get("barberoId") as string;
    const rawHorarioStr = formData.get("horarioReservado") as string;

    const turnoActual = await prisma.turno.findUnique({ where: { id } });
    if (!turnoActual) return { success: false, error: "Turno no encontrado" };

    const servicioId = rawServicioId || turnoActual.servicioId;
    const barberoId = rawBarberoId || turnoActual.barberoId;
    const horarioStr = rawHorarioStr || turnoActual.horarioReservado.toISOString();
    const estado = (rawEstado as any) || turnoActual.estado;
    const horario = new Date(horarioStr);

    const cambioFecha = horario.getTime() !== turnoActual.horarioReservado.getTime();
    const cambioBarbero = barberoId !== turnoActual.barberoId;
    const cambioServicio = servicioId !== turnoActual.servicioId;

    if (cambioFecha || cambioBarbero || cambioServicio) {
      if (cambioFecha) {
        const ahora = new Date();
        if (horario.getTime() <= ahora.getTime() + 10 * 60 * 1000) {
          return { success: false, error: "El nuevo horario debe ser con al menos 10 minutos de anticipación" };
        }
      }

      const servicio = await prisma.servicio.findUnique({ where: { id: servicioId } });
      if (!servicio) return { success: false, error: "Servicio no encontrado" };

      const fecha = toZonedTime(horario, TIMEZONE).toISOString().split("T")[0];
      const horariosDisponibles = await obtenerHorariosDisponibles(fecha, servicioId, barberoId, id);

      if (!horariosDisponibles.success || !horariosDisponibles.data?.includes(horario.toISOString())) {
        return { success: false, error: "El horario seleccionado no está disponible para este barbero/servicio" };
      }

      const dataUpdate: any = { servicioId, barberoId, horarioReservado: horario, estado };
      if (cambioServicio) {
        dataUpdate.precioCongelado = servicio.precio;
        dataUpdate.seniaCongelada = servicio.senia;
      }

      const turnoActualizado = await prisma.turno.update({
        where: { id },
        data: dataUpdate,
        include: { user: true, barbero: true, servicio: true },
      });

      // Invalidar cache del día anterior y nuevo
      const fechaAnterior = toZonedTime(turnoActual.horarioReservado, TIMEZONE).toISOString().split("T")[0];
      revalidateBarberoCache(turnoActual.barberoId, fechaAnterior);
      revalidateBarberoCache(barberoId, fecha);
      revalidateTag(`turnos-mes-${barberoId}-${fecha.substring(0, 7)}`);
      revalidateTag(`turnos-user-${turnoActual.userId}`);

      try {
        const zoned = toZonedTime(turnoActualizado.horarioReservado, TIMEZONE);
        const dayName = new Intl.DateTimeFormat("es-AR", { weekday: "long" }).format(zoned);
        const timeString = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(zoned);
        await sendTurnoEmail(turnoActualizado.user.email, {
          clienteNombre: turnoActualizado.user.name || "Cliente",
          servicioNombre: turnoActualizado.servicio.nombre,
          barberoNombre: turnoActualizado.barbero.nombre,
          fechaSemana: dayName,
          fechaHora: timeString,
          estado: turnoActualizado.estado === "CANCELADO" ? "CANCELADO" : "ACTUALIZADO",
        });
      } catch (e) {
        console.error("Error enviando email de actualización:", e);
      }

      return {
        success: true,
        data: {
          ...turnoActualizado,
          precioCongelado: Number(turnoActualizado.precioCongelado),
          seniaCongelada: Number(turnoActualizado.seniaCongelada),
        },
      };
    } else {
      const turnoActualizado = await prisma.turno.update({
        where: { id },
        data: { estado },
        include: { user: true, barbero: true, servicio: true },
      });

      revalidateTag("turnos-global");
      revalidateTag(`turnos-user-${turnoActual.userId}`);
      revalidatePath("/turno");
      revalidatePath("/admin");

      try {
        const zoned = toZonedTime(turnoActualizado.horarioReservado, TIMEZONE);
        const dayName = new Intl.DateTimeFormat("es-AR", { weekday: "long" }).format(zoned);
        const timeString = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(zoned);
        await sendTurnoEmail(turnoActualizado.user.email, {
          clienteNombre: turnoActualizado.user.name || "Cliente",
          servicioNombre: turnoActualizado.servicio.nombre,
          barberoNombre: turnoActualizado.barbero.nombre,
          fechaSemana: dayName,
          fechaHora: timeString,
          estado: turnoActualizado.estado === "CANCELADO" ? "CANCELADO" : "ACTUALIZADO",
        });
      } catch (e) {
        console.error("Error enviando email de estado:", e);
      }

      return {
        success: true,
        data: {
          ...turnoActualizado,
          precioCongelado: Number(turnoActualizado.precioCongelado),
          seniaCongelada: Number(turnoActualizado.seniaCongelada),
        },
      };
    }
  } catch (error) {
    console.error("Error al actualizar turno:", error);
    return { success: false, error: "Error al actualizar el turno" };
  }
}

/* =========================
   COMPLETAR TURNO
========================= */

export async function completedTurno(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const id = formData.get("id") as string;
    if (!id) return { success: false, error: "ID inválido" };

    const turno = await prisma.turno.update({
      where: { id },
      data: { estado: "COMPLETADO" },
    });

    revalidateTag("turnos-global");
    revalidateTag(`turnos-user-${turno.userId}`);
    revalidatePath("/admin");
    revalidatePath("/turno");

    return {
      success: true,
      data: {
        ...turno,
        precioCongelado: Number(turno.precioCongelado),
        seniaCongelada: Number(turno.seniaCongelada),
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al completar turno" };
  }
}

/* =========================
   ELIMINAR TURNO
========================= */

export async function deleteTurno(prevState: any, formData: FormData) {
  try {
    const id = formData.get("id") as string;
    if (!id) return { success: false, error: "ID inválido" };

    const turnoToDelete = await prisma.turno.findUnique({
      where: { id },
      include: { user: true, barbero: true, servicio: true },
    });

    if (!turnoToDelete) return { success: false, error: "Turno no encontrado" };

    await prisma.turno.delete({ where: { id } });

    const fecha = toZonedTime(turnoToDelete.horarioReservado, TIMEZONE).toISOString().split("T")[0];
    revalidateBarberoCache(turnoToDelete.barberoId, fecha);
    revalidateTag(`turnos-mes-${turnoToDelete.barberoId}-${fecha.substring(0, 7)}`);
    revalidateTag(`turnos-user-${turnoToDelete.userId}`);

    try {
      const zoned = toZonedTime(turnoToDelete.horarioReservado, TIMEZONE);
      const dayName = new Intl.DateTimeFormat("es-AR", { weekday: "long" }).format(zoned);
      const timeString = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(zoned);
      await sendTurnoEmail(turnoToDelete.user.email, {
        clienteNombre: turnoToDelete.user.name || "Cliente",
        servicioNombre: turnoToDelete.servicio.nombre,
        barberoNombre: turnoToDelete.barbero.nombre,
        fechaSemana: dayName,
        fechaHora: timeString,
        estado: "CANCELADO",
      });
    } catch (e) {
      console.error("Error enviando email de eliminación:", e);
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al eliminar turno" };
  }
}