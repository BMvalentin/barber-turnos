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
        <label className="block text-sm font-medium mb-1 text-amber-200/70">
          Fecha <span className="text-amber-500">*</span>
        </label>
        <input
          type="date"
          className="w-full border border-amber-900/30 rounded-lg px-3 py-2 bg-black/60 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* HORARIOS */}
      <div>
        <label className="block text-sm font-medium mb-1 text-amber-200/70">
          Horarios disponibles <span className="text-amber-500">*</span>
        </label>

        {!fecha || !servicioId || !barberoId ? (
          <div className="p-4 bg-black/60 border border-amber-900/30 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-amber-200/50">
              ℹ️ Seleccione servicio, barbero y fecha
            </p>
          </div>
        ) : loading ? (
          <div className="p-4 bg-black/60 border border-amber-900/30 rounded-lg flex items-center gap-2 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500"></div>
            <p className="text-sm text-amber-200/50">
              Cargando horarios...
            </p>
          </div>
        ) : slots.length === 0 ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/50 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-amber-400">
              😔 No hay horarios disponibles para esta fecha
            </p>
          </div>
        ) : (
          <>
            <select
              name={name}
              defaultValue={defaultValue}
              required
              className="w-full border border-amber-900/30 rounded-lg px-3 py-2 bg-black/60 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">-- Seleccionar horario --</option>
              {slots.map((slot) => (
                <option key={slot} value={slot}>
                  {new Date(slot).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </option>
              ))}
            </select>
            <p className="text-xs text-green-400 mt-2">
              ✅ {slots.length} horarios disponibles
            </p>
          </>
        )}
      </div>
    </div>
  );
}