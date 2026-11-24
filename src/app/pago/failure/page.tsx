"use client";

import Link from "next/link";
import { CLASE_ACCION_PRINCIPAL, CLASE_ACCION_SECUNDARIA, CLASE_ICONO_ESTADO, CLASE_VISTA_PAGO } from "@/components/pago/estilos-estado-pago";
import { XCircle, RefreshCw, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function PagoFailurePage() {
  return (
    <Suspense fallback={<p role="status" className={CLASE_VISTA_PAGO}>Cargando estado del pago...</p>}>
      <ContenidoPagoFallido />
    </Suspense>
  );
}

function ContenidoPagoFallido() {
  const valorTurnoId = useSearchParams().get("turnoId");
  const turnoId = valorTurnoId && /^[\w-]{1,191}$/.test(valorTurnoId) ? valorTurnoId : null;

  return (
    <main className={CLASE_VISTA_PAGO}>
      <div className="w-full max-w-md space-y-5 text-center">

        <div className="flex justify-center">
          <div className={`${CLASE_ICONO_ESTADO} bg-red-100 text-red-800`}>
            <XCircle aria-hidden="true" className="size-8" />
          </div>
        </div>

        <div>
          <h1 className="mb-2 text-balance text-2xl font-black tracking-tight sm:text-3xl">
            Pago fallido
          </h1>
          <p className="text-[var(--admin-texto-secundario)]">
            No se pudo procesar el pago. Revisá tus turnos para ver si podés intentarlo de nuevo.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {turnoId && (
            <Link
              href="/dashboard?tab=turnos"
              className={CLASE_ACCION_PRINCIPAL}
            >
              <RefreshCw aria-hidden="true" className="size-5" />
              Ir a mis turnos
            </Link>
          )}
          <Link
            href="/"
            className={CLASE_ACCION_SECUNDARIA}
          >
            Volver al inicio
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
