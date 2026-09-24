import Link from "next/link";
import { Suspense } from "react";
import { obtenerEstadoConexionMP } from "@/actions/mercadopago/estado-conexion.actions";
import { getPageConfig } from "@/actions/configuracion/leer-config.actions";
import MercadoPagoConnectionPanel from "@/components/admin/MercadoPagoConnectionPanel";
import GeneralConfigForm from "@/components/admin/config/GeneralConfigForm";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { redirect } from "next/navigation";

type PestañaMediosPago = "transferencia" | "mercado-pago";

interface MediosPagoConfigPageProps {
  searchParams: Promise<{ tab?: string | string[] }>;
}

function obtenerPestañaActiva(valor: string | string[] | undefined): PestañaMediosPago {
  const tab = Array.isArray(valor) ? valor[0] : valor;
  return tab === "mercado-pago" ? "mercado-pago" : "transferencia";
}

export default async function MediosPagoConfigPage({ searchParams }: MediosPagoConfigPageProps) {
  if (!(await requerirAdmin())) redirect("/admin");

  const parametros = await searchParams;
  const pestañaActiva = obtenerPestañaActiva(parametros.tab);
  const [configuracion, estadoConexion] = await Promise.all([
    pestañaActiva === "transferencia" ? getPageConfig() : Promise.resolve(null),
    pestañaActiva === "mercado-pago" ? obtenerEstadoConexionMP() : Promise.resolve(null),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-texto-primario)] md:text-[28px]">
        Medios de pago
      </h1>
      <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
        Configurá las opciones de pago que ofrecés a tus clientes.
      </p>

      <nav
        aria-label="Medios de pago"
        role="tablist"
        className="mt-8 flex w-full border-b border-[var(--admin-border)]"
      >
        <Link
          id="tab-transferencia"
          href="/admin/config/medios-pago"
          role="tab"
          aria-selected={pestañaActiva === "transferencia"}
          aria-controls="panel-transferencia"
          scroll={false}
          className={`-mb-px min-w-0 flex-1 whitespace-nowrap border-b-2 px-4 py-3 text-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] ${
            pestañaActiva === "transferencia"
              ? "border-[var(--page-primary)] text-[var(--admin-texto-primario)]"
              : "border-transparent text-[var(--admin-texto-muted)] hover:border-[var(--admin-border-fuerte)] hover:text-[var(--admin-texto-primario)]"
          }`}
        >
          Transferencia
        </Link>
        <Link
          id="tab-mercado-pago"
          href="/admin/config/medios-pago?tab=mercado-pago"
          role="tab"
          aria-selected={pestañaActiva === "mercado-pago"}
          aria-controls="panel-mercado-pago"
          scroll={false}
          className={`-mb-px min-w-0 flex-1 whitespace-nowrap border-b-2 px-4 py-3 text-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] ${
            pestañaActiva === "mercado-pago"
              ? "border-[var(--page-primary)] text-[var(--admin-texto-primario)]"
              : "border-transparent text-[var(--admin-texto-muted)] hover:border-[var(--admin-border-fuerte)] hover:text-[var(--admin-texto-primario)]"
          }`}
        >
          Mercado Pago
        </Link>
      </nav>

      {pestañaActiva === "transferencia" && (
        <section id="panel-transferencia" role="tabpanel" aria-labelledby="tab-transferencia">
          <GeneralConfigForm initialData={configuracion} seccionInicial="medios-pago" />
        </section>
      )}

      {pestañaActiva === "mercado-pago" && estadoConexion && (
        <section id="panel-mercado-pago" role="tabpanel" aria-labelledby="tab-mercado-pago" className="mt-8">
          <Suspense
            fallback={
              <p className="text-[var(--admin-texto-muted)]">
                Cargando estado de conexión...
              </p>
            }
          >
            <MercadoPagoConnectionPanel estadoInicial={estadoConexion} />
          </Suspense>
        </section>
      )}
    </div>
  );
}
