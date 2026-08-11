export type TurnoParaEmail = {
  horarioReservado: Date;
  user: { email: string; name: string | null };
  servicio: { nombre: string };
  barbero: { nombre: string };
};
