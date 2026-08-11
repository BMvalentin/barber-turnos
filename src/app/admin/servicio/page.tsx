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
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Gestión de Servicios
              </h1>
              <p className="text-[#8E8675]">
                Administra los cortes, arreglos de barba y tratamientos ofrecidos
                en la barbería.
              </p>
            </div>
          </div>
        </div>

        {/* Lista de servicios - Abajo */}
        <div>
          <ServicioList
            servicios={servicios}
            barberos={barberos}
          />
        </div>
      </div>
    </div>
  );
}