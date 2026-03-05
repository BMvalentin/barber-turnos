"use client";

import { useEffect, useState } from "react";
import { obtenerHorariosDisponibles } from "@/actions/turno.actions";

interface Props {
  servicioId?: string;
  barberoId?: string;
  turnoIdAExcluir?: string;
  defaultValue?: string;
  name: string;
}

export default function SeleccionadorHorario({
  servicioId,
  barberoId,
  turnoIdAExcluir,
  defaultValue,
  name,
}: Props) {
  const [fecha, setFecha] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function cargar() {
      if (!fecha || !servicioId || !barberoId) {
        setSlots([]);
        return;
      }

      try {
        setLoading(true);

        const result = await obtenerHorariosDisponibles(
          fecha,
          servicioId,
          barberoId,
          turnoIdAExcluir
        );

        if (result.success && Array.isArray(result.data)) {
          setSlots(result.data);
        } else {
          setSlots([]);
        }
      } catch (error) {
        console.error("Error cargando horarios:", error);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, [fecha, servicioId, barberoId, turnoIdAExcluir]);

  return (
    <div className="space-y-4">
      {/* FECHA */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Fecha <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          className="w-full border rounded-lg px-3 py-2"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      {/* HORARIOS */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Horarios disponibles <span className="text-red-500">*</span>
        </label>

        {/* Si faltan datos */}
        {!fecha || !servicioId || !barberoId ? (
          <p className="text-sm text-gray-500">
            Seleccione servicio, barbero y fecha
          </p>
        ) : loading ? (
          <p className="text-sm text-gray-500">
            Cargando horarios...
          </p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay horarios disponibles para esta fecha
          </p>
        ) : (
          <select
            name={name}
            defaultValue={defaultValue}
            required
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">-- Seleccionar horario --</option>
            {slots.map((slot) => (
              <option key={slot} value={slot}>
                {new Date(slot).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
