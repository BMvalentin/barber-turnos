"use client";

import { softDeleteExcepcion } from "@/actions/excepcionesLaborales.actions";
import { Calendar, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Excepcion = {
  id: string;
  motivo: string;
  desde: Date;
  hasta: Date;
  estado: boolean;
  barbero?: {
    id: string;
    nombre: string;
  } | null;
};

export default function ExcepcionesList({ excepciones }: { excepciones: Excepcion[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de desactivar esta excepción?")) return;

    try {
      const formData = new FormData();
      formData.append("id", id);
      
      await softDeleteExcepcion(formData);
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
              
              <div className="flex items-center gap-2 mb-2 text-xs">
                {e.barbero ? (
                  <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <User className="h-3 w-3" /> {e.barbero.nombre}
                  </span>
                ) : (
                  <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">🌎 Global</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-amber-200/70">
                <span>Desde:</span>
                <span className="font-mono text-amber-400">
                  {new Date(e.desde).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
                <span>→</span>
                <span>Hasta:</span>
                <span className="font-mono text-amber-400">
                  {new Date(e.hasta).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
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