"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { addMinutes } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { auth } from "@/auth";
import { MAP_DIA_SEMANA, REVERSE_MAP_DIA_SEMANA } from "@/lib/constants";
import { sendTurnoEmail } from "@/lib/email";

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

    // --- LÓGICA DE ZONA HORARIA ARGENTINA ---
    const zonedInicio = toZonedTime(inicio, TIMEZONE);
    const diaSemana = zonedInicio.getDay();

    // Obtener límites del día en Argentina para la consulta de Prisma
    const fechaSolo = toZonedTime(inicio, TIMEZONE).toISOString().split("T")[0];
    const inicioDia = fromZonedTime(`${fechaSolo}T00:00:00`, TIMEZONE);
    const finDia = fromZonedTime(`${fechaSolo}T23:59:59`, TIMEZONE);

    const [diaLaboral, excepciones, turnosDelDia] = await Promise.all([
      prisma.dia_laboral.findFirst({
        where: { dia: MAP_DIA_SEMANA[diaSemana] as any, estado: true },
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
          estado: { in: ["PENDIENTE", "CONFIRMADO"] },
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

    const minInicio = zonedInicio.getHours() * 60 + zonedInicio.getMinutes();
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
        t.servicio.duracion,
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
      include: {
        user: true,
        barbero: true,
        servicio: true,
      },
    });

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
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "No autorizado" };
    }

    const whereClause = session.user.role === "ADMIN" ? {} : { userId: session.user.id };

    const turnos = await prisma.turno.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
        servicio: { select: { id: true, nombre: true, duracion: true } },
        barbero: { select: { id: true, nombre: true } },
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
  formData: FormData,
): Promise<ActionState> {
  try {
    const id = formData.get("id") as string;
    if (!id) return { success: false, error: "ID de turno no proporcionado" };

    const rawEstado = formData.get("estado") as string;
    const rawServicioId = formData.get("servicioId") as string;
    const rawBarberoId = formData.get("barberoId") as string;
    const rawHorarioStr = formData.get("horarioReservado") as string;

    // 1. Obtener el turno actual para tener los valores por defecto
    const turnoActual = await prisma.turno.findUnique({
      where: { id },
    });

    if (!turnoActual) {
      return { success: false, error: "Turno no encontrado" };
    }

    // 2. Determinar valores finales (usar los del form o mantener los actuales)
    const servicioId = rawServicioId || turnoActual.servicioId;
    const barberoId = rawBarberoId || turnoActual.barberoId;
    const horarioStr = rawHorarioStr || turnoActual.horarioReservado.toISOString();
    const estado = (rawEstado as any) || turnoActual.estado;

    const horario = new Date(horarioStr);

    // 3. Verificamos si cambió algo que afecte la disponibilidad (Agenda)
    const cambioFecha = horario.getTime() !== turnoActual.horarioReservado.getTime();
    const cambioBarbero = barberoId !== turnoActual.barberoId;
    const cambioServicio = servicioId !== turnoActual.servicioId;

    if (cambioFecha || cambioBarbero || cambioServicio) {
      if (cambioFecha) {
        const ahora = new Date();
        if (horario.getTime() <= ahora.getTime() + 10 * 60 * 1000) {
          return {
            success: false,
            error: "El nuevo horario debe ser con al menos 10 minutos de anticipación",
          };
        }
      }
      // Obtener el servicio (necesario para la validación y para actualizar precios si cambió)
      const servicio = await prisma.servicio.findUnique({
        where: { id: servicioId },
      });

      if (!servicio) {
        return { success: false, error: "Servicio no encontrado" };
      }

      // Verificar disponibilidad del nuevo horario
      const fecha = toZonedTime(horario, TIMEZONE).toISOString().split("T")[0];
      const horariosDisponibles = await obtenerHorariosDisponibles(
        fecha,
        servicioId,
        barberoId,
        id, // Excluir el turno actual
      );

      if (
        !horariosDisponibles.success ||
        !horariosDisponibles.data?.includes(horario.toISOString())
      ) {
        return {
          success: false,
          error: "El horario seleccionado no está disponible para este barbero/servicio",
        };
      }

      // Si cambió el servicio, actualizamos también los precios congelados
      const dataUpdate: any = {
        servicioId,
        barberoId,
        horarioReservado: horario,
        estado,
      };

      if (cambioServicio) {
        dataUpdate.precioCongelado = servicio.precio;
        dataUpdate.seniaCongelada = servicio.senia;
      }

      const turnoActualizado = await prisma.turno.update({
        where: { id },
        data: dataUpdate,
        include: { user: true, barbero: true, servicio: true },
      });

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

      revalidatePath("/turno");
      revalidatePath("/admin");

      return {
        success: true,
        data: {
          ...turnoActualizado,
          precioCongelado: Number(turnoActualizado.precioCongelado),
          seniaCongelada: Number(turnoActualizado.seniaCongelada),
        },
      };
    } else {
      // 4. Si NO cambió la agenda, solo actualizamos el estado u otros campos menores
      const turnoActualizado = await prisma.turno.update({
        where: { id },
        data: { estado },
        include: { user: true, barbero: true, servicio: true },
      });

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

      revalidatePath("/turno");
      revalidatePath("/admin");

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
    return {
      success: false,
      error: "Error al actualizar el turno",
    };
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
  try {
    console.log("==========================================");
    console.log("🔍 INICIO - Buscar horarios disponibles");
    console.log("📅 Fecha:", fecha);
    console.log("💈 BarberoId:", barberoId);
    console.log("✂️ ServicioId:", servicioId);
    console.log("==========================================");

    if (!servicioId || !fecha || !barberoId) {
      return { success: false, error: "Faltan parámetros requeridos" };
    }

    // 1. Interpretar la fecha como las 00:00 de Argentina
    const inicioDia = fromZonedTime(`${fecha}T00:00:00`, TIMEZONE);
    const finDia = fromZonedTime(`${fecha}T23:59:59`, TIMEZONE);
    
    // Obtener el día de la semana en Argentina
    const diaSemana = toZonedTime(inicioDia, TIMEZONE).getDay();
    const diaEnum = MAP_DIA_SEMANA[diaSemana];

    // 2. Obtener servicio y márgenes del barbero en paralelo
    const [servicio, horariosBarbero] = await Promise.all([
      prisma.servicio.findUnique({
        where: { id: servicioId },
        select: { id: true, nombre: true, duracion: true }
      }),
      prisma.margen_laboral_barbero.findMany({
        where: { barberoId, estado: true },
        include: { margenLaboral: { include: { dia: true } } },
      }),
    ]);

    // 3. Validar hallazgos
    if (!servicio || !servicio.duracion) {
      return { success: false, error: "Servicio no encontrado o sin duración" };
    }

    const horariosDia = horariosBarbero.filter(
      (h) =>
        (h.margenLaboral.dia.dia as string) === diaEnum &&
        h.margenLaboral.estado === true,
    );

    if (horariosDia.length === 0) {
      return {
        success: false,
        error: `El barbero no trabaja los ${["domingos", "lunes", "martes", "miércoles", "jueves", "viernes", "sábados"][diaSemana]}`,
      };
    }

    // 3. Obtener turnos reservados
    const turnosReservados = await prisma.turno.findMany({
      where: {
        barberoId: barberoId,
        horarioReservado: { gte: inicioDia, lte: finDia },
        estado: { notIn: ["CANCELADO"] },
        ...(turnoIdAExcluir && { id: { not: turnoIdAExcluir } }),
      },
      include: { servicio: { select: { duracion: true } } },
    });

    // 4. Generar slots
    const slotsDisponibles: string[] = [];

    for (const horario of horariosDia) {
      const { desde, hasta } = horario.margenLaboral;
      const [hInicio, mInicio] = desde.split(":").map(Number);
      const [hFin, mFin] = hasta.split(":").map(Number);

      let actualMinutos = hInicio * 60 + mInicio;
      const limiteMinutos = hFin * 60 + mFin;

      while (actualMinutos + servicio.duracion <= limiteMinutos) {
        const hora = Math.floor(actualMinutos / 60);
        const min = actualMinutos % 60;

        // Crear el slot como una fecha en Argentina y convertir a UTC
        const slotUTC = fromZonedTime(
          `${fecha}T${hora.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:00`,
          TIMEZONE,
        );

        // Verificar ocupación
        const estaOcupado = turnosReservados.some((turno) => {
          const inicioT = new Date(turno.horarioReservado);
          const finT = addMinutes(inicioT, turno.servicio.duracion);
          const finS = addMinutes(slotUTC, servicio.duracion);
          return slotUTC < finT && finS > inicioT;
        });

        // Verificar si el slot ya pasó (más un margen de 10 minutos)
        const ahora = new Date();
        const esPasado = slotUTC.getTime() <= ahora.getTime() + 10 * 60 * 1000;

        if (!estaOcupado && !esPasado) {
          slotsDisponibles.push(slotUTC.toISOString());
        }

        actualMinutos += 30; // Slots cada 30 min
      }
    }

    return { success: true, data: slotsDisponibles };
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
  formData: FormData,
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
export async function deleteTurno(prevState: any, formData: FormData) {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      return { success: false, error: "ID inválido" };
    }

    const turnoToDelete = await prisma.turno.findUnique({
      where: { id },
      include: { user: true, barbero: true, servicio: true },
    });

    if (!turnoToDelete) {
      return { success: false, error: "Turno no encontrado" };
    }

    await prisma.turno.delete({
      where: { id },
    });

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

    revalidatePath("/admin");
    revalidatePath("/turno");

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al eliminar turno" };
  }
}
