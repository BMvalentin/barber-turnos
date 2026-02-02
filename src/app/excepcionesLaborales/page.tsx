import { getExcepciones } from "@/actions/excepcionesLaborales.actions";
import ExcepcionesClient from "@/components/excepcionesLaborales/ExcepcionesClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ExcepcionesLaboralesPage() {
  const result = await getExcepciones();

  // Si hay error, mostrar mensaje
  if (!result.success) {
    return (
      <div className="min-h-screen from-primary to-primary/60 bg-clip-text text-primary py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {result.error}
          </div>
        </div>
      </div>
    );
  }

  const excepciones = result.data || [];

  return (
    <div className="min-h-screen from-primary to-primary/60 bg-clip-text text-primary py-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          
          <div className="flex flex-row flex-wrap justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Excepciones Laborales
            </h1>
            <Link href="/diaLaboral"><Button variant={"celeste"}>Volver a dias laborales</Button></Link>
          </div>
          <p className="text-gray-600 mt-2">
            Gestiona los días y horarios en los que no se trabaja
          </p>
        </div>

        {/* Client Component que maneja la interactividad */}
        <ExcepcionesClient excepciones={excepciones} />
      </div>
    </div>
  );
}