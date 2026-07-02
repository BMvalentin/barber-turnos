"use client";
import { useState } from "react";
import { softDeleteExcepcion } from "@/actions/excepcionesLaborales.actions";
import { Calendar, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-modal";

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
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [elementoAEliminar, setElementoAEliminar] = useState<string | null>(null);

  const handleEliminar = (id: string) => {
    setElementoAEliminar(id);
    setMostrarConfirmacion(true);
  };

  const cancelarAccion = () => {
    setMostrarConfirmacion(false);
    setElementoAEliminar(null);
  };

  const confirmarAccion = async () => {
    if (!elementoAEliminar) return;

    try {
      const formData = new FormData();
      formData.append("id", elementoAEliminar);
      setMostrarConfirmacion(false);
      setElementoAEliminar(null);

      await softDeleteExcepcion(formData);
      toast({
        title: "Excepción desactivada",
        description: "La excepción ha sido desactivada correctamente.",
        variant: "default",
        duration: 4000,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo desactivar la excepción.",
        variant: "destructive",
        duration: 4000,
      });
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
      {excepciones.map((excepcion) => (
        <div
          key={excepcion.id}
          className="bg-black/60 border border-amber-900/30 rounded-lg p-4 hover:border-amber-500/50 transition-all"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-amber-500" />
                <p className="text-white font-semibold">{excepcion.motivo}</p>
              </div>

              <div className="flex items-center gap-2 mb-2 text-xs">
                {excepcion.barbero ? (
                  <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <User className="h-3 w-3" /> {excepcion.barbero.nombre}
                  </span>
                ) : (
                  <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">🌎 Global</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-amber-200/70">
                <span>Desde:</span>
                <span className="font-mono text-amber-400">
                  {new Date(excepcion.desde).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
                <span>→</span>
                <span>Hasta:</span>
                <span className="font-mono text-amber-400">
                  {new Date(excepcion.hasta).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            </div>

            {/* Botón que dispara la apertura del modal de confirmación */}
            <button
              type="button"
              onClick={() => handleEliminar(excepcion.id)}
              className="flex items-center gap-2 text-red-400 border border-red-500/50 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-semibold"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
        </div>
      ))}

      {/* Modal de confirmación, único para toda la lista */}
      {mostrarConfirmacion && (
        <ConfirmDialog
          title="Eliminar excepción"
          message="¿Estás seguro de eliminar esta excepción?"
          onConfirm={confirmarAccion}
          onCancel={cancelarAccion}
        />
      )}
    </div>
  );
}