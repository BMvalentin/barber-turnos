import { Suspense } from "react";
import { CreditCard } from "lucide-react";
import {
  obtenerEstadoConexionMP,
  obtenerEstadoConfiguracionOAuth,
} from "@/actions/mercadopago-oauth.actions";
import MercadoPagoConnectionPanel from "@/components/admin/MercadoPagoConnectionPanel";

export default async function PaginaConfiguracionMercadoPago() {
  const [estadoConexion, configuracionOAuth] = await Promise.all([
    obtenerEstadoConexionMP(),
    obtenerEstadoConfiguracionOAuth(),
  ]);

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[var(--page-primary)]/20 rounded-xl border-2 border-[var(--page-primary)]/30">
              <CreditCard className="h-8 w-8 text-[var(--page-primary)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Mercado Pago</h1>
              <p className="text-amber-200/70">
                Conectá tu cuenta para poder cobrar las señas de los turnos
              </p>
            </div>
          </div>
        </div>

        <Suspense
          fallback={
            <p className="text-amber-200/50">Cargando estado de conexión...</p>
          }
        >
          <MercadoPagoConnectionPanel
            estadoInicial={estadoConexion}
            configuracionOAuth={configuracionOAuth}
          />
        </Suspense>
      </div>
    </div>
  );
}