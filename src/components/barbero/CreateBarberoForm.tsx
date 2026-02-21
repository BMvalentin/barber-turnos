"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBarbero } from "@/actions/barbero.actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

  const toggleServicio = (id: string) => {
    setSelectedServicios((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  };

  const toggleHorario = (id: string) => {
    setSelectedHorarios((prev) =>
      prev.includes(id)
        ? prev.filter((h) => h !== id)
        : [...prev, id]
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
        router.refresh();
      } else {
        toast.error(result.error || "Error al crear barbero");
      }
    });
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-bold">Nuevo Barbero</h2>

      {/* Nombre */}
      <div className="space-y-2">
        <label className="font-semibold">Nombre</label>
        <input
          type="text"
          className="w-full border rounded-md px-3 py-2"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>

      {/* Imagen (Opcional) */}
      <div className="space-y-2">
        <label className="font-semibold">Imagen (Opcional)</label>
        <input
          type="text"
          className="w-full border rounded-md px-3 py-2"
          placeholder="URL de la imagen"
          value={srcImage}
          onChange={(e) => setSrcImage(e.target.value)}
        />
      </div>

      {/* Servicios */}
      <div className="space-y-3">
        <label className="font-semibold">Servicios</label>

        {servicios?.map((servicio) => (
          <div key={servicio.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedServicios.includes(servicio.id)}
              onChange={() => toggleServicio(servicio.id)}
            />
            <span>{servicio.nombre}</span>
          </div>
        ))}
      </div>

      {/* Días + Horarios */}
      <div className="space-y-4">
        <label className="font-semibold">Horarios por Día</label>

        {diasLaborales.map((dia) => (
          <div key={dia.id} className="border rounded-lg p-4">
            <p className="font-semibold mb-2">
              {DIAS_SEMANA[dia.dia]}
            </p>

            {dia.margenes?.map((margen) => (
              <div key={margen.id} className="flex items-center gap-2 ml-4">
                <input
                  type="checkbox"
                  checked={selectedHorarios.includes(margen.id)}
                  onChange={() => toggleHorario(margen.id)}
                />
                <span>
                  {margen.desde} - {margen.hasta}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Guardando..." : "Crear Barbero"}
      </Button>
    </div>
  );
}