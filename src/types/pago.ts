/** Métodos disponibles para abonar un turno. */
export type MetodoPago = "MERCADO_PAGO" | "TRANSFERENCIA";

/** Datos bancarios que se muestran durante el checkout de transferencia. */
export type DatosTransferencia = {
  transferenciaTitular: string;
  transferenciaCuit: string;
  transferenciaAlias: string;
  transferenciaCbu: string;
  transferenciaBanco: string;
};
