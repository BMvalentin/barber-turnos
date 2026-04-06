"use client";

import { softDeleteExcepcion } from "@/actions/excepcionesLaborales.actions";
import { Calendar, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Excepcion = {
  id: string;
  motivo: string;
  desde: Date;
  hasta: Date;
  estado: boolean;
};

export default function ExcepcionesList({ excepciones }: { excepciones: Excepcion[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de desactivar esta excepción?")) return;

    try {
      await softDeleteExcepcion(id);
      toast.success("Excepción desactivada correctamente");
      router.refresh();
    } catch (error) {
      toast.error("Error al desactivar la excepción");
    }
  };
  
  if (!excepciones.length) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-16 w-16 text-amber-500/30 mx-auto mb-4" />
        <p className="text-amber-200/70">
          No hay excepciones registradas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {excepciones.map((e) => (
        <div
          key={e.id}
          className="bg-black/60 border border-amber-900/30 rounded-lg p-4 hover:border-amber-500/50 transition-all"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-amber-500" />
                <p className="text-white font-semibold">{e.motivo}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-amber-200/70">
                <span>Desde:</span>
                <span className="font-mono text-amber-400">
                  {new Date(e.desde).toLocaleDateString('es-AR')}
                </span>
                <span>→</span>
                <span>Hasta:</span>
                <span className="font-mono text-amber-400">
                  {new Date(e.hasta).toLocaleDateString('es-AR')}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleDelete(e.id)}
              className="flex items-center gap-2 text-red-400 border border-red-500/50 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-semibold"
            >
              <Trash2 className="h-4 w-4" />
              Desactivar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}