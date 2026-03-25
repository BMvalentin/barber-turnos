// ============================================================
// app/pago/failure/page.tsx
// ============================================================
import Link from "next/link";
import { XCircle, RefreshCw, ArrowRight } from "lucide-react";

interface SearchParams {
  turnoId?: string;
  payment_id?: string;
}

export default async function PagoFailurePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const turnoId = searchParams.turnoId;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">

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

        <div className="flex flex-col gap-3">
          {turnoId && (
            <Link
              href={`/turno?retry=${turnoId}`}
              className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm"
            >
              <RefreshCw className="w-5 h-5" />
              Intentar de nuevo
            </Link>
          )}
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-2xl transition-all text-sm"
          >
            Ver mis turnos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}


// ============================================================
// app/pago/pending/page.tsx
// ============================================================
// import Link from "next/link";
// import { Clock, ArrowRight } from "lucide-react";

// export default async function PagoPendingPage({
//   searchParams,
// }: {
//   searchParams: { turnoId?: string };
// }) {
//   return (
//     <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
//       <div className="max-w-md w-full text-center space-y-6">

//         <div className="flex justify-center">
//           <div className="w-24 h-24 rounded-full bg-yellow-500/20 border-2 border-yellow-500/40 flex items-center justify-center">
//             <Clock className="w-12 h-12 text-yellow-400" />
//           </div>
//         </div>

//         <div>
//           <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
//             Pago Pendiente
//           </h1>
//           <p className="text-zinc-400">
//             Tu pago está siendo procesado. Te notificaremos cuando se acredite.
//           </p>
//         </div>

//         <Link
//           href="/dashboard"
//           className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm"
//         >
//           Ver mis turnos
//           <ArrowRight className="w-5 h-5" />
//         </Link>
//       </div>
//     </div>
//   );
// }