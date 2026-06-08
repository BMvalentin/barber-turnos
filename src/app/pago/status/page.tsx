import Link from "next/link";
import { confirmarPagoTurno } from "@/actions/mercadopago-actions";
import { CheckCircle2, Clock, XCircle, Calendar, ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";

interface StatusPageProps {
  searchParams: Promise<{
    turnoId?: string;
    status?: string;
    payment_id?: string;   
    collection_id?: string; 
}>;
}

export default async function PagoStatusPage({ searchParams }: StatusPageProps) {
  const { status, turnoId, payment_id, collection_id } = await searchParams;
  
  const paymentId = payment_id || collection_id;

  // Validación temprana: Si no hay turnoId, mostramos error genérico
  if (!turnoId) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4 bg-zinc-900/40 border border-red-500/20 rounded-3xl p-8">
          <div className="flex justify-center">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Error en la solicitud</h1>
          <p className="text-zinc-400 text-sm">
            No pudimos encontrar una referencia de turno válida para verificar este pago.
          </p>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-2xl transition-all text-sm mt-4"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Evaluación de seguridad con la API de Mercado Pago
  const esPagoAprobado = status === "approved";
  let verificadoCorrectamente = false;

  if (esPagoAprobado && paymentId) {
    const result = await confirmarPagoTurno(turnoId, paymentId);
    verificadoCorrectamente = result.success;
  }

  // Mapeo preciso de estados
  const mostrarExito = esPagoAprobado && (paymentId ? verificadoCorrectamente : true);
  const mostrarFallo = status === "rejected" || status === "null" || (esPagoAprobado && paymentId && !verificadoCorrectamente);
  const mostrarPendiente = status === "pending" || status === "in_process";

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* ==========================================
            ENCABEZADOS E ÍCONOS POR ESTADO
        ========================================== */}
        
        {mostrarExito && (
          <>
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                ¡Seña Pagada!
              </h1>
              <p className="text-zinc-400">
                Tu turno quedó confirmado. Te esperamos.
              </p>
            </div>
          </>
        )}

        {mostrarPendiente && (
          <>
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
          </>
        )}

        {mostrarFallo && (
          <>
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                Pago Fallido
              </h1>
              <p className="text-zinc-400">
                No se pudo procesar el pago. Tu turno sigue reservado, podés intentarlo de nuevo.
              </p>
            </div>
          </>
        )}

        {!mostrarExito && !mostrarPendiente && !mostrarFallo && (
          <>
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-zinc-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                Estado Desconocido
              </h1>
              <p className="text-zinc-400">
                No pudimos determinar el estado de tu pago. Revisá tu panel de control.
              </p>
            </div>
          </>
        )}

        {/* ==========================================
            BLOQUE DE INFORMACIÓN (COMPROBANTE/REF)
        ========================================== */}

        {mostrarExito && paymentId && (
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4 text-left space-y-2">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
              Comprobante
            </p>
            <p className="text-sm text-zinc-300">
              <span className="text-zinc-500">ID de pago:</span>{" "}
              <span className="font-mono text-amber-400">{paymentId}</span>
            </p>
            <p className="text-sm text-zinc-300">
              <span className="text-zinc-500">Turno:</span>{" "}
              <span className="font-mono text-zinc-300">{turnoId.slice(0, 8)}...</span>
            </p>
          </div>
        )}

        {mostrarPendiente && paymentId && (
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4 text-left">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">
              Referencia
            </p>
            <p className="font-mono text-yellow-400 text-sm">{paymentId}</p>
          </div>
        )}

        {/* ==========================================
            BOTONES DE ACCIÓN POR ESTADO
        ========================================== */}

        <div className="flex flex-col gap-3">
          {mostrarExito && (
            <>
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
            </>
          )}

          {mostrarPendiente && (
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm"
            >
              Ver mis turnos
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}

          {mostrarFallo && (
            <>
              <Link
                href={`/turno?retry=${turnoId}`}
                className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm"
              >
                <RefreshCw className="w-5 h-5" />
                Intentar de nuevo
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-2xl transition-all text-sm"
              >
                Ver mis turnos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}

          {!mostrarExito && !mostrarPendiente && !mostrarFallo && (
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-2xl transition-all text-sm"
            >
              Ver mis turnos
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}