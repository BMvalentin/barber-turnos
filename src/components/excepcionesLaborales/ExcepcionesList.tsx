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
          className="bg-black/60 border border-amber-900/30 rounded-lg p-3 sm:p-4 hover:border-amber-500/50 transition-all space-y-3"
        >
          {/* Cabecera: usamos flex-wrap para que el barbero baje si no hay espacio */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-white font-semibold truncate">{excepcion.motivo}</p>
            </div>

            {excepcion.barbero ? (
              <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full text-[10px] border border-amber-500/20 whitespace-nowrap">
                <User className="h-3 w-3" /> {excepcion.barbero.nombre}
              </span>
            ) : (
              <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full text-[10px] border border-blue-500/20">Global</span>
            )}
          </div>

          {/* Grilla de fechas: usamos text-xs y menos padding en móviles */}
          <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
            <div className="bg-amber-950/20 p-2 rounded border border-amber-900/20">
              <p className="text-amber-200/50 uppercase mb-0.5">Desde</p>
              <p className="text-amber-400 font-mono font-medium">
                {new Date(excepcion.desde).toLocaleDateString('es-AR')}
              </p>
              <p className="text-white">
                {new Date(excepcion.desde).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="bg-amber-950/20 p-2 rounded border border-amber-900/20">
              <p className="text-amber-200/50 uppercase mb-0.5">Hasta</p>
              <p className="text-amber-400 font-mono font-medium">
                {new Date(excepcion.hasta).toLocaleDateString('es-AR')}
              </p>
              <p className="text-white">
                {new Date(excepcion.hasta).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Botón: mantenemos el ancho total para que siempre sea clicable fácilmente */}
          <button
            type="button"
            onClick={() => handleEliminar(excepcion.id)}
            className="w-full flex items-center justify-center gap-2 text-red-400 bg-red-500/5 border border-red-500/20 py-2.5 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-semibold"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
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