import { confirmarPagoTurno } from "@/actions/mercadopago/confirmar-pago.actions";
import AvisoEstadoPago from "@/components/pago/AvisoEstadoPago";
import VistaEstadoPago from "@/components/pago/VistaEstadoPago";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import type { TurnoPagoConfirmado } from "@/types/turno";
import { redirect } from "next/navigation";

interface PropiedadesPaginaEstadoPago {
  searchParams: Promise<{ turnoId?: string; status?: string; payment_id?: string; collection_id?: string }>;
}

export default async function PaginaEstadoPago({ searchParams }: PropiedadesPaginaEstadoPago) {
  const session = await requerirSesion();
  if (!session?.user) redirect("/login");
  const { status, turnoId, payment_id, collection_id } = await searchParams;
  const paymentId = payment_id || collection_id;
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
