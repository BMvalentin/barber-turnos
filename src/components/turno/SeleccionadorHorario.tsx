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

  useEffect(() => {
    async function cargar() {
      if (!fecha || !servicioId || !barberoId) {
        setSlots([]);
        return;
      }

      const result = await obtenerHorariosDisponibles(
        fecha,
        servicioId,
        barberoId,
        turnoIdAExcluir
      );

     /* if (result.success) {
        setSlots(result.data);
      }*/
    }

    cargar();
  }, [fecha, servicioId, barberoId, turnoIdAExcluir]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Fecha</label>
        <input
          type="date"
          className="w-full border rounded-lg px-3 py-2"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Horarios disponibles
        </label>

        {slots.length === 0 ? (
          <p className="text-sm text-gray-500">
            Seleccione servicio y barbero primero
          </p>
        ) : (
          <select
            name={name}
            defaultValue={defaultValue}
            className="w-full border rounded-lg px-3 py-2"
          >
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
