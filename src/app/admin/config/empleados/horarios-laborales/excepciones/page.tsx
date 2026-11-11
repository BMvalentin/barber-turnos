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
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { etiqueta: "Configuración", href: "/admin/config" },
          { etiqueta: "Horarios", href: "/admin/config/empleados/horarios-laborales" },
          { etiqueta: "Feriados y excepciones" },
        ]}
      />
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-texto-primario)] md:text-[28px]">
          Feriados y cierres
        </h1>
        <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
          Definí los días o rangos en los que la barbería o un profesional no atienden.
        </p>
      </section>
      <FeriadosYCierresCliente excepciones={excepciones} barberos={barberos} />
    </div>
  );
}
