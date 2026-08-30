/* Tipos compartidos del dominio Mercado Pago (preferencias y estado de pago). */

export type TipoPago = "SEÑA" | "TOTAL";

export type DatosPreferenciaPago = {
  preferenceId: string;
  checkoutUrl: string | undefined;
  initPoint: string | undefined;
  sandboxInitPoint: string | undefined;
  tipoPago: TipoPago;
  montoSolicitado: number;
};

export type DatosEstadoPago = {
  id: string;
  estado: string;
  seniaCongelada: number;
  mpPaymentId: string | null;
  mpPreferenceId: string | null;
};
