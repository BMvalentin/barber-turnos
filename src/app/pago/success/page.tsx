// app/pago/success/page.tsx
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { confirmarPagoTurno } from "@/actions/mercadopago/confirmar-pago.actions";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";
import RedireccionWhatsApp from "@/components/pago/RedireccionWhatsApp";
import { CLASES_BOTON_MARCA, ESTADOS_PAGO_ACREDITADOS } from "@/lib/constants";
import Link from "next/link";
import { CheckCircle2, Calendar, ArrowRight } from "lucide-react";

interface SearchParams {
  turnoId?: string;
  payment_id?: string;
  status?: string;
  collection_id?: string;
}

interface SuccessPageProps {
  searchParams: Promise<SearchParams>;
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
};

/**
 * Si confirmarPagoTurno no devuelve datos (por ejemplo, porque Mercado Pago no
 * incluyó el payment_id en la redirección pero el pago ya fue acreditado por el
 * webhook), leemos el turno para igualmente poder ofrecer el comprobante por
 * WhatsApp con los datos del turno. Solo se considera confirmado si el pago está
 * acreditado (estado CONFIRMADO o estadoPago en ESTADOS_PAGO_ACREDITADOS).
 */
async function obtenerDatosTurnoParaConfirmacion(
  turnoId: string,
): Promise<Pagable | null> {
  const turno = await prisma.turno.findUnique({
    where: { id: turnoId },
    select: {
      estado: true,
      estadoPago: true,
      tipoPago: true,
      precioCongelado: true,
      seniaCongelada: true,
      horarioReservado: true,
      user: { select: { name: true } },
      servicio: { select: { nombre: true } },
      barbero: { select: { nombre: true } },
    },
  });

  if (!turno) return null;

  const acreditado =
    turno.estado === "CONFIRMADO" ||
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
  };
}

export default async function PagoSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const session = await requerirSesion();
  if (!session?.user) redirect("/login");

  const { turnoId, payment_id, collection_id } = await searchParams;
  const paymentId = payment_id || collection_id;

  // Confirmamos el turno desde la back_url (respaldo al webhook)
  // La confirmación verifica el pago contra la API de Mercado Pago
  const result = turnoId
    ? await confirmarPagoTurno(turnoId, paymentId)
    : { success: false, error: "Sin turno", data: undefined };

  const datosTurno = (result.success ? result.data : null) as Pagable | null;

  // Respaldo: si no pudimos confirmar pero el pago ya está acreditado (webhook),
  // igual mostramos el comprobante por WhatsApp con los datos del turno.
  const datosRespaldo =
    !datosTurno && turnoId ? await obtenerDatosTurnoParaConfirmacion(turnoId) : null;

  const datosFinales = datosTurno ?? datosRespaldo;
  const turnoConfirmado = Boolean(datosFinales);

  const config = await obtenerConfigCacheada();
  const whatsappPhone = config?.whatsapp ?? "";

  const esPagoTotal = datosTurno?.tipoPago === "TOTAL";

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--page-bg-foreground)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">

        {/* Ícono de éxito */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
        </div>

        {/* Título */}
        <div>
          <h1 className="text-3xl font-black text-[var(--page-bg-foreground)] uppercase tracking-tight mb-2">
            {esPagoTotal ? "¡Pago Total!" : "¡Seña Pagada!"}
          </h1>
          <p className="text-[var(--admin-texto-secundario)]">
            Tu turno quedó confirmado. Te esperamos.
          </p>
        </div>

        {/* Info del pago */}
        {paymentId && (
          <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl p-4 text-left space-y-2">
            <p className="text-xs text-[var(--admin-texto-muted)] uppercase tracking-widest font-bold">
              Comprobante
            </p>
            <p className="text-sm text-[var(--admin-texto-secundario)]">
              <span className="text-[var(--admin-texto-muted)]">ID de pago:</span>{" "}
              <span className="font-mono text-[var(--page-primary-tinta)]">{paymentId}</span>
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
        {turnoConfirmado && datosFinales && whatsappPhone ? (
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
        ) : (
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className={`flex items-center justify-center gap-2 w-full ${CLASES_BOTON_MARCA} font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm`}
            >
              <Calendar className="w-5 h-5" />
              Ver mis turnos
            </Link>
            <Link
              href="/"
            className="flex items-center justify-center gap-2 w-full bg-[var(--admin-item)] hover:bg-[var(--admin-item-hover)] text-[var(--admin-texto-primario)] font-medium py-3 rounded-2xl transition-all text-sm"
            >
              Volver al inicio
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
