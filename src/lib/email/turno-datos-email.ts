import { toZonedTime } from "date-fns-tz";

const TIMEZONE = "America/Argentina/Buenos_Aires";

export type TipoEstadoEmail = "CREADO" | "ACTUALIZADO" | "CANCELADO";

export type DatosEmailTurno = {
  clienteNombre: string;
  clienteTelefono: string;
  servicioNombre: string;
  barberoNombre: string;
  fechaSemana: string;
  fechaHora: string;
  estado: TipoEstadoEmail;
  precioTotal: number;
  señaPagada: number;
  saldoPendiente: number;
};

type TurnoConRelaciones = {
  estado: string;
  horarioReservado: Date;
  precioCongelado: number | { toNumber: () => number };
  seniaCongelada: number | { toNumber: () => number };
  user?: { name?: string | null; telefono?: string | null } | null;
  servicio?: { nombre?: string } | null;
  barbero?: { nombre?: string } | null;
};

function aNumero(valor: number | { toNumber: () => number }): number {
  return typeof valor === "number" ? valor : valor.toNumber();
}

export function construirDatosEmailTurno(
  turno: TurnoConRelaciones,
  estadoEmail?: TipoEstadoEmail,
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

  const señaPagada =
    turno.estado === "CONFIRMADO" || turno.estado === "COMPLETADO"
      ? seniaCongelada
      : 0;

  return {
    clienteNombre: turno.user?.name || "Cliente",
    clienteTelefono: turno.user?.telefono || "",
    servicioNombre: turno.servicio?.nombre || "Servicio",
    barberoNombre: turno.barbero?.nombre || "Barbero",
    fechaSemana,
    fechaHora,
    estado: estadoEmail ?? (turno.estado === "CANCELADO" ? "CANCELADO" : "CREADO"),
    precioTotal,
    señaPagada,
    saldoPendiente: precioTotal - señaPagada,
  };
}
