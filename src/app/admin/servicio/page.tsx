import { getServicios } from "@/actions/servicio-actions";
import { getBarberos } from "@/actions/barbero.actions";
import { getPageConfig } from "@/actions/configPage"; 
import ServicioList from "@/components/servicio/ServicioList";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ServiciosPage() {
  const [resultServicios, resultBarberos, config] = await Promise.all([
    getServicios(),
    getBarberos(),
    getPageConfig(), // Obtenemos la configuración de la BD como veníamos haciendo
  ]);

  const servicios = resultServicios.success
    ? JSON.parse(JSON.stringify(resultServicios.data))
    : [];
  const barberos = resultBarberos.success
    ? JSON.parse(JSON.stringify(resultBarberos.data))
    : [];

  const primaryColor = config?.primaryColor || "#d97706";

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl mt-20">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 rounded-lg transition-all group hover:bg-black/40"
              style={{
                ['--hover-bg' as string]: `${primaryColor}20`,
              }}
              title="Volver al Dashboard"
            >
              <ArrowLeft 
                className="h-6 w-6 transition-all group-hover:-translate-x-1" 
                style={{ color: primaryColor }}
              />
            </Link>

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
            config={{ primaryColor }} 
          />
        </div>
      </div>
    </div>
  );
}