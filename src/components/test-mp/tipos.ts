// src/components/test-mp/tipos.ts

export type Turno = {
  id: string;
  estado: string;
  horarioReservado: string;
  precioCongelado: number;
  seniaCongelada: number;
  mpPreferenceId: string | null;
  mpPaymentId: string | null;
  userName: string | null;
  userEmail: string | null;
  servicioNombre: string;
  barberoNombre: string;
};

export type LogEntry = {
  id: string;
  ts: string;
  type: "info" | "success" | "error" | "warn" | "request" | "response";
  label: string;
  payload?: unknown;
};