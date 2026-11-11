import type { EstadoPagoEmail, EstadoTurnoEmail } from "./turno-datos-email";

export type TurnoParaEmail = {
  clienteNombre?: string | null;
  clienteApellido?: string | null;
  clienteTelefono?: string | null;
  clienteEmail?: string | null;
  estado: EstadoTurnoEmail;
  estadoPago: EstadoPagoEmail;
  metodoPago: string | null;
  tipoPago: string | null;
  horarioReservado: Date;
  precioCongelado: number | { toNumber: () => number };
  seniaCongelada: number | { toNumber: () => number };
  user: {
    email: string;
    name: string | null;
    telefono?: string | null;
    esInvitado?: boolean;
    emailContacto?: string | null;
  };
  servicio: { nombre: string };
  barbero: { nombre: string; email: string | null };
};
