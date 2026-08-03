import { prisma } from "@/lib/prisma";
import ExcepcionesClient from "@/components/excepcionesLaborales/ExcepcionesClient";
import { Calendar } from "lucide-react";
import { getBarberos } from "@/actions/barbero.actions";
import { getPageConfig } from "@/actions/configPage";

async function getExcepciones() {
  return await prisma.excepcion_laboral.findMany({
    where: { 
      estado: true 
    },
    include: { 
      barbero: {
        select: {
          id: true,
          nombre: true
        }
      }
    },
    orderBy: { 
      desde: "desc" 
    },
  });
}

export default async function ExcepcionesLaboralesPage() {
  // Obtenemos los colores configurados desde la base de datos
  const config = await getPageConfig();
  const primaryColor = config?.primaryColor || "#3b82f6";
  const secondaryColor = config?.secondaryColor || "#1e3a8a";

  const [excepciones, responseBarberos] = await Promise.all([getExcepciones(), getBarberos()]);
  const barberos = responseBarberos.success ? responseBarberos.data : [];

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl mt-20">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-xl border-2"
              style={{ 
                backgroundColor: `${primaryColor}20`,
                borderColor: `${primaryColor}40` 
              }}
            >
              <Calendar className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Excepciones Laborales
              </h1>
              <p style={{ color: `${primaryColor}b3` }}>
                Gestiona feriados y días no laborables
              </p>
            </div>
          </div>
        </div>

        <ExcepcionesClient 
          excepciones={excepciones} 
          barberos={barberos} 
          primaryColor={primaryColor} 
          secondaryColor={secondaryColor} 
        />
      </div>
    </div>
  );
}