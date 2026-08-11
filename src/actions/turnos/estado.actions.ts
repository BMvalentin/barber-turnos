"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { toZonedTime } from "date-fns-tz";
import { requerirAdmin } from "@/lib/seguridad";
import { enviarEmailTurno } from "@/lib/email";
import { existeLockAjeno } from "@/lib/locks";
import { revalidarCacheTurno } from "@/lib/revalidar-turno";
import { actualizarTurnoConDetalle } from "@/lib/turno-con-detalle";
import { obtenerHorariosDisponibles } from "@/actions/turnos/horarios-disponibles.actions";
import type { ActionState } from "@/types/action-state";
import type { TurnoConDetalle } from "@/types/turno";
import type { Prisma, turno_estado } from "../../../generated/prisma/client";

const TIMEZONE = "America/Argentina/Buenos_Aires";

export async function actualizarTurno(
  prevState: ActionState<TurnoConDetalle>,
  formData: FormData,
): Promise<ActionState<TurnoConDetalle>> {
  try {
    const id = formData.get("id") as string;
    if (!id) return { success: false, error: "ID de turno no proporcionado" };
    const sesion = await requerirAdmin();
    if (!sesion) return { success: false, error: "No autorizado" };

    const rawEstado = formData.get("estado") as string;
    const rawServicioId = formData.get("servicioId") as string;
    const rawBarberoId = formData.get("barberoId") as string;
    const rawHorarioStr = formData.get("horarioReservado") as string;
    const turnoActual = await prisma.turno.findUnique({ where: { id } });
    if (!turnoActual) return { success: false, error: "Turno no encontrado" };

    const servicioId = rawServicioId || turnoActual.servicioId;
    const barberoId = rawBarberoId || turnoActual.barberoId;
    const horarioStr = rawHorarioStr || turnoActual.horarioReservado.toISOString();
    const estado = (rawEstado as turno_estado) || turnoActual.estado;
    const horario = new Date(horarioStr);
    const cambioFecha = horario.getTime() !== turnoActual.horarioReservado.getTime();
    const cambioBarbero = barberoId !== turnoActual.barberoId;
    const cambioServicio = servicioId !== turnoActual.servicioId;

    if (cambioFecha || cambioBarbero || cambioServicio) {
      if (cambioFecha && horario.getTime() <= new Date().getTime() + 10 * 60 * 1000) {
        return { success: false, error: "El nuevo horario debe ser con al menos 10 minutos de anticipación" };
      }

      const servicio = await prisma.servicio.findUnique({ where: { id: servicioId } });
      if (!servicio) return { success: false, error: "Servicio no encontrado" };
      const fecha = toZonedTime(horario, TIMEZONE).toISOString().split("T")[0];
      const horariosDisponibles = await obtenerHorariosDisponibles(fecha, servicioId, barberoId, id);
      if (!horariosDisponibles.success || !horariosDisponibles.data?.includes(horario.toISOString())) {
        return { success: false, error: "El horario seleccionado no está disponible para este barbero/servicio" };
      }

      if (await existeLockAjeno(barberoId, horario, turnoActual.userId)) {
        return { success: false, error: "Este horario está siendo seleccionado por otro usuario. Intentá con otro horario." };
      }
      const dataUpdate: Prisma.turnoUncheckedUpdateInput = { servicioId, barberoId, horarioReservado: horario, estado, ...(cambioServicio ? { precioCongelado: servicio.precio, seniaCongelada: servicio.senia } : {}) };

      const turnoActualizado = await actualizarTurnoConDetalle(id, dataUpdate);
      const fechaAnterior = toZonedTime(turnoActual.horarioReservado, TIMEZONE).toISOString().split("T")[0];
      revalidarCacheTurno(turnoActual.barberoId, fechaAnterior);
      revalidarCacheTurno(barberoId, fecha);
      revalidateTag(`turnos-mes-${barberoId}-${fecha.substring(0, 7)}`);
      revalidateTag(`turnos-user-${turnoActual.userId}`);
      void enviarEmailTurno(turnoActualizado, turnoActualizado.estado === "CANCELADO" ? "CANCELADO" : "ACTUALIZADO").catch((error) => console.error("Error enviando email de actualización:", error));

      return {
        success: true,
        data: {
          ...turnoActualizado,
          precioCongelado: Number(turnoActualizado.precioCongelado),
          seniaCongelada: Number(turnoActualizado.seniaCongelada),
        },
      };
    } else {
      const turnoActualizado = await actualizarTurnoConDetalle(id, { estado });

      revalidateTag("turnos-global");
      revalidateTag(`turnos-user-${turnoActual.userId}`);
      revalidatePath("/turno");
      revalidatePath("/admin");
      void enviarEmailTurno(turnoActualizado, turnoActualizado.estado === "CANCELADO" ? "CANCELADO" : "ACTUALIZADO").catch((error) => console.error("Error enviando email de estado:", error));

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