"use client";

import { updateBarbero } from "@/actions/barbero.actions";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, X } from "lucide-react";

type Barbero = {
  id: string;
  nombre: string | null;
  srcImage: string | null;
  estado: boolean;
  servicios?: any[];
  horarios?: any[];
};

type EditBarberoModalProps = {
  barbero: Barbero;
  servicios: any[];
  diasLaborales: any[];
  onClose: () => void;
};

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function EditBarberoModal({
  barbero,
  servicios,
  diasLaborales,
  onClose,
}: EditBarberoModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [nombre, setNombre] = useState(barbero.nombre || "");
  const [srcImage, setSrcImage] = useState(barbero.srcImage || "");
  const [estado, setEstado] = useState(barbero.estado);
  const [selectedServicios, setSelectedServicios] = useState<string[]>(
    barbero.servicios?.map(s => s.servicio.id) || []
  );
  const [selectedHorarios, setSelectedHorarios] = useState<string[]>(
    barbero.horarios?.map(h => h.margenLaboralId) || []
  );

  const [showServicios, setShowServicios] = useState(false);
  const [showHorarios, setShowHorarios] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      // Aseguramos que los datos sigan el formato esperado por el servidor
      const result = await updateBarbero({
        id: barbero.id,
        nombre: nombre.trim(),
        // Si srcImage es vacío, enviamos null para que Prisma lo limpie o ignore
        srcImage: srcImage.trim() === "" ? null : srcImage.trim(),
        estado: Boolean(estado),
        serviciosIds: selectedServicios || [],
        margenesIds: selectedHorarios,
      });

      if (result.success) {
        toast.success("Barbero actualizado correctamente");
        onClose();
        router.refresh();
      } else {
        // Si el error es un objeto de Zod, intentamos mostrar algo más descriptivo
        const errorMsg = typeof result.error === "string" ? result.error : "Datos inválidos";
        setError(errorMsg);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#14110C] border border-amber-900/30 rounded-xl p-6 space-y-6 shadow-2xl">
        <div className="flex justify-between items-center border-b border-amber-900/30 pb-4">
          <h2 className="text-2xl font-bold text-white">Editar Barbero</h2>
          <button onClick={onClose} className="text-amber-500 hover:text-amber-400"><X /></button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-amber-200/70">Nombre</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full bg-black/60 border border-amber-900/30 rounded-lg p-2 text-white" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-amber-200/70">Imagen URL</label>
            <input type="text" value={srcImage} onChange={(e) => setSrcImage(e.target.value)} className="w-full bg-black/60 border border-amber-900/30 rounded-lg p-2 text-white" />
          </div>

          {/* Selectores de Servicios y Horarios (Lógica idéntica a CreateBarberoForm) */}
          <div className="space-y-2">
            <button onClick={() => setShowServicios(!showServicios)} className="w-full flex justify-between p-3 bg-black/60 border border-amber-900/30 rounded-lg">
              <span className="text-amber-200/70">Servicios ({selectedServicios.length})</span>
              {showServicios ? <ChevronUp /> : <ChevronDown />}
            </button>
            {showServicios && (
              <div className="p-4 bg-black/40 border border-amber-900/30 rounded-lg grid grid-cols-2 gap-2">
                {servicios.map(s => (
                  <label key={s.id} className="flex items-center gap-2 text-white text-sm">
                    <input type="checkbox" checked={selectedServicios.includes(s.id)} onChange={() => setSelectedServicios(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])} />
                    {s.nombre}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button onClick={() => setShowHorarios(!showHorarios)} className="w-full flex justify-between p-3 bg-black/60 border border-amber-900/30 rounded-lg">
              <span className="text-amber-200/70">Horarios ({selectedHorarios.length})</span>
              {showHorarios ? <ChevronUp /> : <ChevronDown />}
            </button>
            {showHorarios && (
              <div className="p-4 bg-black/40 border border-amber-900/30 rounded-lg space-y-4">
                {diasLaborales.map(dia => (
                  <div key={dia.id}>
                    <p className="text-amber-500 font-bold text-xs mb-2">{DIAS_SEMANA[dia.dia]}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {dia.margenes.map((m: any) => (
                        <label key={m.id} className="flex items-center gap-2 text-white text-xs">
                          <input type="checkbox" checked={selectedHorarios.includes(m.id)} onChange={() => setSelectedHorarios(prev => prev.includes(m.id) ? prev.filter(x => x !== m.id) : [...prev, m.id])} />
                          {m.desde} - {m.hasta}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-amber-200/70 text-sm">
            <input type="checkbox" checked={estado} onChange={(e) => setEstado(e.target.checked)} />
            Barbero Activo
          </label>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-4 border-t border-amber-900/30">
          <Button variant="outline" onClick={onClose} className="flex-1 border-amber-900/30 text-amber-200">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isPending} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white">
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
}