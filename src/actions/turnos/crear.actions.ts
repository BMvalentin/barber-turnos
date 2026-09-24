"use server";

import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { enviarEmailTurnoSeguro } from "@/lib/email/enviar-email-turno-seguro";
import { enviarEmailTurnoBarberoSeguro } from "@/lib/email/enviar-email-turno-barbero-seguro";
import { serializarTurnoConDetalle } from "@/lib/serializar-turno-con-detalle";
import { crearTurnoEnTransaccion } from "@/lib/crear-turno-transaccion";
import { revalidarDisponibilidadTurno } from "@/lib/turnos/revalidar-disponibilidad-turno";
import { MINIMO_ANTICIPACION_MS, ESTADOS_TURNO, ESTADOS_PAGO, ESTADOS_PAGO_MANUALES } from "@/lib/constants";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import type { ActionState } from "@/types/action-state";
import type { TurnoConDetalle } from "@/types/turno";

export async function createTurno(
  prevState: ActionState<TurnoConDetalle>,
  formData: FormData,
): Promise<ActionState<TurnoConDetalle>> {
  try {
    const session = await requerirSesion();
    if (!session?.user) return { success: false, error: "Iniciá sesión para reservar un turno" };
    const contextoPanel = await requerirPanel();
    // Para clientes normales el rol firmado del JWT alcanza para descartar
    // privilegios. Un supuesto admin siempre se confirma contra la BD.
    const usuarioEsAdmin = contextoPanel?.rol === "ADMIN" && Boolean(await requerirAdmin());
    const usuarioEsEmpleado = contextoPanel?.rol === "EMPLEADO";
    const puedeGestionarTurnos = usuarioEsAdmin || usuarioEsEmpleado;
    const estadoPagoRaw = formData.get("estadoPago");
    const servicioId = formData.get("servicioId");
    const userId = puedeGestionarTurnos ? formData.get("userId") : session.user.id;
    const barberoId = formData.get("barberoId");
    const horarioStr = formData.get("horarioReservado");
    if (
      typeof servicioId !== "string" || !servicioId ||
      typeof userId !== "string" || !userId ||
      typeof barberoId !== "string" || !barberoId ||
      typeof horarioStr !== "string" || !horarioStr
    ) {
      return { success: false, error: "Datos incompletos" };
    }
    if (usuarioEsEmpleado && contextoPanel?.barberoId !== barberoId) {
      return { success: false, error: "Solo podés crear turnos para tu propia agenda" };
    }
    if (!puedeGestionarTurnos) {
      const usuario = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { telefono: true },
      });
      if (!usuario?.telefono?.trim()) {
        return { success: false, error: "Completá tu teléfono en tu perfil antes de reservar un turno" };
      }
    }
    const inicio = new Date(horarioStr);
    if (isNaN(inicio.getTime())) return { success: false, error: "Fecha inválida" };
    const ahora = new Date();
    if (inicio.getTime() <= ahora.getTime() + MINIMO_ANTICIPACION_MS) {
      return { success: false, error: "Reservá con 10 minutos de anticipación" };
    }
    const estadoPago = puedeGestionarTurnos &&
      typeof estadoPagoRaw === "string" &&
      (ESTADOS_PAGO_MANUALES as readonly string[]).includes(estadoPagoRaw)
        ? (estadoPagoRaw as (typeof ESTADOS_PAGO_MANUALES)[number])
        : ESTADOS_PAGO[0];
    const estadoFinal = estadoPago === ESTADOS_PAGO[1] || estadoPago === ESTADOS_PAGO[2] ? ESTADOS_TURNO[1] : ESTADOS_TURNO[0];
    const resultado = await crearTurnoEnTransaccion({
      servicioId,
      userId,
      barberoId,
      idUsuarioActual: session.user.id,
      inicio,
      estadoPago,
      estadoFinal,
      confirmarSinSeña: !puedeGestionarTurnos,
    });
    if (!resultado.ok) return { success: false, error: resultado.error };
    const turno = resultado.turno;
    revalidarDisponibilidadTurno(barberoId, obtenerFechaSola(inicio), userId);
    after(async () => {
      const tareas: Promise<unknown>[] = [
        prisma.slotLock.deleteMany({ where: { userId, barberoId, horarioReservado: inicio } }),
      ];
      if (resultado.creado && turno.estado === ESTADOS_TURNO[1]) {
        tareas.push(
          enviarEmailTurnoSeguro(turno, "CONFIRMADO"),
          enviarEmailTurnoBarberoSeguro(turno, "CONFIRMADO"),
        );
      }
      const resultados = await Promise.allSettled(tareas);
      for (const resultadoTarea of resultados) {
        if (resultadoTarea.status === "rejected") {
          console.error(
            "Error en tarea posterior a la creación del turno:",
            resultadoTarea.reason,
          );
        }
      }
    });
    return { success: true, data: serializarTurnoConDetalle(turno) };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al crear turno" };
  }
}
