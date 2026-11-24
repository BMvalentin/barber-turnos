import AvisoErrorSinTurno from "@/components/pago/AvisoErrorSinTurno";
import { CLASE_ACCION_SECUNDARIA, CLASE_ICONO_ESTADO, CLASE_VISTA_PAGO } from "@/components/pago/estilos-estado-pago";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function AvisoEstadoPago() {
  return <main className={CLASE_VISTA_PAGO}>
    <AvisoErrorSinTurno />
    <div className="w-full max-w-md space-y-4 rounded-xl bg-[var(--admin-surface)] p-5 text-center sm:p-8">
      <div className={`${CLASE_ICONO_ESTADO} bg-red-100 text-red-800`}><XCircle className="size-8" aria-hidden="true" /></div>
      <h1 className="text-balance text-2xl font-black tracking-tight">Error en la solicitud</h1>
      <p className="text-[var(--admin-texto-secundario)] text-sm">No pudimos encontrar una referencia de turno válida para verificar este pago.</p>
      <Link href="/" className={CLASE_ACCION_SECUNDARIA}>Volver al inicio</Link>
    </div>
  </main>;
}
