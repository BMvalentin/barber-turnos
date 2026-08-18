import { prisma } from "@/lib/prisma";
import ExcepcionesClient from "@/components/excepcionesLaborales/ExcepcionesClient";
import { getBarberos } from "@/actions/barberos/listar.actions";

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
  const [excepciones, responseBarberos] = await Promise.all([getExcepciones(), getBarberos()]);
  const barberos = responseBarberos.success ? (responseBarberos.data ?? []) : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-[28px] text-[var(--admin-texto-primario)]">
          Excepciones Laborales
        </h1>
        <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
          Días y rangos en los que no se atiende.
        </p>
      </div>

      <ExcepcionesClient 
        excepciones={excepciones} 
        barberos={barberos} 
      />
    </div>
  );
}