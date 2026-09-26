// components/admin/config/PaginaConfigSeccion.tsx
import { getPageConfig } from "@/actions/configuracion/leer-config.actions";
import GeneralConfigForm from "@/components/admin/config/GeneralConfigForm";
import { MODULOS_CONFIG, type IdModuloConfig } from "@/components/admin/config/modulos-config";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { redirect } from "next/navigation";

interface PaginaConfigSeccionProps {
  seccion: IdModuloConfig;
}

export default async function PaginaConfigSeccion({ seccion }: PaginaConfigSeccionProps) {
  if (!(await requerirAdmin())) redirect("/admin");

  const config = await getPageConfig();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-texto-primario)] md:text-[28px]">
        {MODULOS_CONFIG.find((modulo) => modulo.id === seccion)?.etiqueta ?? "Configuración"}
      </h1>
      <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
        Administrá la información y apariencia de tu barbería.
      </p>

      <div className="mt-8">
        <GeneralConfigForm initialData={config} seccionInicial={seccion} />
      </div>
    </div>
  );
}
