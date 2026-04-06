import { getServicios } from "@/actions/servicio-actions";
import { getBarberos } from "@/actions/barbero.actions";
import ServicioList from "@/components/servicio/ServicioList";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ServiciosPage() {
  const [resultServicios, resultBarberos] = await Promise.all([
    getServicios(),
    getBarberos(),
  ]);

  const servicios = resultServicios.success
    ? JSON.parse(JSON.stringify(resultServicios.data))
    : [];
  const barberos = resultBarberos.success
    ? JSON.parse(JSON.stringify(resultBarberos.data))
    : [];

  return (
    // Contenedor principal con el mismo fondo y padding que en Barberos
    <div className="min-h-screen bg-gradient-to-br from-black to-amber-950/30 p-6">
      {/* Contenedor centralizado con el mismo margen superior */}
      <div className="container mx-auto max-w-7xl mt-20">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-amber-600/20 rounded-lg transition-all group"
              title="Volver al Dashboard"
            >
              <ArrowLeft className="h-6 w-6 text-amber-500 group-hover:text-amber-400 group-hover:-translate-x-1 transition-all" />
            </Link>

            <div>
              <h1 className="text-3xl font-bold text-white">
                Gestión de Servicios
              </h1>
              <p className="text-amber-200/70">
                Administra los cortes, arreglos de barba y tratamientos ofrecidos
                en la barbería.
              </p>
            </div>
          </div>
        </div>

        {/* Lista de servicios - Abajo */}
        <div>
          <ServicioList servicios={servicios} barberos={barberos} />
        </div>
      </div>
    </div>
  );
}
