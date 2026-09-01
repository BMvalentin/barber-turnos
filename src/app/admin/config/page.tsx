// app/admin/config/page.tsx
import { getPageConfig } from "@/actions/configuracion/leer-config.actions";
import GeneralConfigForm from "@/components/admin/config/GeneralConfigForm";
import TarjetaHorariosBarberos from "@/components/admin/config/TarjetaHorariosBarberos";

export default async function ConfigPage() {
  const config = await getPageConfig();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-texto-primario)] md:text-[28px]">
        Configuración
      </h1>
      <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
        Administrá la información y apariencia de tu barbería.
      </p>

      <div className="mt-8 space-y-8">
        <TarjetaHorariosBarberos />
        <GeneralConfigForm initialData={config} />
      </div>
    </div>
  );
}
