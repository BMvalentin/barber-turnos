"use client";

import { useState } from "react";
import { softDeleteExcepcion } from "@/actions/excepciones/eliminar.actions";
import { Calendar, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { ConfirmDialog } from "@/components/ui/confirm-modal";
import EmptyState from "@/components/ui/EmptyState";
import { formatearHora } from "@/lib/utils/formatear-hora";
import type { ExcepcionLaboral } from "@/types/excepcion";

type ExcepcionesListProps = {
  excepciones: ExcepcionLaboral[];
};

export default function ExcepcionesList({ excepciones }: ExcepcionesListProps) {
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
      <EmptyState
        icono={<Calendar />}
        mensaje="No hay excepciones registradas"
        claseContenedor="py-8"
        claseIcono="h-16 w-16 opacity-30"
        estiloIcono={{ color: "var(--page-primary)" }}
        estiloMensaje={{ color: "var(--page-primary-70)" }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {excepciones.map((excepcion) => (
        <div
          key={excepcion.id}
          className="bg-black/60 rounded-lg p-3 sm:p-4 transition-all space-y-3"
          style={{
            border: `1px solid var(--page-secondary-40)`,
          }}
        >
          {/* Cabecera */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="h-4 w-4 shrink-0" style={{ color: "var(--page-primary)" }} />
              <p className="text-white font-semibold truncate">{excepcion.motivo}</p>
            </div>

            {excepcion.barbero ? (
              <span 
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap"
                style={{
                  backgroundColor: `var(--page-primary-15)`,
                  color: "var(--page-primary)",
                  border: `1px solid var(--page-primary-30)`
                }}
              >
                <User className="h-3 w-3" /> {excepcion.barbero.nombre}
              </span>
            ) : (
              <span className="bg-[var(--page-primary)]/10 text-[var(--page-primary)] px-2 py-0.5 rounded-full text-[10px] border border-[var(--page-primary)]/20">
                Global
              </span>
            )}
          </div>

          {/* Grilla de fechas */}
          <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
            <div 
              className="p-2 rounded"
              style={{
                backgroundColor: `var(--page-secondary-15)`,
                border: `1px solid var(--page-secondary-30)`,
              }}
            >
              <p className="uppercase mb-0.5" style={{ color: "var(--page-primary-80)" }}>Desde</p>
              <p className="font-mono font-medium" style={{ color: "var(--page-primary)" }}>
                {new Date(excepcion.desde).toLocaleDateString('es-AR')}
              </p>
              <p className="text-white">
                {formatearHora(excepcion.desde)}
              </p>
            </div>
            <div 
              className="p-2 rounded"
              style={{
                backgroundColor: `var(--page-secondary-15)`,
                border: `1px solid var(--page-secondary-30)`,
              }}
            >
              <p className="uppercase mb-0.5" style={{ color: "var(--page-primary-80)" }}>Hasta</p>
              <p className="font-mono font-medium" style={{ color: "var(--page-primary)" }}>
                {new Date(excepcion.hasta).toLocaleDateString('es-AR')}
              </p>
              <p className="text-white">
                {formatearHora(excepcion.hasta)}
              </p>
            </div>
          </div>

          {/* Botón de eliminar */}
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

      {/* Modal de confirmación */}
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