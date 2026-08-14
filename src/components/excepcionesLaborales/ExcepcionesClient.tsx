"use client";

import ExcepcionForm from "@/components/excepcionesLaborales/ExcepcionesForm";
import ExcepcionesList from "@/components/excepcionesLaborales/ExcepcionesList";
import type { ExcepcionLaboral } from "@/types/excepcion";
import type { Barbero } from "@/types/barbero";

type ExcepcionesClientProps = {
  excepciones: ExcepcionLaboral[];
  barberos: Barbero[];
}

export default function ExcepcionesClient({ excepciones, barberos }: ExcepcionesClientProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Formulario de creación */}
      <div className="lg:col-span-1">
        <div className="bg-black/40 backdrop-blur-lg rounded-xl shadow-lg border border-amber-900/30 p-6 sticky top-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Nueva Excepción</h2>
          <ExcepcionForm
            barberos={barberos}
          />
        </div>
      </div>

      {/* Lista de excepciones */}
      <div className="lg:col-span-2">
        <div className="bg-black/40 backdrop-blur-lg rounded-xl shadow-lg border border-amber-900/30 p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Excepciones Registradas ({excepciones.length})
          </h2>
          <ExcepcionesList excepciones={excepciones} />
        </div>
      </div>
    </div>
  );
}