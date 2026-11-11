import { prisma } from "@/lib/prisma";
import { interpretarErrorTurno } from "@/lib/interpretar-error-turno";
import { INCLUDE_TURNO_CON_DETALLE } from "@/lib/turno-con-detalle";
import { ejecutarConBloqueReserva } from "@/lib/turnos/ejecutar-con-bloque-reserva";
import { validarReservaEnTransaccion } from "@/lib/turnos/validar-reserva-en-transaccion";
import { ESTADOS_TURNO } from "@/lib/constants";
import { Prisma, type estado_pago, type turno_estado } from "../../../generated/prisma/client";

type ParametrosActualizarTurno = {
  id: string;
  servicioId: string;
  barberoId: string;
  horario: Date;
  estado: turno_estado;
  estadoPago: estado_pago;
  idUsuarioActual: string;
};

type TurnoActualizado = Prisma.turnoGetPayload<{
  include: typeof INCLUDE_TURNO_CON_DETALLE;
}>;

type ResultadoActualizarTurno =
  | { ok: true; turno: TurnoActualizado; turnoAnterior: TurnoActualizado }
  | { ok: false; error: string };

function esEstadoActivo(estado: turno_estado): boolean {
  return estado === ESTADOS_TURNO[0] || estado === ESTADOS_TURNO[1];
}

function crearClaveSlot(barberoId: string, horario: Date): string {
  return `${barberoId}|${horario.toISOString()}`;
}

/** Reprograma con validación e intervalos serializados por agenda diaria. */
export async function actualizarTurnoEnTransaccion(
  parametros: ParametrosActualizarTurno,
): Promise<ResultadoActualizarTurno> {
  try {
    const referenciaInicial = await prisma.turno.findUnique({
      where: { id: parametros.id },
      select: { barberoId: true },
    });
    if (!referenciaInicial) return { ok: false, error: "Turno no encontrado" };

    const bloqueos = [
      { barberoId: referenciaInicial.barberoId },
      { barberoId: parametros.barberoId },
    ].sort((primero, segundo) => {
      return primero.barberoId.localeCompare(segundo.barberoId);
    });

    const resultado = await prisma.$transaction(async (tx) => {
      const actualizar = async (): Promise<{ turno: TurnoActualizado; turnoAnterior: TurnoActualizado }> => {
        const turnoAnterior = await tx.turno.findUnique({
          where: { id: parametros.id },
          include: INCLUDE_TURNO_CON_DETALLE,
        });
        if (!turnoAnterior) throw new Error("TURNO_INEXISTENTE");

        const debeValidarReserva = esEstadoActivo(parametros.estado);
        const servicio = debeValidarReserva
          ? await validarReservaEnTransaccion(tx, {
              servicioId: parametros.servicioId,
              barberoId: parametros.barberoId,
              userId: turnoAnterior.userId,
              inicio: parametros.horario,
              idUsuarioActual: parametros.idUsuarioActual,
              turnoIdAExcluir: parametros.id,
            })
          : null;

        const datosActualizacion = {
          servicioId: parametros.servicioId,
          barberoId: parametros.barberoId,
          horarioReservado: parametros.horario,
          estado: parametros.estado,
          estadoPago: parametros.estadoPago,
          /* Solo se re-congelan los importes cuando cambia el servicio; si el
             admin solo edita estado/pago se preservan los importes históricos. */
          ...(servicio && turnoAnterior.servicioId !== parametros.servicioId
            ? { precioCongelado: servicio.precio, seniaCongelada: servicio.senia }
            : {}),
          claveSlot: esEstadoActivo(parametros.estado)
            ? crearClaveSlot(parametros.barberoId, parametros.horario)
            : null,
        };

        let turno: TurnoActualizado | null;
        if (
          parametros.estado === ESTADOS_TURNO[3] &&
          turnoAnterior.estado !== ESTADOS_TURNO[3]
        ) {
          const actualizacion = await tx.turno.updateMany({
            where: {
              id: parametros.id,
              estado: turnoAnterior.estado,
            },
            data: datosActualizacion,
          });
          if (actualizacion.count !== 1) throw new Error("CANCELACION_NO_DISPONIBLE");
          turno = await tx.turno.findUnique({
            where: { id: parametros.id },
            include: INCLUDE_TURNO_CON_DETALLE,
          });
        } else {
          turno = await tx.turno.update({
            where: { id: parametros.id },
            data: datosActualizacion,
            include: INCLUDE_TURNO_CON_DETALLE,
          });
        }
        if (!turno) throw new Error("TURNO_INEXISTENTE");

        return { turno, turnoAnterior };
      };

      const ejecutarSegundoBloque = async () => {
        if (bloqueos.length === 1 || (
          bloqueos[0].barberoId === bloqueos[1].barberoId
        )) {
          return actualizar();
        }
        return ejecutarConBloqueReserva(
          tx,
          bloqueos[1].barberoId,
          actualizar,
        );
      };

      return ejecutarConBloqueReserva(
        tx,
        bloqueos[0].barberoId,
        ejecutarSegundoBloque,
      );
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
      maxWait: 10000,
      timeout: 15000,
    });

    return { ok: true, ...resultado };
  } catch (error) {
    const mensaje = interpretarErrorTurno(error);
    if (mensaje) return { ok: false, error: mensaje };
    if (error instanceof Error && error.message === "CANCELACION_NO_DISPONIBLE") {
      return { ok: false, error: "El turno ya fue cancelado o dejó de estar disponible" };
    }
    if (error instanceof Error && error.message === "TURNO_INEXISTENTE") {
      return { ok: false, error: "Turno no encontrado" };
    }
    console.error(error);
    return { ok: false, error: "Error al actualizar el turno" };
  }
}
