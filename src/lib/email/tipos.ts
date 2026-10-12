export type TurnoParaEmail = {
  clienteNombre?: string | null;
  clienteApellido?: string | null;
  clienteTelefono?: string | null;
  clienteEmail?: string | null;
  estado: string;
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
