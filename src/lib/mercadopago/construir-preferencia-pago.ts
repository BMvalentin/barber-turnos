import { ZONA_HORARIA, TIPOS_PAGO } from "@/lib/constants";
import type { TipoPago } from "@/types/mercadopago";

/* Datos mínimos del turno para construir la preferencia de Mercado Pago. */
export interface TurnoParaPreferencia {
  id: string;
  servicio: { nombre: string };
  barbero: { nombre: string };
  user: { name: string | null; email: string | null };
  horarioReservado: Date;
}

export type CuerpoPreferenciaPago = {
  items: Array<{
    id: string;
    title: string;
    description: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
  payer: { name: string; email: string };
  back_urls: { success: string; failure: string; pending: string };
  auto_return?: string;
  notification_url: string;
  external_reference: string;
  metadata: { tipoPago: TipoPago; turnoId: string };
  expires: boolean;
  expiration_date_from: string;
  expiration_date_to: string;
};

/** Construye el cuerpo de la preferencia de pago según el tipo de pago (seña o total). */
export function construirPreferenciaPago(
  turno: TurnoParaPreferencia,
  tipoPago: TipoPago,
  monto: number,
  baseUrl: string,
  isProduction: boolean,
): CuerpoPreferenciaPago {
  const esTotal = tipoPago === TIPOS_PAGO[1];
  const detalleFecha = turno.horarioReservado.toLocaleString("es-AR", {
    timeZone: ZONA_HORARIA,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    items: [
      {
        id: turno.id,
        title: `${esTotal ? "Pago total" : "Seña"} - ${turno.servicio.nombre}`,
        description: `Turno con ${turno.barbero.nombre} | ${detalleFecha}`,
        quantity: 1,
        unit_price: monto,
        currency_id: "ARS",
      },
    ],
    payer: {
      name: turno.user.name ?? "Cliente",
      email: turno.user.email ?? "cliente@email.com",
    },
    back_urls: {
      success: `${baseUrl}/pago/success?turnoId=${turno.id}`,
      failure: `${baseUrl}/pago/failure?turnoId=${turno.id}`,
      pending: `${baseUrl}/pago/pending?turnoId=${turno.id}`,
    },
    ...(isProduction ? { auto_return: "approved" as const } : {}),
    notification_url: `${baseUrl}/api/mercadopago/webhook`,
    external_reference: turno.id,
    metadata: { tipoPago, turnoId: turno.id },
    expires: true,
    expiration_date_from: new Date().toISOString(),
    expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
}
