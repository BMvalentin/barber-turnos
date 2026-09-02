// ============================================================
// app/pago/failure/page.tsx
// ============================================================
import Link from "next/link";
import { CLASES_BOTON_MARCA } from "@/lib/constants";
import { XCircle, RefreshCw, ArrowRight } from "lucide-react";

interface SearchParams {
  turnoId?: string;
  payment_id?: string;
}

interface FailurePageProps {
  searchParams: Promise<SearchParams>;
}

export default async function PagoFailurePage({
  searchParams,
}: FailurePageProps) {
  const { turnoId } = await searchParams;

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
              href={`/turno?retry=${turnoId}`}
className={`flex items-center justify-center gap-2 w-full ${CLASES_BOTON_MARCA} font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm`}
            >
              <RefreshCw className="w-5 h-5" />
              Intentar de nuevo
            </Link>
          )}
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full bg-[var(--admin-item)] hover:bg-[var(--admin-item-hover)] text-[var(--admin-texto-primario)] font-medium py-3 rounded-2xl transition-all text-sm"
          >
            Ver mis turnos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
