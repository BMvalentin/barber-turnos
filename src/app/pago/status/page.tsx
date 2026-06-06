import Link from "next/link";
import { confirmarPagoTurno } from "@/actions/mercadopago-actions";
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Calendar, ArrowRight, Ticket } from "lucide-react";

interface StatusPageProps {
  searchParams: Promise<{
    status?: string;
    turnoId?: string;
    payment_id?: string;
    collection_id?: string; // Por si MP envía este fallback
  }>;
}

export default async function PagoStatusPage({ searchParams }: StatusPageProps) {
  const { status, turnoId, payment_id, collection_id } = await searchParams;
  
  // Mercado Pago puede inyectar tanto payment_id como collection_id según el tipo de Checkout
  const paymentId = payment_id || collection_id;

  // Validación de seguridad inicial
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

  // Si el estado que devuelve la URL es exitoso, disparamos el doble check seguro en el servidor
  const transaccionExitosa = status === "success";
  if (transaccionExitosa && paymentId) {
    await confirmarPagoTurno(turnoId, paymentId);
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* ========================================== */}
        {/* RENDER CONDICIONAL DE ÍCONOS Y TÍTULOS     */}
        {/* ========================================== */}
        
        {status === "success" && (
          <>
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center animate-pulse">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                ¡Seña Pagada!
              </h1>
              <p className="text-zinc-400">
                Tu turno quedó confirmado en nuestro sistema. ¡Te esperamos!
              </p>
            </div>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-yellow-500/20 border-2 border-yellow-500/40 flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-yellow-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                Pago Pendiente
              </h1>
              <p className="text-zinc-400">
                Mercado Pago está procesando la transacción. Te avisaremos cuando se acredite.
              </p>
            </div>
          </>
        )}

        {status === "failure" && (
          <>
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                Pago Rechazado
              </h1>
              <p className="text-zinc-400">
                No se pudo realizar el cobro. Podés reintentar el pago desde tu panel.
              </p>
            </div>
          </>
        )}

        {!["success", "pending", "failure"].includes(status || "") && (
          <>
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
                <HelpCircle className="w-12 h-12 text-zinc-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                Estado Desconocido
              </h1>
              <p className="text-zinc-400">
                No pudimos determinar el estado final. Revisá tu panel de control.
              </p>
            </div>
          </>
        )}

        {/* ========================================== */}
        {/* COMPROBANTE / TICKET DETALLADO             */}
        {/* ========================================== */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-5 text-left space-y-4 relative overflow-hidden">
          {/* Efecto decorativo de corte de ticket clásico */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[linear-gradient(to_right,#000_0%,#000_50%,transparent_50%,transparent_100%)] bg-[length:10px_1px]"></div>
          
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-black flex items-center gap-1.5">
              <Ticket className="w-3..5 h-3.5 text-amber-400" /> Comprobante de Operación
            </p>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              status === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
              status === "pending" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
              "bg-zinc-800 text-zinc-400"
            }`}>
              {status ?? "unknown"}
            </span>
          </div>

          <div className="space-y-2">
            {paymentId && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">ID de Pago MP:</span>
                <span className="font-mono text-amber-400 font-semibold">{paymentId}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">Referencia Turno:</span>
              <span className="font-mono text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded border border-white/5 text-xs">
                {turnoId}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-t border-white/5 pt-2 mt-2">
              <span className="text-zinc-400 font-medium">Concepto:</span>
              <span className="text-zinc-200 text-right font-medium">Reserva de Seña</span>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* BOTONES DE ACCIÓN                          */}
        {/* ========================================== */}
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm shadow-lg shadow-amber-500/10"
          >
            <Calendar className="w-5 h-5" />
            Ver mis turnos
          </Link>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold py-3.5 rounded-2xl border border-white/5 transition-all text-sm"
          >
            Volver al inicio
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}