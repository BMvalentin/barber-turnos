// app/pago/success/page.tsx
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { CLASE_ACCION_PRINCIPAL, CLASE_ACCION_SECUNDARIA, CLASE_ICONO_ESTADO, CLASE_VISTA_PAGO } from "@/components/pago/estilos-estado-pago";
import { requerirPropietarioOAdmin } from "@/lib/seguridad/requerir-propietario";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { confirmarPagoTurno } from "@/actions/mercadopago/confirmar-pago.actions";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";
import RedireccionWhatsApp from "@/components/pago/RedireccionWhatsApp";
import { ESTADOS_PAGO_ACREDITADOS } from "@/lib/constants";
import Link from "next/link";
import { CheckCircle2, Calendar, ArrowRight, Clock3 } from "lucide-react";

interface SuccessPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

type Pagable = {
  user: { name: string | null };
  servicio: { nombre: string };
  barbero: { nombre: string };
  horarioReservado: Date;
  precioCongelado: number;
  seniaCongelada: number;
  tipoPago: string | null;
  estadoPago: string;
  mpPaymentId: string | null;
  metodoPago: string | null;
};

/**
 * Si confirmarPagoTurno no devuelve datos (por ejemplo, porque Mercado Pago no
 * incluyó el payment_id en la redirección pero el pago ya fue acreditado por el
 * webhook), leemos el turno para igualmente poder ofrecer el comprobante por
 * WhatsApp con los datos del turno. Solo se considera confirmado si el pago está
 * acreditado y el turno sigue confirmado o completado.
 */
async function obtenerDatosTurnoParaConfirmacion(
  turnoId: string,
): Promise<Pagable | null> {
  const turno = await prisma.turno.findUnique({
    where: { id: turnoId },
    select: {
      userId: true,
      estado: true,
      estadoPago: true,
      tipoPago: true,
      metodoPago: true,
      mpPaymentId: true,
      precioCongelado: true,
      seniaCongelada: true,
      horarioReservado: true,
      user: { select: { name: true } },
      servicio: { select: { nombre: true } },
      barbero: { select: { nombre: true } },
    },
  });

  if (!turno || !(await requerirPropietarioOAdmin(turno.userId))) return null;

  const acreditado =
    (turno.estado === "CONFIRMADO" || turno.estado === "COMPLETADO") &&
    turno.metodoPago === "MERCADO_PAGO" &&
    Boolean(turno.mpPaymentId) &&
    (ESTADOS_PAGO_ACREDITADOS as readonly string[]).includes(turno.estadoPago);

  if (!acreditado) return null;

  return {
    user: { name: turno.user?.name ?? null },
    servicio: { nombre: turno.servicio?.nombre ?? "Servicio" },
    barbero: { nombre: turno.barbero?.nombre ?? "Barbero" },
    horarioReservado: turno.horarioReservado,
    precioCongelado: Number(turno.precioCongelado),
    seniaCongelada: Number(turno.seniaCongelada),
    tipoPago: turno.tipoPago,
    estadoPago: turno.estadoPago,
    mpPaymentId: turno.mpPaymentId,
    metodoPago: turno.metodoPago,
  };
}

export default async function PagoSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const session = await requerirSesion();
  if (!session?.user) redirect("/login");

  const parametros = await searchParams;
  const turnoId = typeof parametros.turnoId === "string" && parametros.turnoId.length <= 191
    ? parametros.turnoId
    : undefined;
  const idRecibido = parametros.payment_id ?? parametros.collection_id;
  const paymentId = typeof idRecibido === "string" && /^\d+$/.test(idRecibido)
    ? idRecibido
    : undefined;

  // Confirmamos el turno desde la back_url (respaldo al webhook)
  // La confirmación verifica el pago contra la API de Mercado Pago
  const result = turnoId
    ? await confirmarPagoTurno(turnoId, paymentId)
    : { success: false, error: "Sin turno", data: undefined };

  const datosTurno: Pagable | null = result.success && result.data ? result.data : null;

  // Respaldo: si no pudimos confirmar pero el pago ya está acreditado (webhook),
  // igual mostramos el comprobante por WhatsApp con los datos del turno.
  const datosRespaldo =
    !datosTurno && turnoId ? await obtenerDatosTurnoParaConfirmacion(turnoId) : null;

  const datosFinales = datosTurno ?? datosRespaldo;
  const turnoConfirmado = Boolean(datosFinales);
  const idPagoVerificado = paymentId && datosFinales?.mpPaymentId === paymentId
    ? paymentId
    : undefined;

  const config = await obtenerConfigCacheada();
  const whatsappPhone = config?.whatsapp ?? "";

  const esPagoTotal = datosFinales?.tipoPago === "TOTAL";

  return (
    <main className={CLASE_VISTA_PAGO}>
      <div className="w-full max-w-md space-y-5 text-center">

        {/* Ícono de éxito */}
        <div className="flex justify-center">
          <div className={`${CLASE_ICONO_ESTADO} ${turnoConfirmado ? "bg-emerald-100 text-emerald-800" : "bg-[var(--admin-item)] text-[var(--admin-texto-primario)]"}`}>
            {turnoConfirmado
              ? <CheckCircle2 aria-hidden="true" className="size-8" />
              : <Clock3 aria-hidden="true" className="size-8" />}
          </div>
        </div>

        {/* Título */}
        <div>
          <h1 className="mb-2 text-balance text-2xl font-black tracking-tight sm:text-3xl">
            {turnoConfirmado
              ? esPagoTotal ? "¡Pago total!" : "¡Seña pagada!"
              : "Pago en revisión"}
          </h1>
          <p className="text-[var(--admin-texto-secundario)]">
            {turnoConfirmado
              ? "Tu turno quedó confirmado. Te esperamos."
              : "Todavía no pudimos verificar el pago. Revisá el estado en tus turnos."}
          </p>
        </div>

        {/* Info del pago */}
        {turnoConfirmado && idPagoVerificado && (
          <div className="bg-[var(--admin-surface)] rounded-lg p-4 text-left space-y-2">
            <p className="text-xs text-[var(--admin-texto-muted)] uppercase tracking-widest font-bold">
              Comprobante
            </p>
            <p className="text-sm text-[var(--admin-texto-secundario)]">
              <span className="text-[var(--admin-texto-muted)]">ID de pago:</span>{" "}
              <span className="wrap-anywhere font-mono text-[var(--admin-texto-primario)]">{idPagoVerificado}</span>
            </p>
            {turnoId && (
              <p className="text-sm text-[var(--admin-texto-secundario)]">
                <span className="text-[var(--admin-texto-muted)]">Turno:</span>{" "}
                <span className="font-mono text-[var(--admin-texto-secundario)]">{turnoId.slice(0, 8)}...</span>
              </p>
            )}
          </div>
        )}

        {/* Acciones */}
        {turnoConfirmado && datosFinales && whatsappPhone && (
          <RedireccionWhatsApp
            numeroWhatsApp={whatsappPhone}
            clienteNombre={datosFinales.user.name}
            servicioNombre={datosFinales.servicio.nombre}
            barberoNombre={datosFinales.barbero.nombre}
            horarioReservado={datosFinales.horarioReservado}
            precioTotal={datosFinales.precioCongelado}
            señaPagada={datosFinales.seniaCongelada}
            saldoPendiente={datosFinales.precioCongelado - datosFinales.seniaCongelada}
            tipoPago={datosFinales.tipoPago}
            estadoPago={datosFinales.estadoPago}
          />
        )}
        <div className="flex flex-col gap-3">
          <Link href="/dashboard?tab=turnos" className={CLASE_ACCION_PRINCIPAL}>
            <Calendar aria-hidden="true" className="size-5" />
            Ver mis turnos
          </Link>
          <Link href="/" className={CLASE_ACCION_SECUNDARIA}>
            Volver al inicio
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
