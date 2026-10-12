import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma/client";
import { INCLUDE_TURNO_CON_DETALLE } from "@/lib/turno-con-detalle";
import { interpretarErrorTurno } from "@/lib/interpretar-error-turno";
import { ESTADOS_TURNO, ESTADOS_PAGO, MINIMO_ANTICIPACION_MS } from "@/lib/constants";
import { ejecutarConBloqueReserva } from "@/lib/turnos/ejecutar-con-bloque-reserva";
import { validarReservaEnTransaccion } from "@/lib/turnos/validar-reserva-en-transaccion";
import { obtenerTurnoDuplicado } from "@/lib/consultas/obtener-turno-duplicado";
import { randomUUID } from "node:crypto";

type TurnoConDetalleCrudo = Prisma.turnoGetPayload<{
  include: typeof INCLUDE_TURNO_CON_DETALLE;
}>;

export type ResultadoCrearTurno =
  | { ok: true; turno: TurnoConDetalleCrudo; creado: boolean }
  | { ok: false; error: string };

export interface ParametrosCrearTurno {
  servicioId: string;
  userId: string | null;
  clienteNuevo?: {
    nombre: string;
    apellido: string;
    telefono: string | null;
    email: string | null;
  };
  barberoId: string;
  idUsuarioActual: string;
  inicio: Date;
  estadoPago: (typeof ESTADOS_PAGO)[number];
  estadoFinal: (typeof ESTADOS_TURNO)[number];
  confirmarSinSeña?: boolean;
}

async function obtenerCuentaVerificada(tx: Prisma.TransactionClient, email: string) {
  const cuenta = await tx.user.findUnique({
    where: { email },
    select: { id: true, esInvitado: true, emailVerified: true, role: true },
  });
  return cuenta && !cuenta.esInvitado && cuenta.emailVerified && cuenta.role === "USER"
    ? cuenta.id
    : null;
}

/**
 * Re-valida disponibilidad y crea dentro de una transacción. Un bloqueo de fila
 * de MariaDB serializa por barbero y protege solapes de intervalos distintos.
 */
export async function crearTurnoEnTransaccion(
  p: ParametrosCrearTurno,
): Promise<ResultadoCrearTurno> {
  try {
    const resultadoTransaccion = await prisma.$transaction(
      async (tx) => {
        return ejecutarConBloqueReserva(tx, p.barberoId, async () => {
          let userId = p.userId;
          let datosClienteTurno: {
            clienteNombre: string;
            clienteApellido: string | null;
            clienteTelefono: string | null;
            clienteEmail: string | null;
          } | null = null;
          if (p.clienteNuevo) {
            datosClienteTurno = {
              clienteNombre: p.clienteNuevo.nombre,
              clienteApellido: p.clienteNuevo.apellido,
              clienteTelefono: p.clienteNuevo.telefono,
              clienteEmail: p.clienteNuevo.email,
            };
            const cuentaExistenteId = p.clienteNuevo.email
              ? await obtenerCuentaVerificada(tx, p.clienteNuevo.email)
              : null;
            if (cuentaExistenteId) {
              userId = cuentaExistenteId;
            } else {
              const datosCliente = {
                name: `${p.clienteNuevo.nombre} ${p.clienteNuevo.apellido}`,
                telefono: p.clienteNuevo.telefono,
              };
              const invitado = p.clienteNuevo.email
                ? await tx.user.upsert({
                    where: { emailContacto: p.clienteNuevo.email },
                    create: {
                      ...datosCliente,
                      email: `cliente-${randomUUID()}@clientes.invalid`,
                      emailContacto: p.clienteNuevo.email,
                      esInvitado: true,
                    },
                    update: {
                      name: datosCliente.name,
                      ...(datosCliente.telefono ? { telefono: datosCliente.telefono } : {}),
                    },
                    select: { id: true },
                  })
                : await tx.user.create({
                    data: {
                      ...datosCliente,
                      email: `cliente-${randomUUID()}@clientes.invalid`,
                      esInvitado: true,
                    },
                    select: { id: true },
                  });
              userId = invitado.id;
            }
          } else if (userId) {
            const seleccionado = await tx.user.findUnique({
              where: { id: userId },
              select: { esInvitado: true, name: true, telefono: true, emailContacto: true },
            });
            if (seleccionado?.esInvitado) {
              datosClienteTurno = {
                clienteNombre: seleccionado.name ?? "Cliente",
                clienteApellido: null,
                clienteTelefono: seleccionado.telefono,
                clienteEmail: seleccionado.emailContacto,
              };
              if (seleccionado.emailContacto) {
                userId = await obtenerCuentaVerificada(tx, seleccionado.emailContacto) ?? userId;
              }
            }
          }
          if (!userId) throw new Error("CLIENTE_NO_SELECCIONADO");
          const reserva = await validarReservaEnTransaccion(tx, {
            servicioId: p.servicioId,
            barberoId: p.barberoId,
            userId,
            inicio: p.inicio,
            idUsuarioActual: p.idUsuarioActual,
          });

          const turno = await tx.turno.create({
            data: {
              servicioId: p.servicioId,
              userId,
              ...(datosClienteTurno ?? {}),
              barberoId: p.barberoId,
              horarioReservado: p.inicio,
              precioCongelado: reserva.precio,
              seniaCongelada: reserva.senia,
              estado: p.confirmarSinSeña && reserva.senia.toNumber() <= 0
                ? ESTADOS_TURNO[1]
                : p.estadoFinal,
              estadoPago: p.confirmarSinSeña && reserva.senia.toNumber() <= 0
                ? ESTADOS_PAGO[3]
                : p.estadoPago,
              claveSlot: `${p.barberoId}|${p.inicio.toISOString()}`,
            },
          });

          return { turno, reserva };
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        maxWait: 10000,
        timeout: 15000,
      },
    );
    const turno: TurnoConDetalleCrudo = {
      ...resultadoTransaccion.turno,
      user: resultadoTransaccion.reserva.user,
      barbero: resultadoTransaccion.reserva.barbero,
      servicio: resultadoTransaccion.reserva.servicio,
    };
    return { ok: true, turno, creado: true };
  } catch (error) {
    const mensaje = interpretarErrorTurno(error);
    if (mensaje === "Horario ocupado" && p.userId) {
      const turnoDuplicado = await obtenerTurnoDuplicado({
        userId: p.userId,
        barberoId: p.barberoId,
        horarioReservado: p.inicio,
      });
      if (turnoDuplicado) return { ok: true, turno: turnoDuplicado, creado: false };
    }
    if (mensaje === "Horario ocupado" && p.clienteNuevo) {
      const turnoDuplicado = await prisma.turno.findFirst({
        where: {
          barberoId: p.barberoId,
          servicioId: p.servicioId,
          horarioReservado: p.inicio,
          clienteNombre: p.clienteNuevo.nombre,
          clienteApellido: p.clienteNuevo.apellido,
          clienteTelefono: p.clienteNuevo.telefono,
          clienteEmail: p.clienteNuevo.email,
          estado: { in: [ESTADOS_TURNO[0], ESTADOS_TURNO[1]] },
          createdAt: { gte: new Date(Date.now() - MINIMO_ANTICIPACION_MS) },
        },
        include: INCLUDE_TURNO_CON_DETALLE,
      });
      if (turnoDuplicado) return { ok: true, turno: turnoDuplicado, creado: false };
    }
    if (mensaje) return { ok: false, error: mensaje };
    console.error("Error en la transacción del turno:", error instanceof Error ? error.name : "desconocido");
    return { ok: false, error: "Error al crear turno" };
  }
}
