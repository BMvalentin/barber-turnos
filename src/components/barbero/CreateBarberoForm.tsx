"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBarbero } from "@/actions/barbero.actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";

type Servicio = {
  id: string;
  nombre: string;
};

type MargenLaboral = {
  id: string;
  desde: string;
  hasta: string;
  diaId: string;
};

type DiaLaboral = {
  id: string;
  dia: number;
  margenes: MargenLaboral[];
};

type Props = {
  servicios: Servicio[];
  diasLaborales: DiaLaboral[];
  onSuccess?: () => void; 
};

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export default function CreateBarberoForm({ servicios, diasLaborales }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [nombre, setNombre] = useState("");
  const [srcImage, setSrcImage] = useState("");
  const [selectedServicios, setSelectedServicios] = useState<string[]>([]);
  const [selectedHorarios, setSelectedHorarios] = useState<string[]>([]);
  
  // Estados para colapsar secciones
  const [showServicios, setShowServicios] = useState(false);
  const [showHorarios, setShowHorarios] = useState(false);

  const toggleServicio = (id: string) => {
    setSelectedServicios((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleHorario = (id: string) => {
    setSelectedHorarios((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    startTransition(async () => {
      const result = await createBarbero({
        nombre: nombre.trim(),
        srcImage: srcImage.trim() || null,
        serviciosIds: selectedServicios,
        margenesIds: selectedHorarios,
      });

      if (result.success) {
        toast.success("Barbero creado correctamente");
        // Limpiar formulario
        setNombre("");
        setSrcImage("");
        setSelectedServicios([]);
        setSelectedHorarios([]);
        router.refresh();
      } else {
        toast.error(result.error || "Error al crear barbero");
      }
    });
  };

  return (
    <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-xl p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Nuevo Barbero</h2>

      {/* Nombre */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-amber-200/70">
          Nombre <span className="text-amber-500">*</span>
        </label>
        <input
          type="text"
          className="w-full border border-amber-900/30 rounded-lg px-3 py-2 bg-black/60 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          placeholder="Ingrese el nombre del barbero"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>

      {/* Imagen (Opcional) */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-amber-200/70">
          Imagen <span className="text-amber-200/50 text-xs">(Opcional)</span>
        </label>
        <input
          type="text"
          className="w-full border border-amber-900/30 rounded-lg px-3 py-2 bg-black/60 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          placeholder="URL de la imagen"
          value={srcImage}
          onChange={(e) => setSrcImage(e.target.value)}
        />
      </div>

      {/* Servicios - Colapsable */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowServicios(!showServicios)}
          className="w-full flex items-center justify-between p-3 bg-black/60 border border-amber-900/30 rounded-lg hover:bg-amber-500/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-amber-200/70">Servicios</span>
            {selectedServicios.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs border border-amber-500/30">
                {selectedServicios.length} seleccionados
              </span>
            )}
          </div>
          {showServicios ? (
            <ChevronUp className="h-4 w-4 text-amber-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-amber-500" />
          )}
        </button>

        {showServicios && (
          <div className="p-4 bg-black/60 border border-amber-900/30 rounded-lg space-y-2 max-h-60 overflow-y-auto">
            {servicios?.map((servicio) => (
              <label
                key={servicio.id}
                className="flex items-center gap-2 p-2 hover:bg-amber-500/10 rounded cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedServicios.includes(servicio.id)}
                  onChange={() => toggleServicio(servicio.id)}
                  className="w-4 h-4 rounded border-amber-900/30 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-white">{servicio.nombre}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Horarios - Colapsable y Compacto */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowHorarios(!showHorarios)}
          className="w-full flex items-center justify-between p-3 bg-black/60 border border-amber-900/30 rounded-lg hover:bg-amber-500/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-200/70">Horarios por Día</span>
            {selectedHorarios.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs border border-amber-500/30">
                {selectedHorarios.length} horarios
              </span>
            )}
          </div>
          {showHorarios ? (
            <ChevronUp className="h-4 w-4 text-amber-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-amber-500" />
          )}
        </button>

        {showHorarios && (
          <div className="p-4 bg-black/60 border border-amber-900/30 rounded-lg space-y-3 max-h-96 overflow-y-auto">
            {diasLaborales.map((dia) => (
              <div key={dia.id} className="space-y-2">
                <p className="text-sm font-semibold text-amber-400">
                  {DIAS_SEMANA[dia.dia]}
                </p>
                <div className="grid grid-cols-2 gap-2 ml-4">
                  {dia.margenes?.map((margen) => (
                    <label
                      key={margen.id}
                      className="flex items-center gap-2 p-2 bg-black/40 hover:bg-amber-500/10 rounded border border-amber-900/30 cursor-pointer transition-colors text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={selectedHorarios.includes(margen.id)}
                        onChange={() => toggleHorario(margen.id)}
                        className="w-3 h-3 rounded border-amber-900/30 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-amber-200/70">
                        {margen.desde} - {margen.hasta}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
      >
        {isPending ? "Guardando..." : "Crear Barbero"}
      </Button>
    </div>
  );
}