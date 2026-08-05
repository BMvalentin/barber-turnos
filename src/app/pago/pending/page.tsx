// app/pago/pending/page.tsx
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

interface SearchParams {
  turnoId?: string;
  payment_id?: string;
}

export default async function PagoPendingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const paymentId = searchParams.payment_id;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">

        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-yellow-500/20 border-2 border-yellow-500/40 flex items-center justify-center">
            <Clock className="w-12 h-12 text-yellow-400" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
            Pago Pendiente
          </h1>
          <p className="text-zinc-400">
            Tu pago está siendo procesado. Te notificaremos cuando se acredite.
            El turno quedará confirmado automáticamente.
          </p>
        </div>

        {paymentId && (
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4 text-left">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">
              Referencia
            </p>
            <p className="font-mono text-yellow-400 text-sm">{paymentId}</p>
          </div>
        )}

        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm"
        >
          Ver mis turnos
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}