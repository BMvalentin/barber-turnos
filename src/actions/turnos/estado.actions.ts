"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { enviarEmailTurnoSeguro } from "@/lib/email/enviar-email-turno-seguro";
import { enviarEmailTurnoBarberoSeguro } from "@/lib/email/enviar-email-turno-barbero-seguro";
import { existeLockAjeno } from "@/lib/locks";
import { revalidarCacheTurno } from "@/lib/revalidar/revalidar-cache-turno";
import { actualizarTurnoConDetalle } from "@/lib/turno-con-detalle";
import { obtenerHorariosDisponibles } from "@/actions/turnos/horarios-disponibles.actions";
import { obtenerServicioPorId } from "@/lib/consultas/obtener-servicio-por-id";
import { MINIMO_ANTICIPACION_MS, ESTADOS_TURNO } from "@/lib/constants";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import type { ActionState } from "@/types/action-state";
import type { TurnoConDetalle } from "@/types/turno";
import type { Prisma, turno_estado } from "../../../generated/prisma/client";

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
      if (cambioFecha && horario.getTime() <= new Date().getTime() + MINIMO_ANTICIPACION_MS) {
        return { success: false, error: "El nuevo horario debe ser con al menos 10 minutos de anticipación" };
      }

      const servicio = await obtenerServicioPorId(servicioId);
      if (!servicio) return { success: false, error: "Servicio no encontrado" };
      const fecha = obtenerFechaSola(horario);
      const horariosDisponibles = await obtenerHorariosDisponibles(fecha, servicioId, barberoId, id);
      if (!horariosDisponibles.success || !horariosDisponibles.data?.includes(horario.toISOString())) {
        return { success: false, error: "El horario seleccionado no está disponible para este barbero/servicio" };
      }

      if (await existeLockAjeno(barberoId, horario, turnoActual.userId)) {
        return { success: false, error: "Este horario está siendo seleccionado por otro usuario. Intentá con otro horario." };
      }
      const dataUpdate: Prisma.turnoUncheckedUpdateInput = { servicioId, barberoId, horarioReservado: horario, estado, ...(cambioServicio ? { precioCongelado: servicio.precio, seniaCongelada: servicio.senia } : {}) };

      const turnoActualizado = await actualizarTurnoConDetalle(id, dataUpdate);
      const fechaAnterior = obtenerFechaSola(turnoActual.horarioReservado);
      revalidarCacheTurno(turnoActual.barberoId, fechaAnterior, turnoActual.userId);
      revalidarCacheTurno(barberoId, fecha, turnoActual.userId);
      enviarEmailTurnoSeguro(turnoActualizado, turnoActualizado.estado === ESTADOS_TURNO[3] ? ESTADOS_TURNO[3] : "ACTUALIZADO");
      if (turnoActualizado.estado === ESTADOS_TURNO[1] && turnoActual.estado !== ESTADOS_TURNO[1]) {
        enviarEmailTurnoBarberoSeguro(turnoActualizado, "CONFIRMADO");
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
      const turnoActualizado = await actualizarTurnoConDetalle(id, { estado });

      revalidateTag("turnos-global");
      revalidateTag(`turnos-user-${turnoActual.userId}`);
      revalidatePath("/turno");
      revalidatePath("/admin");
      enviarEmailTurnoSeguro(turnoActualizado, turnoActualizado.estado === ESTADOS_TURNO[3] ? ESTADOS_TURNO[3] : "ACTUALIZADO");
      if (turnoActualizado.estado === ESTADOS_TURNO[1] && turnoActual.estado !== ESTADOS_TURNO[1]) {
        enviarEmailTurnoBarberoSeguro(turnoActualizado, "CONFIRMADO");
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