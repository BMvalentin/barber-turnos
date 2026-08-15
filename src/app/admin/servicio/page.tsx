import { getServicios } from "@/actions/servicios/listar.actions";
import { getBarberos } from "@/actions/barberos/listar.actions";
import ServicioList from "@/components/servicio/ServicioList";
import { serializarDatos } from "@/lib/utils/serializar-datos";

export default async function ServiciosPage() {
  const [resultServicios, resultBarberos] = await Promise.all([
    getServicios(),
    getBarberos(),
  ]);

  const servicios = resultServicios.success
    ? serializarDatos(resultServicios.data ?? [])
    : [];
  const barberos = resultBarberos.success
    ? serializarDatos(resultBarberos.data ?? [])
    : [];

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
        <ServicioList
          servicios={servicios}
          barberos={barberos}
        />
      </div>
    </div>
  );
}