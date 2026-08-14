export type TurnoParaEmail = {
  estado: string;
  horarioReservado: Date;
  precioCongelado: number | { toNumber: () => number };
  seniaCongelada: number | { toNumber: () => number };
  user: { email: string; name: string | null; telefono?: string | null };
  servicio: { nombre: string };
  barbero: { nombre: string };
};
