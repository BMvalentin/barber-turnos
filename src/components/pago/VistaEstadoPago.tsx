import RedireccionWhatsApp from "@/components/pago/RedireccionWhatsApp";
import type { PropiedadesVistaEstadoPago } from "@/components/pago/tipos-estado-pago";
import { CLASES_BOTON_MARCA } from "@/lib/constants";
import { AlertTriangle, ArrowRight, Calendar, CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react";
import Link from "next/link";

const CLASE_BOTON_SECUNDARIO = "flex items-center justify-center gap-2 w-full bg-[var(--admin-item)] hover:bg-[var(--admin-item-hover)] text-[var(--admin-texto-primario)] font-medium py-3 rounded-2xl transition-all text-sm";

export default function VistaEstadoPago({ estado, turnoId, paymentId, datosTurnoConfirmado, whatsappPhone, verificadoCorrectamente }: PropiedadesVistaEstadoPago) {
  const esPagoAprobado = estado === "approved";
  const mostrarExito = esPagoAprobado && verificadoCorrectamente;
  const mostrarFallo = estado === "rejected" || estado === "null" || (esPagoAprobado && !verificadoCorrectamente);
  const mostrarPendiente = estado === "pending" || estado === "in_process";
  const estadoDesconocido = !mostrarExito && !mostrarPendiente && !mostrarFallo;
  const esPagoTotal = datosTurnoConfirmado?.tipoPago === "TOTAL";

  return <div className="min-h-screen bg-[var(--page-bg)] text-[var(--page-bg-foreground)] flex items-center justify-center px-4 py-8">
    <div className="max-w-md w-full text-center space-y-6">
      {mostrarExito && <>
        <div className="flex justify-center"><div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center"><CheckCircle2 className="w-12 h-12 text-green-400" /></div></div>
        <div><h1 className="text-3xl font-black uppercase tracking-tight mb-2">{esPagoTotal ? "¡Pago Total!" : "¡Seña Pagada!"}</h1><p className="text-[var(--admin-texto-secundario)]">Tu turno quedó confirmado. Te esperamos.</p></div>
      </>}
      {mostrarPendiente && <>
        <div className="flex justify-center"><div className="w-24 h-24 rounded-full bg-yellow-500/20 border-2 border-yellow-500/40 flex items-center justify-center"><Clock className="w-12 h-12 text-yellow-400" /></div></div>
        <div><h1 className="text-3xl font-black uppercase tracking-tight mb-2">Pago Pendiente</h1><p className="text-[var(--admin-texto-secundario)]">Tu pago está siendo procesado. Te notificaremos cuando se acredite. El turno quedará confirmado automáticamente.</p></div>
      </>}
      {mostrarFallo && <>
        <div className="flex justify-center"><div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center"><XCircle className="w-12 h-12 text-red-400" /></div></div>
        <div><h1 className="text-3xl font-black uppercase tracking-tight mb-2">Pago Fallido</h1><p className="text-[var(--admin-texto-secundario)]">No se pudo procesar el pago. Tu turno sigue reservado, podés intentarlo de nuevo.</p></div>
      </>}
      {estadoDesconocido && <>
        <div className="flex justify-center"><div className="w-24 h-24 rounded-full bg-[var(--admin-item)] border-2 border-[var(--admin-border-fuerte)] flex items-center justify-center"><AlertTriangle className="w-12 h-12 text-[var(--admin-texto-secundario)]" /></div></div>
        <div><h1 className="text-3xl font-black uppercase tracking-tight mb-2">Estado Desconocido</h1><p className="text-[var(--admin-texto-secundario)]">No pudimos determinar el estado de tu pago. Revisá tu panel de control.</p></div>
      </>}

      {mostrarExito && paymentId && <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl p-4 text-left space-y-2">
        <p className="text-xs text-[var(--admin-texto-muted)] uppercase tracking-widest font-bold">Comprobante</p>
        <p className="text-sm text-[var(--admin-texto-primario)]"><span className="text-[var(--admin-texto-muted)]">ID de pago:</span>{" "}<span className="font-mono text-[var(--page-primary-tinta)]">{paymentId}</span></p>
        <p className="text-sm text-[var(--admin-texto-primario)]"><span className="text-[var(--admin-texto-muted)]">Turno:</span>{" "}<span className="font-mono">{turnoId.slice(0, 8)}...</span></p>
      </div>}
      {mostrarPendiente && paymentId && <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl p-4 text-left">
        <p className="text-xs text-[var(--admin-texto-muted)] uppercase tracking-widest font-bold mb-1">Referencia</p><p className="font-mono text-yellow-400 text-sm">{paymentId}</p>
      </div>}
      {mostrarExito && datosTurnoConfirmado && whatsappPhone && <RedireccionWhatsApp numeroWhatsApp={whatsappPhone} clienteNombre={datosTurnoConfirmado.user.name} servicioNombre={datosTurnoConfirmado.servicio.nombre} barberoNombre={datosTurnoConfirmado.barbero.nombre} horarioReservado={datosTurnoConfirmado.horarioReservado} precioTotal={datosTurnoConfirmado.precioCongelado} señaPagada={datosTurnoConfirmado.seniaCongelada} saldoPendiente={datosTurnoConfirmado.precioCongelado - datosTurnoConfirmado.seniaCongelada} tipoPago={datosTurnoConfirmado.tipoPago} estadoPago={datosTurnoConfirmado.estadoPago} />}

      <div className="flex flex-col gap-3">
        {mostrarExito && <><Link href="/dashboard" className={`flex items-center justify-center gap-2 w-full ${CLASES_BOTON_MARCA} font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm`}><Calendar className="w-5 h-5" />Ver mis turnos</Link><Link href="/" className={CLASE_BOTON_SECUNDARIO}>Volver al inicio<ArrowRight className="w-4 h-4" /></Link></>}
        {mostrarPendiente && <Link href="/dashboard" className={`flex items-center justify-center gap-2 w-full ${CLASES_BOTON_MARCA} font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm`}>Ver mis turnos<ArrowRight className="w-5 h-5" /></Link>}
        {mostrarFallo && <><Link href={`/turno?retry=${turnoId}`} className={`flex items-center justify-center gap-2 w-full ${CLASES_BOTON_MARCA} font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm`}><RefreshCw className="w-5 h-5" />Intentar de nuevo</Link><Link href="/dashboard" className={CLASE_BOTON_SECUNDARIO}>Ver mis turnos<ArrowRight className="w-4 h-4" /></Link></>}
        {estadoDesconocido && <Link href="/dashboard" className={CLASE_BOTON_SECUNDARIO}>Ver mis turnos<ArrowRight className="w-4 h-4" /></Link>}
      </div>
    </div>
  </div>;
}
