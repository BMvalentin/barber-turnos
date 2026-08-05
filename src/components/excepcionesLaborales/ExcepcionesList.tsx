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

type ExcepcionesListProps = {
  excepciones: Excepcion[];
  primaryColor: string;
  secondaryColor: string;
};

export default function ExcepcionesList({ excepciones, primaryColor, secondaryColor }: ExcepcionesListProps) {
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
        <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" style={{ color: primaryColor }} />
        <p style={{ color: `${primaryColor}b3` }}>
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
          className="bg-black/60 rounded-lg p-3 sm:p-4 transition-all space-y-3"
          style={{
            border: `1px solid ${secondaryColor}40`,
          }}
        >
          {/* Cabecera */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="h-4 w-4 shrink-0" style={{ color: primaryColor }} />
              <p className="text-white font-semibold truncate">{excepcion.motivo}</p>
            </div>

            {excepcion.barbero ? (
              <span 
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                  border: `1px solid ${primaryColor}30`
                }}
              >
                <User className="h-3 w-3" /> {excepcion.barbero.nombre}
              </span>
            ) : (
              <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full text-[10px] border border-blue-500/20">
                Global
              </span>
            )}
          </div>

          {/* Grilla de fechas */}
          <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
            <div 
              className="p-2 rounded"
              style={{
                backgroundColor: `${secondaryColor}15`,
                border: `1px solid ${secondaryColor}30`,
              }}
            >
              <p className="uppercase mb-0.5" style={{ color: `${primaryColor}80` }}>Desde</p>
              <p className="font-mono font-medium" style={{ color: primaryColor }}>
                {new Date(excepcion.desde).toLocaleDateString('es-AR')}
              </p>
              <p className="text-white">
                {new Date(excepcion.desde).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div 
              className="p-2 rounded"
              style={{
                backgroundColor: `${secondaryColor}15`,
                border: `1px solid ${secondaryColor}30`,
              }}
            >
              <p className="uppercase mb-0.5" style={{ color: `${primaryColor}80` }}>Hasta</p>
              <p className="font-mono font-medium" style={{ color: primaryColor }}>
                {new Date(excepcion.hasta).toLocaleDateString('es-AR')}
              </p>
              <p className="text-white">
                {new Date(excepcion.hasta).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
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