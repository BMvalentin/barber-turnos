import { getServicios } from "@/actions/servicios/listar.actions";
import ServicioList from "@/components/servicio/ServicioList";

export default async function ServiciosPage() {
  const resultServicios = await getServicios();

  const servicios = resultServicios.success ? resultServicios.data ?? [] : [];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-[28px] text-[var(--admin-texto-primario)]">
          Gestión de Servicios
        </h1>
        <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
          Creá, editá y organizá los servicios de tu barbería.
        </p>
      </div>

      {/* Lista de servicios - Abajo */}
      <div>
        <ServicioList servicios={servicios} />
      </div>
    </div>
  );
}
