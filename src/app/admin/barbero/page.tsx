import { obtenerServiciosActivos } from "@/lib/consultas/obtener-servicios-activos";
import { obtenerDiasLaboralesActivos } from "@/lib/consultas/obtener-dias-laborales-activos";
import { obtenerBarberosConRelaciones } from "@/lib/consultas/obtener-barberos-con-relaciones";

import BarberoList from "@/components/barbero/BarberoList";
import CreateBarberoModal from "@/components/barbero/CreateBarberoModal";

async function getData() {
  const [servicios, diasLaborales, barberos] = await Promise.all([
    obtenerServiciosActivos(),
    obtenerDiasLaboralesActivos(),
    obtenerBarberosConRelaciones(),
  ]);

  const serializedBarberos = barberos.map(barbero => ({
    ...barbero,
    servicios: barbero.servicios.map(sb => ({
      ...sb,
      servicio: {
        ...sb.servicio,
        precio: Number(sb.servicio.precio),
        senia: sb.servicio.senia ? Number(sb.servicio.senia) : null,
        descuento: sb.servicio.descuento ? Number(sb.servicio.descuento) : null,
      }
    }))
  }));

  return {
    servicios: servicios.map((s) => ({ id: s.id, nombre: s.nombre })),
    diasLaborales,
    barberos: serializedBarberos,
  };
}

export default async function BarberosPage() {
  const { servicios, diasLaborales, barberos } = await getData();

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          
          {/* IZQUIERDA */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Gestión de Barberos
              </h1>
              <p style={{ color: "var(--page-primary-80)" }}>
                Administra los barberos y sus horarios
              </p>
            </div>
          </div>

          {/* DERECHA → BOTÓN MODAL (PASANDO CONFIG) */}
          <CreateBarberoModal
            servicios={servicios}
            diasLaborales={diasLaborales}
          />
        </div>

        {/* LISTA */}
        <BarberoList 
          barberos={barberos} 
          servicios={servicios} 
          diasLaborales={diasLaborales} 
        />

      </div>
    </div>
  );
}