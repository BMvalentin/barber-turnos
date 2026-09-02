import type { TurnoPagoConfirmado } from "@/types/turno";

export interface PropiedadesVistaEstadoPago {
  estado?: string;
  turnoId: string;
  paymentId?: string;
  datosTurnoConfirmado: TurnoPagoConfirmado | null;
  whatsappPhone: string;
  verificadoCorrectamente: boolean;
}
