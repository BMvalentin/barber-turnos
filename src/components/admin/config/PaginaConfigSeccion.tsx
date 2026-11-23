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
  const modulo = MODULOS_CONFIG.find((modulo) => modulo.id === seccion);

  return (
    <div className="admin-pagina max-w-5xl">
      <header className="admin-encabezado">
        <div>
          <h1>{modulo?.etiqueta ?? "Configuración"}</h1>
          <p>{modulo?.descripcion}</p>
        </div>
      </header>
      <GeneralConfigForm initialData={config} seccionInicial={seccion} />
    </div>
  );
}
