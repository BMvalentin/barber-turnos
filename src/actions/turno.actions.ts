"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { addMinutes } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const TIMEZONE = "America/Argentina/Buenos_Aires";

export type ActionState = {
  success: boolean;
  error?: string;
  data?: any;
};

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
  formData: FormData
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
      return {
        success: false,
        error: "Reservá con 10 minutos de anticipación",
      };
    }

    const servicio = await prisma.servicio.findUnique({
      where: { id: servicioId },
    });

    if (!servicio) {
      return { success: false, error: "Servicio no encontrado" };
    }

    const fin = addMinutes(inicio, servicio.duracion);

    const fechaLocal = new Date(inicio);

    const inicioDia = new Date(
      fechaLocal.getFullYear(),
      fechaLocal.getMonth(),
      fechaLocal.getDate(),
      0, 0, 0
    );

    const finDia = new Date(
      fechaLocal.getFullYear(),
      fechaLocal.getMonth(),
      fechaLocal.getDate(),
      23, 59, 59
    );

    const diaSemana = fechaLocal.getDay();

    const [diaLaboral, excepciones, turnosDelDia] = await Promise.all([
      prisma.dia_laboral.findFirst({
        where: { dia: diaSemana, estado: true },
        include: { margenes: { where: { estado: true } } },
      }),

      prisma.excepcion_laboral.findMany({
        where: {
          estado: true,
          desde: { lte: fin },
          hasta: { gte: inicio },
        },
      }),

      prisma.turno.findMany({
        where: {
          estado: "PENDIENTE",
          horarioReservado: { gte: inicioDia, lte: finDia },
        },
        include: {
          servicio: { select: { duracion: true } },
        },
      }),
    ]);

    if (excepciones.length > 0) {
      return { success: false, error: excepciones[0].motivo };
    }

    if (!diaLaboral) {
      return { success: false, error: "El negocio está cerrado ese día" };
    }

    const minInicio =
      fechaLocal.getHours() * 60 + fechaLocal.getMinutes();
    const minFin = minInicio + servicio.duracion;

    const entraEnMargen = diaLaboral.margenes.some((m) => {
      const [hDesde, mDesde] = m.desde.split(":").map(Number);
      const [hHasta, mHasta] = m.hasta.split(":").map(Number);

      const desdeMin = hDesde * 60 + mDesde;
      const hastaMin = hHasta * 60 + mHasta;

      return minInicio >= desdeMin && minFin <= hastaMin;
    });

    if (!entraEnMargen) {
      return { success: false, error: "Horario fuera del rango laboral" };
    }

    const hayChoque = turnosDelDia.some((t) => {
      const tFin = addMinutes(
        new Date(t.horarioReservado),
        t.servicio.duracion
      );
      return inicio < tFin && fin > t.horarioReservado;
    });

    if (hayChoque) {
      return { success: false, error: "Horario ocupado" };
    }

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
    });

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
    return { success: false, error: "Error al crear turno" };
  }
}

/* =========================
   GET TURNOS
========================= */

export async function getTurnos(): Promise<ActionState> {
  try {
    const turnos = await prisma.turno.findMany({
      where: { estado: "PENDIENTE" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        servicio: { select: { nombre: true, duracion: true } },
        barbero: { select: { nombre: true } },
      },
      orderBy: { horarioReservado: "asc" },
    });

    return {
      success: true,
      data: turnos.map((t) => ({
        ...t,
        precioCongelado: Number(t.precioCongelado),
        seniaCongelada: Number(t.seniaCongelada),
      })),
    };
  } catch {
    return { success: false, error: "Error al obtener turnos" };
  }
}

/* =========================
   ACTUALIZAR TURNO
========================= */

export async function actualizarTurno(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const id = formData.get("id") as string;
    const servicioId = formData.get("servicioId") as string;
    const barberoId = formData.get("barberoId") as string;
    const horarioStr = formData.get("horarioReservado") as string;
    const estado = formData.get("estado") as "PENDIENTE" | "CONFIRMADO" | "CANCELADO" | "COMPLETADO";

    if (!id || !servicioId || !barberoId || !horarioStr || !estado) {
      return { success: false, error: "Datos incompletos" };
    }

    const horario = new Date(horarioStr);

    // Obtener el servicio para actualizar precios si cambió
    const servicio = await prisma.servicio.findUnique({
      where: { id: servicioId },
    });

    if (!servicio) {
      return { success: false, error: "Servicio no encontrado" };
    }

    // Verificar disponibilidad del nuevo horario
    const fecha = horario.toISOString().split('T')[0];
    const horariosDisponibles = await obtenerHorariosDisponibles(
      fecha,
      servicioId,
      barberoId,
      id // Excluir el turno actual
    );

    if (!horariosDisponibles.success || !horariosDisponibles.data?.includes(horarioStr)) {
      return { success: false, error: "El horario seleccionado no está disponible" };
    }

    const turnoActualizado = await prisma.turno.update({
      where: { id },
      data: {
        servicioId,
        barberoId,
        horarioReservado: horario,
        estado,
        // Actualizar precios solo si cambió el servicio
        precioCongelado: servicio.precio,
        seniaCongelada: servicio.senia,
      },
    });

    revalidatePath("/turno");

    return {
      success: true,
      data: turnoActualizado,
    };
  } catch (error) {
    console.error("Error al actualizar turno:", error);
    return {
      success: false,
      error: "Error al actualizar el turno",
    };
  }
}

/* =========================
   OBTENER HORARIOS DISPONIBLES
========================= */

/* =========================
   OBTENER HORARIOS DISPONIBLES
========================= */

export async function obtenerHorariosDisponibles(
  fecha: string,
  servicioId: string,
  barberoId: string,
  turnoIdAExcluir?: string
): Promise<ActionState> {
  try {
    console.log("==========================================");
    console.log("🔍 INICIO - Buscar horarios disponibles");
    console.log("📅 Fecha:", fecha);
    console.log("💈 BarberoId:", barberoId);
    console.log("✂️ ServicioId:", servicioId);
    console.log("==========================================");

    if (!servicioId || !fecha || !barberoId) {
      return {
        success: false,
        error: "Faltan parámetros requeridos",
      };
    }

    // 1. Obtener servicio
    const servicio = await prisma.servicio.findUnique({
      where: { id: servicioId },
      select: {
        id: true,
        nombre: true,
        duracion: true,
      },
    });

    console.log("🔧 Servicio encontrado:", servicio);

    if (!servicio || !servicio.duracion) {
      return {
        success: false,
        error: "Servicio no encontrado o sin duración",
      };
    }

    // 2. Parsear fecha
    const fechaBase = new Date(fecha + "T00:00:00");
    const diaSemana = fechaBase.getDay();

    console.log("📆 Fecha parseada:", fechaBase);
    console.log("📆 Día de la semana:", diaSemana, ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][diaSemana]);

    // 3. Buscar horarios del barbero para ese día
    const horariosBarbero = await prisma.margen_laboral_barbero.findMany({
      where: {
        barberoId: barberoId,
        estado: true,
      },
      include: {
        margenLaboral: {
          include: {
            dia: true,
          },
        },
      },
    });

    console.log("📋 Total horarios del barbero:", horariosBarbero.length);

    // Filtrar por día
    const horariosDia = horariosBarbero.filter(
      (h) => h.margenLaboral.dia.dia === diaSemana && h.margenLaboral.estado === true
    );

    console.log("📋 Horarios para este día:", horariosDia.length);

    if (horariosDia.length === 0) {
      return {
        success: false,
        error: `El barbero no trabaja los ${["domingos", "lunes", "martes", "miércoles", "jueves", "viernes", "sábados"][diaSemana]}`,
      };
    }

    // 4. Obtener turnos reservados
    const inicioDia = new Date(
      fechaBase.getFullYear(),
      fechaBase.getMonth(),
      fechaBase.getDate(),
      0, 0, 0
    );

    const finDia = new Date(
      fechaBase.getFullYear(),
      fechaBase.getMonth(),
      fechaBase.getDate(),
      23, 59, 59
    );

    const turnosReservados = await prisma.turno.findMany({
      where: {
        barberoId: barberoId,
        horarioReservado: {
          gte: inicioDia,
          lte: finDia,
        },
        estado: {
          notIn: ["CANCELADO"],
        },
        ...(turnoIdAExcluir && { id: { not: turnoIdAExcluir } }),
      },
      include: {
        servicio: {
          select: { duracion: true },
        },
      },
    });

    console.log("📋 Turnos reservados:", turnosReservados.length);

    // 5. Generar slots disponibles
    const slotsDisponibles: string[] = [];

    for (const horario of horariosDia) {
      const margen = horario.margenLaboral;

      console.log("⏰ Procesando rango:", margen.desde, "-", margen.hasta);

      const [horaInicio, minInicio] = margen.desde.split(":").map(Number);
      const [horaFin, minFin] = margen.hasta.split(":").map(Number);

      let horaActual = horaInicio * 60 + minInicio;
      const horaLimite = horaFin * 60 + minFin;

      while (horaActual + servicio.duracion <= horaLimite) {
        const hora = Math.floor(horaActual / 60);
        const min = horaActual % 60;

        const slotDateTime = new Date(
          fechaBase.getFullYear(),
          fechaBase.getMonth(),
          fechaBase.getDate(),
          hora,
          min,
          0
        );

        // Verificar si está ocupado
        const estaOcupado = turnosReservados.some((turno) => {
          const inicioTurno = new Date(turno.horarioReservado);
          const finTurno = addMinutes(inicioTurno, turno.servicio.duracion);

          const inicioSlot = slotDateTime;
          const finSlot = addMinutes(slotDateTime, servicio.duracion);

          return (
            (inicioSlot >= inicioTurno && inicioSlot < finTurno) ||
            (finSlot > inicioTurno && finSlot <= finTurno) ||
            (inicioSlot <= inicioTurno && finSlot >= finTurno)
          );
        });

        if (!estaOcupado) {
          slotsDisponibles.push(slotDateTime.toISOString());
        }

        horaActual += 30; // Slots cada 30 minutos
      }
    }

    console.log("==========================================");
    console.log("✅ TOTAL SLOTS DISPONIBLES:", slotsDisponibles.length);
    console.log("📋 Slots:", slotsDisponibles.map((s) => new Date(s).toLocaleTimeString("es-AR")));
    console.log("==========================================");

    return {
      success: true,
      data: slotsDisponibles,
    };
  } catch (error) {
    console.error("❌ Error obteniendo horarios:", error);
    return {
      success: false,
      error: "Error al obtener horarios disponibles",
    };
  }
}
/* =========================
   COMPLETAR TURNO
========================= */

export async function completedTurno(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      return { success: false, error: "ID inválido" };
    }

    const turno = await prisma.turno.update({
      where: { id },
      data: { estado: "COMPLETADO" },
    });

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
export async function deleteTurno(
  prevState: any,
  formData: FormData
) {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      return { success: false, error: "ID inválido" };
    }

    await prisma.turno.delete({
      where: { id },
    });

    revalidatePath("/admin");
    revalidatePath("/turno");

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al eliminar turno" };
  }
}
