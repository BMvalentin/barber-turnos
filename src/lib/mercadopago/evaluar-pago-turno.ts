import { ESTADOS_TURNO, ESTADOS_PAGO, TIPOS_PAGO } from "@/lib/constants";

/* Resultado de evaluar si un pago de Mercado Pago confirma el turno.
   `yaConfirmado` indica que el turno ya estaba procesado y no debe repetirse. */
export type ResultadoEvaluacionPago =
  | { ok: true; yaConfirmado: true }
  | {
      ok: true;
      yaConfirmado: false;
      nuevoEstadoPago: (typeof ESTADOS_PAGO)[number];
      tipoPagoGuardar: string;
    }
  | { ok: false; error: string };

export type DatosValidacionPago = {
  turnoId: string;
  estado: string;
  tipoPagoAlmacenado: string | null;
  precioCongelado: number;
  seniaCongelada: number;
  estadoPago: string;
  referencia: string;
  montoPago: number;
  tipoPago?: string;
  soloSiPendiente?: boolean;
};

/** Evalúa la validez del pago y el plan de confirmación, sin escribir en BD. */
export function evaluarPagoTurno(d: DatosValidacionPago): ResultadoEvaluacionPago {
  if (d.estadoPago !== "approved") return { ok: false, error: "El pago no está acreditado todavía" };

  if (d.referencia !== d.turnoId) return { ok: false, error: "El pago no corresponde a este turno" };

  const esTipoTotal = (d.tipoPago ?? d.tipoPagoAlmacenado ?? "") === TIPOS_PAGO[1];
  const montoRequerido = esTipoTotal ? d.precioCongelado : d.seniaCongelada;
  if (d.montoPago < montoRequerido) return { ok: false, error: "El monto del pago no es válido" };

  const yaConfirmado = d.estado === ESTADOS_TURNO[1] || (d.soloSiPendiente && d.estado !== ESTADOS_TURNO[0]);
  if (yaConfirmado) return { ok: true, yaConfirmado: true };

  return {
    ok: true,
    yaConfirmado: false,
    nuevoEstadoPago: esTipoTotal ? ESTADOS_PAGO[2] : ESTADOS_PAGO[1],
    tipoPagoGuardar: esTipoTotal ? TIPOS_PAGO[1] : TIPOS_PAGO[0],
  };
}
