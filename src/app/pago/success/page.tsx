// app/pago/success/page.tsx
import { confirmarPagoTurno } from "@/actions/mercadopago-actions";
import Link from "next/link";
import { CheckCircle2, Calendar, ArrowRight } from "lucide-react";

interface SearchParams {
  turnoId?: string;
  payment_id?: string;
  status?: string;
  collection_id?: string;
}

export default async function PagoSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const turnoId = searchParams.turnoId;
  const paymentId = searchParams.payment_id || searchParams.collection_id;

  let turnoConfirmado = false;

  if (turnoId) {
    // Confirmamos el turno desde la back_url (respaldo al webhook)
    const result = await confirmarPagoTurno(turnoId, paymentId);
    turnoConfirmado = result.success;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Ícono de éxito */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
        </div>

        {/* Título */}
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
            ¡Seña Pagada!
          </h1>
          <p className="text-zinc-400">
            Tu turno quedó confirmado. Te esperamos.
          </p>
        </div>

        {/* Info del pago */}
        {paymentId && (
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4 text-left space-y-2">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
              Comprobante
            </p>
            <p className="text-sm text-zinc-300">
              <span className="text-zinc-500">ID de pago:</span>{" "}
              <span className="font-mono text-amber-400">{paymentId}</span>
            </p>
            {turnoId && (
              <p className="text-sm text-zinc-300">
                <span className="text-zinc-500">Turno:</span>{" "}
                <span className="font-mono text-zinc-300">{turnoId.slice(0, 8)}...</span>
              </p>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm"
          >
            <Calendar className="w-5 h-5" />
            Ver mis turnos
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-2xl transition-all text-sm"
          >
            Volver al inicio
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}