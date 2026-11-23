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
    <div className="admin-pagina max-w-5xl">
      <header className="admin-encabezado">
        <div>
          <h1>Configuración de pagos</h1>
          <p>Administrá los medios de pago y los avisos que ven tus clientes.</p>
        </div>
      </header>

      <nav
        aria-label="Configuración de pagos"
        className="grid w-full max-w-md grid-cols-3 gap-1 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-1"
      >
        {PESTAÑAS_PAGO.map((pestaña) => (
          <Link
            key={pestaña.id}
            id={`tab-${pestaña.id}`}
            href={pestaña.href}
            aria-current={pestañaActiva === pestaña.id ? "page" : undefined}
            scroll={false}
            className={`grid min-h-11 min-w-0 place-items-center rounded-lg border px-1 text-center text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--page-focus-ring)] sm:px-3 sm:text-sm ${
              pestañaActiva === pestaña.id
                ? "border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--page-primary-tinta)] shadow-sm"
                : "border-transparent text-[var(--admin-texto-secundario)] hover:text-[var(--admin-texto-primario)]"
            }`}
          >
            {pestaña.etiqueta}
          </Link>
        ))}
      </nav>

      {pestañaActiva === "ajustes" && (
        <section
          id="panel-ajustes"
          aria-labelledby="tab-ajustes"
        >
          <GeneralConfigForm initialData={configuracion} seccionInicial="ajustes-pago" />
        </section>
      )}

      {pestañaActiva === "transferencia" && (
        <section id="panel-transferencia" aria-labelledby="tab-transferencia">
          <GeneralConfigForm initialData={configuracion} seccionInicial="medios-pago" />
        </section>
      )}

      {pestañaActiva === "mercado-pago" && estadoConexion && (
        <section
          id="panel-mercado-pago"
          aria-labelledby="tab-mercado-pago"
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
