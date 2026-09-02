import AvisoErrorSinTurno from "@/components/pago/AvisoErrorSinTurno";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function AvisoEstadoPago() {
  return <div className="min-h-screen bg-[var(--page-bg)] text-[var(--page-bg-foreground)] flex items-center justify-center px-4">
    <AvisoErrorSinTurno />
    <div className="max-w-md w-full text-center space-y-4 bg-[var(--admin-surface)] border border-red-500/20 rounded-3xl p-8">
      <div className="flex justify-center"><XCircle className="w-16 h-16 text-red-500" /></div>
      <h1 className="text-2xl font-black uppercase tracking-tight">Error en la solicitud</h1>
      <p className="text-[var(--admin-texto-secundario)] text-sm">No pudimos encontrar una referencia de turno válida para verificar este pago.</p>
      <Link href="/" className="flex items-center justify-center gap-2 w-full bg-[var(--admin-item)] hover:bg-[var(--admin-item-hover)] text-[var(--admin-texto-primario)] font-medium py-3 rounded-2xl transition-all text-sm mt-4">Volver al inicio</Link>
    </div>
  </div>;
}
