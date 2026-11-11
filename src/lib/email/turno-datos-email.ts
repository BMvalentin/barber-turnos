import { toZonedTime } from "date-fns-tz";

const TIMEZONE = "America/Argentina/Buenos_Aires";

export type TipoEstadoEmail = "CREADO" | "ACTUALIZADO" | "CANCELADO" | "CONFIRMADO" | "NUEVA_RESERVA";
export type EstadoTurnoEmail = "PENDIENTE" | "CONFIRMADO" | "CANCELADO" | "COMPLETADO";
export type EstadoPagoEmail = "PENDIENTE" | "SEÑADO" | "PAGADO" | "APROBADO" | "RECHAZADO" | "CANCELADO" | "EN_ACREDITACION";
export type CanceladoPor = "CLIENTE" | "ADMINISTRADOR";

export type DatosEmailTurno = {
  clienteNombre: string;
  clienteTelefono: string;
  servicioNombre: string;
  barberoNombre: string;
  fechaSemana: string;
  fechaHora: string;
  estado: TipoEstadoEmail;
  canceladoPor?: CanceladoPor;
  estadoTurno: EstadoTurnoEmail;
  estadoPago: EstadoPagoEmail;
  metodoPago: string | null;
  tipoPago: string | null;
  precioTotal: number;
  montoPagado: number;
  señaPendiente: number;
  saldoPendiente: number;
};

type TurnoConRelaciones = {
  clienteNombre?: string | null;
  clienteApellido?: string | null;
  clienteTelefono?: string | null;
  estado: EstadoTurnoEmail;
  estadoPago: EstadoPagoEmail;
  metodoPago: string | null;
  tipoPago: string | null;
  horarioReservado: Date;
  precioCongelado: number | { toNumber: () => number };
  seniaCongelada: number | { toNumber: () => number };
  user?: { name?: string | null; telefono?: string | null } | null;
  servicio?: { nombre?: string } | null;
  barbero?: { nombre?: string; email?: string | null } | null;
};

function aNumero(valor: number | { toNumber: () => number }): number {
  return typeof valor === "number" ? valor : valor.toNumber();
}

export function construirDatosEmailTurno(
  turno: TurnoConRelaciones,
  estadoEmail?: TipoEstadoEmail,
  canceladoPor?: CanceladoPor,
): DatosEmailTurno {
  const zoned = toZonedTime(turno.horarioReservado, TIMEZONE);
  const fechaSemana = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(zoned);
  const fechaHora = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(zoned);

  const precioTotal = aNumero(turno.precioCongelado);
  const seniaCongelada = aNumero(turno.seniaCongelada);

  const pagoTotalAcreditado = turno.estadoPago === "PAGADO" ||
    (turno.estadoPago === "APROBADO" && turno.tipoPago === "TOTAL");
  const señaAcreditada = turno.estadoPago === "SEÑADO" ||
    (turno.estadoPago === "APROBADO" && turno.tipoPago === "SEÑA");
  const montoPagado = pagoTotalAcreditado
    ? precioTotal
    : señaAcreditada ? Math.min(precioTotal, seniaCongelada) : 0;

  return {
    clienteNombre: turno.clienteNombre
      ? [turno.clienteNombre, turno.clienteApellido].filter(Boolean).join(" ")
      : turno.user?.name || "Cliente",
    clienteTelefono: turno.clienteNombre
      ? turno.clienteTelefono ?? ""
      : turno.user?.telefono ?? "",
    servicioNombre: turno.servicio?.nombre || "Servicio",
    barberoNombre: turno.barbero?.nombre || "Barbero",
    fechaSemana,
    fechaHora,
    estado: estadoEmail ?? (turno.estado === "CANCELADO" ? "CANCELADO" : "CREADO"),
    ...(canceladoPor ? { canceladoPor } : {}),
    estadoTurno: turno.estado,
    estadoPago: turno.estadoPago,
    metodoPago: turno.metodoPago,
    tipoPago: turno.tipoPago,
    precioTotal,
    montoPagado,
    señaPendiente: pagoTotalAcreditado || señaAcreditada ? 0 : seniaCongelada,
    saldoPendiente: Math.max(0, precioTotal - montoPagado),
  };
}
