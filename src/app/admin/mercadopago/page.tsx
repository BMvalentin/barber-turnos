import { Suspense } from "react";
import { obtenerEstadoConexionMP } from "@/actions/mercadopago/estado-conexion.actions";
import { obtenerEstadoConfiguracionOAuth } from "@/actions/mercadopago/estado-oauth.actions";
import MercadoPagoConnectionPanel from "@/components/admin/MercadoPagoConnectionPanel";

export default async function PaginaConfiguracionMercadoPago() {
  const [estadoConexion, configuracionOAuth] = await Promise.all([
    obtenerEstadoConexionMP(),
    obtenerEstadoConfiguracionOAuth(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-[28px] text-[var(--admin-texto-primario)]">
          Mercado Pago
        </h1>
        <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
          Estado de la conexión y cobros.
        </p>
      </div>

      <Suspense
        fallback={
          <p className="text-[var(--admin-texto-muted)]">
            Cargando estado de conexión...
          </p>
        }
      >
        <MercadoPagoConnectionPanel
          estadoInicial={estadoConexion}
          configuracionOAuth={configuracionOAuth}
        />
      </Suspense>
    </div>
  );
}