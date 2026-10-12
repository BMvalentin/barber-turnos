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
import { z } from "zod";

const esquemaClienteNuevo = z.object({
  nombre: z.string().trim().min(1).max(95),
  apellido: z.string().trim().min(1).max(95),
  telefono: z.string().trim().max(40).refine((telefono) =>
    !telefono || (/^\+?[0-9\s().-]+$/.test(telefono) && telefono.replace(/\D/g, "").length >= 6)
  ),
  email: z.string().trim().max(191).refine((email) => !email || z.email().safeParse(email).success),
});

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
    const clienteNuevoSolicitado = puedeGestionarTurnos && formData.get("userId") === "nuevo";
    const userId = clienteNuevoSolicitado
      ? null
      : puedeGestionarTurnos ? formData.get("userId") : session.user.id;
    const barberoId = formData.get("barberoId");
    const horarioStr = formData.get("horarioReservado");
    if (
      typeof servicioId !== "string" || !servicioId ||
      (!clienteNuevoSolicitado && (typeof userId !== "string" || !userId)) ||
      typeof barberoId !== "string" || !barberoId ||
      typeof horarioStr !== "string" || !horarioStr
    ) {
      return { success: false, error: "Datos incompletos" };
    }
    const datosCliente = clienteNuevoSolicitado
      ? esquemaClienteNuevo.safeParse({
          nombre: formData.get("clienteNombre"),
          apellido: formData.get("clienteApellido"),
          telefono: formData.get("clienteTelefono"),
          email: formData.get("clienteEmail"),
        })
      : null;
    if (datosCliente && !datosCliente.success) {
      return { success: false, error: "Revisá el nombre, apellido, teléfono y correo del cliente" };
    }
    const clienteNuevo = datosCliente?.success
      ? {
          nombre: datosCliente.data.nombre,
          apellido: datosCliente.data.apellido,
          telefono: datosCliente.data.telefono || null,
          email: datosCliente.data.email ? datosCliente.data.email.toLowerCase() : null,
        }
      : undefined;
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
      userId: typeof userId === "string" ? userId : null,
      clienteNuevo,
      barberoId,
      idUsuarioActual: session.user.id,
      inicio,
      estadoPago,
      estadoFinal,
      confirmarSinSeña: !puedeGestionarTurnos,
    });
    if (!resultado.ok) return { success: false, error: resultado.error };
    const turno = resultado.turno;
    revalidarDisponibilidadTurno(barberoId, obtenerFechaSola(inicio), turno.userId);
    after(async () => {
      const tareas: Promise<unknown>[] = [
        prisma.slotLock.deleteMany({
          where: { userId: clienteNuevoSolicitado ? session.user.id : turno.userId, barberoId, horarioReservado: inicio },
        }),
      ];
      if (resultado.creado && turno.estado === ESTADOS_TURNO[1]) {
        tareas.push(
          enviarEmailTurnoSeguro(turno, "CONFIRMADO"),
          enviarEmailTurnoBarberoSeguro(turno, "CONFIRMADO"),
        );
      } else if (resultado.creado && clienteNuevoSolicitado) {
        tareas.push(enviarEmailTurnoSeguro(turno, "CREADO"));
      }
      const resultados = await Promise.allSettled(tareas);
      for (const resultadoTarea of resultados) {
        if (resultadoTarea.status === "rejected") {
          console.error(
            "Error en tarea posterior a la creación del turno:",
            resultadoTarea.reason instanceof Error ? resultadoTarea.reason.name : "desconocido",
          );
        }
      }
    });
    return { success: true, data: serializarTurnoConDetalle(turno) };
  } catch (error) {
    console.error("Error al crear turno:", error instanceof Error ? error.name : "desconocido");
    return { success: false, error: "Error al crear turno" };
  }
}
