import RedireccionWhatsApp from "@/components/pago/RedireccionWhatsApp";
import { CLASE_ACCION_PRINCIPAL, CLASE_ACCION_SECUNDARIA, CLASE_ICONO_ESTADO, CLASE_VISTA_PAGO } from "@/components/pago/estilos-estado-pago";
import type { PropiedadesVistaEstadoPago } from "@/components/pago/tipos-estado-pago";
import { AlertTriangle, ArrowRight, Calendar, CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react";
import Link from "next/link";

export default function VistaEstadoPago({ estado, turnoId, paymentId, datosTurnoConfirmado, whatsappPhone, verificadoCorrectamente }: PropiedadesVistaEstadoPago) {
  const esPagoAprobado = estado === "approved";
  const mostrarExito = esPagoAprobado && verificadoCorrectamente;
  const mostrarFallo = estado === "rejected" || estado === "null" || (esPagoAprobado && !verificadoCorrectamente);
  const mostrarPendiente = estado === "pending" || estado === "in_process";
  const estadoDesconocido = !mostrarExito && !mostrarPendiente && !mostrarFallo;
  const esPagoTotal = datosTurnoConfirmado?.tipoPago === "TOTAL";

  return <main className={CLASE_VISTA_PAGO}>
    <div className="w-full max-w-md space-y-5 text-center">
      {mostrarExito && <>
        <div className="flex justify-center"><div className={`${CLASE_ICONO_ESTADO} bg-emerald-100 text-emerald-800`}><CheckCircle2 aria-hidden="true" className="size-8" /></div></div>
        <div><h1 className="mb-2 text-balance text-2xl font-black tracking-tight sm:text-3xl">{esPagoTotal ? "¡Pago total!" : "¡Seña pagada!"}</h1><p className="text-[var(--admin-texto-secundario)]">Tu turno quedó confirmado. Te esperamos.</p></div>
      </>}
      {mostrarPendiente && <>
        <div className="flex justify-center"><div className={`${CLASE_ICONO_ESTADO} bg-amber-100 text-amber-800`}><Clock aria-hidden="true" className="size-8" /></div></div>
        <div><h1 className="mb-2 text-balance text-2xl font-black tracking-tight sm:text-3xl">Pago pendiente</h1><p className="text-[var(--admin-texto-secundario)]">Tu pago está siendo procesado. Te notificaremos cuando se acredite. El turno quedará confirmado automáticamente.</p></div>
      </>}
      {mostrarFallo && <>
        <div className="flex justify-center"><div className={`${CLASE_ICONO_ESTADO} bg-red-100 text-red-800`}><XCircle aria-hidden="true" className="size-8" /></div></div>
        <div><h1 className="mb-2 text-balance text-2xl font-black tracking-tight sm:text-3xl">Pago fallido</h1><p className="text-[var(--admin-texto-secundario)]">No se pudo procesar el pago. Revisá tus turnos para ver si podés intentarlo de nuevo.</p></div>
      </>}
      {estadoDesconocido && <>
        <div className="flex justify-center"><div className={`${CLASE_ICONO_ESTADO} bg-[var(--admin-item)] text-[var(--admin-texto-primario)]`}><AlertTriangle aria-hidden="true" className="size-8" /></div></div>
        <div><h1 className="mb-2 text-balance text-2xl font-black tracking-tight sm:text-3xl">Estado desconocido</h1><p className="text-[var(--admin-texto-secundario)]">No pudimos determinar el estado de tu pago. Revisá tus turnos.</p></div>
      </>}

      {mostrarExito && paymentId && <div className="bg-[var(--admin-surface)] rounded-lg p-4 text-left space-y-2">
        <p className="text-xs text-[var(--admin-texto-muted)] uppercase tracking-widest font-bold">Comprobante</p>
        <p className="text-sm text-[var(--admin-texto-primario)]"><span className="text-[var(--admin-texto-muted)]">ID de pago:</span>{" "}<span className="wrap-anywhere font-mono text-[var(--admin-texto-primario)]">{paymentId}</span></p>
        <p className="text-sm text-[var(--admin-texto-primario)]"><span className="text-[var(--admin-texto-muted)]">Turno:</span>{" "}<span className="font-mono">{turnoId.slice(0, 8)}...</span></p>
      </div>}
      {mostrarPendiente && paymentId && <div className="bg-[var(--admin-surface)] rounded-lg p-4 text-left">
        <p className="text-xs text-[var(--admin-texto-muted)] uppercase tracking-widest font-bold mb-1">Referencia</p><p className="wrap-anywhere font-mono text-sm text-[var(--admin-texto-primario)]">{paymentId}</p>
      </div>}
      {mostrarExito && datosTurnoConfirmado && whatsappPhone && <RedireccionWhatsApp numeroWhatsApp={whatsappPhone} clienteNombre={datosTurnoConfirmado.user.name} servicioNombre={datosTurnoConfirmado.servicio.nombre} barberoNombre={datosTurnoConfirmado.barbero.nombre} horarioReservado={datosTurnoConfirmado.horarioReservado} precioTotal={datosTurnoConfirmado.precioCongelado} señaPagada={datosTurnoConfirmado.seniaCongelada} saldoPendiente={datosTurnoConfirmado.precioCongelado - datosTurnoConfirmado.seniaCongelada} tipoPago={datosTurnoConfirmado.tipoPago} estadoPago={datosTurnoConfirmado.estadoPago} />}

      <div className="flex flex-col gap-3">
        {mostrarExito && <><Link href="/dashboard?tab=turnos" className={CLASE_ACCION_PRINCIPAL}><Calendar aria-hidden="true" className="size-5" />Ver mis turnos</Link><Link href="/" className={CLASE_ACCION_SECUNDARIA}>Volver al inicio<ArrowRight aria-hidden="true" className="size-4" /></Link></>}
        {mostrarPendiente && <Link href="/dashboard?tab=turnos" className={CLASE_ACCION_PRINCIPAL}>Ver mis turnos<ArrowRight aria-hidden="true" className="size-5" /></Link>}
        {mostrarFallo && <><Link href="/dashboard?tab=turnos" className={CLASE_ACCION_PRINCIPAL}><RefreshCw aria-hidden="true" className="size-5" />Ir a mis turnos</Link><Link href="/" className={CLASE_ACCION_SECUNDARIA}>Volver al inicio<ArrowRight aria-hidden="true" className="size-4" /></Link></>}
        {estadoDesconocido && <Link href="/dashboard?tab=turnos" className={CLASE_ACCION_SECUNDARIA}>Ver mis turnos<ArrowRight aria-hidden="true" className="size-4" /></Link>}
      </div>
    </div>
  </main>;
}
