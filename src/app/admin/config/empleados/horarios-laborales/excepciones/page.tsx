import { FeriadosYCierresCliente } from "@/components/horarios/feriados-y-cierres/FeriadosYCierresCliente";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { obtenerBarberosParaSelector } from "@/lib/consultas/obtener-barberos-para-selector";
import { obtenerExcepcionesActivas } from "@/lib/consultas/obtener-excepciones-activas";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { redirect } from "next/navigation";

export default async function FeriadosYCierresPage() {
  if (!(await requerirAdmin())) redirect("/admin");

  const [excepciones, barberos] = await Promise.all([
    obtenerExcepcionesActivas(),
    obtenerBarberosParaSelector(),
  ]);

  return (
    <div className="admin-pagina">
      <Breadcrumb
        items={[
          { etiqueta: "Configuración", href: "/admin/config" },
          { etiqueta: "Horarios", href: "/admin/config/empleados/horarios-laborales" },
          { etiqueta: "Feriados y excepciones" },
        ]}
      />
      <header className="admin-encabezado">
        <div>
          <h1>Feriados y cierres</h1>
          <p>Bloqueá turnos cuando la barbería o alguien del equipo no atienda.</p>
        </div>
      </header>
      <FeriadosYCierresCliente excepciones={excepciones} barberos={barberos} />
    </div>
  );
}
