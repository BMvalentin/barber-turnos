import { confirmarPagoTurno } from "@/actions/mercadopago/confirmar-pago.actions";
import AvisoEstadoPago from "@/components/pago/AvisoEstadoPago";
import VistaEstadoPago from "@/components/pago/VistaEstadoPago";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import type { TurnoPagoConfirmado } from "@/types/turno";
import { redirect } from "next/navigation";

interface PropiedadesPaginaEstadoPago {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PaginaEstadoPago({ searchParams }: PropiedadesPaginaEstadoPago) {
  const session = await requerirSesion();
  if (!session?.user) redirect("/login");
  const { status: estadoRecibido, turnoId: turnoIdRecibido, payment_id, collection_id } = await searchParams;
  const status = typeof estadoRecibido === "string" && estadoRecibido.length <= 32
    ? estadoRecibido
    : undefined;
  const turnoId = typeof turnoIdRecibido === "string" && /^[\w-]{1,191}$/.test(turnoIdRecibido)
    ? turnoIdRecibido
    : null;
  const paymentId = typeof payment_id === "string" && /^\d{1,32}$/.test(payment_id)
    ? payment_id
    : typeof collection_id === "string" && /^\d{1,32}$/.test(collection_id)
      ? collection_id
      : undefined;
  if (!turnoId) return <AvisoEstadoPago />;

  const config = await obtenerConfigCacheada();
  const esPagoAprobado = status === "approved";
  let verificadoCorrectamente = false;
  let datosTurnoConfirmado: TurnoPagoConfirmado | null = null;
  if (esPagoAprobado && paymentId) {
    const resultado = await confirmarPagoTurno(turnoId, paymentId);
    verificadoCorrectamente = resultado.success === true;
    if (resultado.success && resultado.data) datosTurnoConfirmado = resultado.data;
  }

  return <VistaEstadoPago estado={status} turnoId={turnoId} paymentId={paymentId} datosTurnoConfirmado={datosTurnoConfirmado} whatsappPhone={config?.whatsapp ?? ""} verificadoCorrectamente={verificadoCorrectamente} />;
}
