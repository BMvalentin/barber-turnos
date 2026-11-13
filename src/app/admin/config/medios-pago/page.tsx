import Link from "next/link";
import { Suspense } from "react";
import { obtenerEstadoConexionMP } from "@/actions/mercadopago/estado-conexion.actions";
import { getPageConfig } from "@/actions/configuracion/leer-config.actions";
import MercadoPagoConnectionPanel from "@/components/admin/MercadoPagoConnectionPanel";
import GeneralConfigForm from "@/components/admin/config/GeneralConfigForm";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { redirect } from "next/navigation";

type PestañaMediosPago = "ajustes" | "transferencia" | "mercado-pago";

const PESTAÑAS_PAGO: Array<{ id: PestañaMediosPago; etiqueta: string; href: string }> = [
  { id: "ajustes", etiqueta: "Ajustes", href: "/admin/config/medios-pago" },
  {
    id: "transferencia",
    etiqueta: "Transferencia",
    href: "/admin/config/medios-pago?tab=transferencia",
  },
  {
    id: "mercado-pago",
    etiqueta: "Mercado Pago",
    href: "/admin/config/medios-pago?tab=mercado-pago",
  },
];

interface MediosPagoConfigPageProps {
  searchParams: Promise<{ tab?: string | string[] }>;
}

function obtenerPestañaActiva(valor: string | string[] | undefined): PestañaMediosPago {
  const tab = Array.isArray(valor) ? valor[0] : valor;
  if (tab === "transferencia" || tab === "mercado-pago") return tab;
  return "ajustes";
}

export default async function MediosPagoConfigPage({ searchParams }: MediosPagoConfigPageProps) {
  if (!(await requerirAdmin())) redirect("/admin");

  const parametros = await searchParams;
  const pestañaActiva = obtenerPestañaActiva(parametros.tab);
  const [configuracion, estadoConexion] = await Promise.all([
    pestañaActiva !== "mercado-pago" ? getPageConfig() : Promise.resolve(null),
    pestañaActiva === "mercado-pago" ? obtenerEstadoConexionMP() : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-texto-primario)] md:text-[28px]">
          Configuración de pagos
        </h1>
        <p className="text-sm leading-6 text-[var(--admin-texto-muted)]">
          Administrá los ajustes y medios de pago que ofrecés a tus clientes.
        </p>
      </header>

      <nav
        aria-label="Configuración de pagos"
        role="tablist"
        className="mt-8 flex w-full max-w-4xl gap-1 border-b border-[var(--admin-border)]"
      >
        {PESTAÑAS_PAGO.map((pestaña) => (
          <Link
            key={pestaña.id}
            id={`tab-${pestaña.id}`}
            href={pestaña.href}
            role="tab"
            aria-selected={pestañaActiva === pestaña.id}
            aria-controls={`panel-${pestaña.id}`}
            scroll={false}
            className={`-mb-px min-w-0 flex-1 whitespace-nowrap border-b-2 px-1 py-3 text-center text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] sm:px-4 sm:text-sm ${
              pestañaActiva === pestaña.id
                ? "border-[var(--page-primary)] text-[var(--admin-texto-primario)]"
                : "border-transparent text-[var(--admin-texto-muted)] hover:border-[var(--admin-border-fuerte)] hover:text-[var(--admin-texto-primario)]"
            }`}
          >
            {pestaña.etiqueta}
          </Link>
        ))}
      </nav>

      {pestañaActiva === "ajustes" && (
        <section
          id="panel-ajustes"
          role="tabpanel"
          aria-labelledby="tab-ajustes"
          className="mt-6 max-w-4xl"
        >
          <GeneralConfigForm initialData={configuracion} seccionInicial="ajustes-pago" />
        </section>
      )}

      {pestañaActiva === "transferencia" && (
        <section id="panel-transferencia" role="tabpanel" aria-labelledby="tab-transferencia">
          <GeneralConfigForm initialData={configuracion} seccionInicial="medios-pago" />
        </section>
      )}

      {pestañaActiva === "mercado-pago" && estadoConexion && (
        <section
          id="panel-mercado-pago"
          role="tabpanel"
          aria-labelledby="tab-mercado-pago"
          className="mt-8 max-w-4xl"
        >
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
