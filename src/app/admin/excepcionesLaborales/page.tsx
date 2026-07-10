import { prisma } from "@/lib/prisma";
import ExcepcionesClient from "@/components/excepcionesLaborales/ExcepcionesClient";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { getBarberos } from "@/actions/barbero.actions";

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
  const session = await auth();
  const [excepciones, responseBarberos] = await Promise.all([getExcepciones(), getBarberos()]);
  const barberos = responseBarberos.success ? responseBarberos.data : [];

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl mt-20">
        {/* Header con flecha de regreso */}
        <div className="mb-8 flex items-center gap-4">
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="p-2 hover:bg-amber-600/20 rounded-lg transition-all group"
              title="Volver al Dashboard"
            >
              <ArrowLeft className="h-6 w-6 text-amber-500 group-hover:text-amber-400 group-hover:-translate-x-1 transition-all" />
            </Link>
          )}

          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl border-2 border-amber-500/30">
              <Calendar className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Excepciones Laborales
              </h1>
              <p className="text-amber-200/70">
                Gestiona feriados y días no laborables
              </p>
            </div>
          </div>
        </div>

        <ExcepcionesClient excepciones={excepciones} barberos={barberos} />
      </div>
    </div>
  );
}