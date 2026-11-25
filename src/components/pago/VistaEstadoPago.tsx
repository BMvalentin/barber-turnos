import { ArrowRight, Calendar, CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { consultarPagoRetorno } from "@/lib/mercadopago/consultar-pago-retorno";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import AvisoEstadoPago from "./AvisoEstadoPago";
import RedireccionWhatsApp from "./RedireccionWhatsApp";
import { CLASE_ACCION_PRINCIPAL, CLASE_ACCION_SECUNDARIA, CLASE_ICONO_ESTADO, CLASE_VISTA_PAGO } from "./estilos-estado-pago";

interface PropiedadesVistaEstadoPago {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const ESTADOS = {
  confirmado: {
    descripcion: "Tu turno quedó confirmado. Te esperamos.",
    icono: CheckCircle2,
    color: "bg-emerald-100 text-emerald-800",
  },
  pendiente: {
    titulo: "Pago pendiente",
    descripcion: "Tu pago está siendo procesado. Te notificaremos cuando se confirme el turno.",
    icono: Clock,
    color: "bg-amber-100 text-amber-800",
  },
  fallido: {
    titulo: "Pago no acreditado",
    descripcion: "Revisá el estado de la reserva en tus turnos.",
    icono: XCircle,
    color: "bg-red-100 text-red-800",
  },
  revision: {
    titulo: "Pago en revisión",
    descripcion: "Todavía estamos esperando la confirmación del pago. Podés actualizar el estado en unos instantes.",
    icono: Clock,
    color: "bg-[var(--admin-item)] text-[var(--admin-texto-primario)]",
  },
};

function esIdPago(valor: string | string[] | undefined): valor is string {
  return typeof valor === "string" && /^\d{1,32}$/.test(valor);
}

export default async function VistaEstadoPago({ searchParams }: PropiedadesVistaEstadoPago) {
  const session = await requerirSesion();
  if (!session?.user) redirect("/login");

  const { turnoId, payment_id, collection_id } = await searchParams;
  if (typeof turnoId !== "string" || !/^[\w-]{1,191}$/.test(turnoId)) return <AvisoEstadoPago />;
  const paymentId = esIdPago(payment_id) ? payment_id : esIdPago(collection_id) ? collection_id : undefined;
  const estado = await consultarPagoRetorno(turnoId, paymentId);
  if (!estado) return <AvisoEstadoPago />;

  const datos = estado.tipo === "confirmado" ? estado.datos : null;
  const titulo = estado.tipo === "confirmado"
    ? estado.datos.tipoPago === "TOTAL" ? "¡Pago total!" : "¡Seña pagada!"
    : ESTADOS[estado.tipo].titulo;
  const { descripcion, color, icono: Icono } = ESTADOS[estado.tipo];
  const whatsapp = datos ? (await obtenerConfigCacheada())?.whatsapp : null;
  const enlaceActualizacion = new URLSearchParams({ turnoId });
  if (paymentId) enlaceActualizacion.set("payment_id", paymentId);

  return (
    <main className={CLASE_VISTA_PAGO}>
      <div className="w-full max-w-md space-y-5 text-center">
        <div className="flex justify-center">
          <div className={`${CLASE_ICONO_ESTADO} ${color}`}>
            <Icono aria-hidden="true" className="size-8" />
          </div>
        </div>
        <div>
          <h1 className="mb-2 text-balance text-2xl font-black tracking-tight sm:text-3xl">{titulo}</h1>
          <p className="text-[var(--admin-texto-secundario)]">{descripcion}</p>
        </div>

        {datos && (
          <div className="space-y-2 rounded-lg bg-[var(--admin-surface)] p-4 text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--admin-texto-muted)]">Comprobante</p>
            <p className="text-sm text-[var(--admin-texto-secundario)]">
              <span className="text-[var(--admin-texto-muted)]">ID de pago:</span>{" "}
              <span className="wrap-anywhere font-mono text-[var(--admin-texto-primario)]">{datos.mpPaymentId}</span>
            </p>
            <p className="text-sm text-[var(--admin-texto-secundario)]">
              <span className="text-[var(--admin-texto-muted)]">Turno:</span>{" "}
              <span className="font-mono">{turnoId.slice(0, 8)}...</span>
            </p>
          </div>
        )}

        {datos && whatsapp && (
          <RedireccionWhatsApp
            numeroWhatsApp={whatsapp}
            clienteNombre={datos.user?.name ?? null}
            servicioNombre={datos.servicio?.nombre ?? "Servicio"}
            barberoNombre={datos.barbero?.nombre ?? "Barbero"}
            horarioReservado={datos.horarioReservado}
            precioTotal={Number(datos.precioCongelado)}
            señaPagada={Number(datos.seniaCongelada)}
            saldoPendiente={Number(datos.precioCongelado) - Number(datos.seniaCongelada)}
            tipoPago={datos.tipoPago}
            estadoPago={datos.estadoPago}
          />
        )}

        <div className="flex flex-col gap-3">
          <Link href="/dashboard?tab=turnos" className={CLASE_ACCION_PRINCIPAL}>
            <Calendar aria-hidden="true" className="size-5" />
            Ver mis turnos
          </Link>
          {estado.tipo === "revision" || estado.tipo === "pendiente" ? (
            <a href={`?${enlaceActualizacion}`} className={CLASE_ACCION_SECUNDARIA}>
              <RefreshCw aria-hidden="true" className="size-4" />
              Actualizar estado
            </a>
          ) : (
            <Link href="/" className={CLASE_ACCION_SECUNDARIA}>
              Volver al inicio
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
