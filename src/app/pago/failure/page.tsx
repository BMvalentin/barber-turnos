"use client";

import Link from "next/link";
import { CLASES_BOTON_MARCA } from "@/lib/constants";
import { XCircle, RefreshCw, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function PagoFailurePage() {
  return (
    <Suspense fallback={<p role="status" className="p-8 text-center">Cargando estado del pago...</p>}>
      <ContenidoPagoFallido />
    </Suspense>
  );
}

function ContenidoPagoFallido() {
  const valorTurnoId = useSearchParams().get("turnoId");
  const turnoId = valorTurnoId && /^[\w-]{1,191}$/.test(valorTurnoId) ? valorTurnoId : null;

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--page-bg-foreground)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">

        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-black text-[var(--page-bg-foreground)] uppercase tracking-tight mb-2">
            Pago Fallido
          </h1>
          <p className="text-[var(--admin-texto-secundario)]">
            No se pudo procesar el pago. Tu turno sigue reservado, podés intentarlo de nuevo.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {turnoId && (
            <Link
              href="/dashboard?tab=turnos"
              className={`flex items-center justify-center gap-2 w-full ${CLASES_BOTON_MARCA} font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm`}
            >
              <RefreshCw className="w-5 h-5" />
              Completar pago desde mis turnos
            </Link>
          )}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-[var(--admin-item)] hover:bg-[var(--admin-item-hover)] text-[var(--admin-texto-primario)] font-medium py-3 rounded-2xl transition-all text-sm"
          >
            Volver al inicio
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
