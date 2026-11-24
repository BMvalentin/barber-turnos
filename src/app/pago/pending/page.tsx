"use client";

import Link from "next/link";
import { CLASE_ACCION_PRINCIPAL, CLASE_ICONO_ESTADO, CLASE_VISTA_PAGO } from "@/components/pago/estilos-estado-pago";
import { Clock, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function PagoPendingPage() {
  return (
    <Suspense fallback={<p role="status" className={CLASE_VISTA_PAGO}>Cargando estado del pago...</p>}>
      <ContenidoPagoPendiente />
    </Suspense>
  );
}

function ContenidoPagoPendiente() {
  const paymentIdRecibido = useSearchParams().get("payment_id");
  const paymentId = paymentIdRecibido && /^\d{1,32}$/.test(paymentIdRecibido) ? paymentIdRecibido : null;

  return (
    <main className={CLASE_VISTA_PAGO}>
      <div className="w-full max-w-md space-y-5 text-center">

        <div className="flex justify-center">
          <div className={`${CLASE_ICONO_ESTADO} bg-amber-100 text-amber-800`}>
            <Clock aria-hidden="true" className="size-8" />
          </div>
        </div>

        <div>
          <h1 className="mb-2 text-balance text-2xl font-black tracking-tight sm:text-3xl">
            Pago pendiente
          </h1>
          <p className="text-[var(--admin-texto-secundario)]">
            Tu pago está siendo procesado. Te notificaremos cuando se acredite.
            El turno quedará confirmado automáticamente.
          </p>
        </div>

        {paymentId && (
          <div className="bg-[var(--admin-surface)] rounded-lg p-4 text-left">
            <p className="text-xs text-[var(--admin-texto-muted)] uppercase tracking-widest font-bold mb-1">
              Referencia
            </p>
            <p className="wrap-anywhere font-mono text-sm text-[var(--admin-texto-primario)]">{paymentId}</p>
          </div>
        )}

        <Link
          href="/dashboard?tab=turnos"
          className={CLASE_ACCION_PRINCIPAL}
        >
          Ver mis turnos
          <ArrowRight aria-hidden="true" className="size-5" />
        </Link>
      </div>
    </main>
  );
}
