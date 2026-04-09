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
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-widest ml-1">
          Fecha de Reserva <span className="text-[#E8B031]">*</span>
        </label>
        <div className="relative">
          <input
            type="date"
            className="w-full bg-[#1C1812] border border-[#2C261D] rounded-xl px-4 py-3 text-[#E4E0D9] text-sm outline-none focus:border-[#E8B031] transition-all appearance-none cursor-pointer"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      {/* HORARIOS */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-widest ml-1">
          Horarios Disponibles <span className="text-[#E8B031]">*</span>
        </label>

        {!fecha || !servicioId || !barberoId ? (
          <div className="p-5 bg-black/60 border border-[#2C261D] rounded-xl backdrop-blur-sm border-dashed">
            <p className="text-[11px] text-[#8E8675] flex items-center gap-2">
              <span className="text-amber-500">ℹ️</span> Seleccione servicio, barbero y fecha para ver disponibilidad
            </p>
          </div>
        ) : loading ? (
          <div className="p-5 bg-black/20 border border-[#2C261D] rounded-xl flex items-center gap-3 animate-pulse">
            <div className="w-4 h-4 border-2 border-[#E8B031]/30 border-t-[#E8B031] rounded-full animate-spin"></div>
            <p className="text-[11px] text-[#8E8675]">Consultando agenda...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-xl">
            <p className="text-[11px] text-red-400/80 flex items-center gap-2">
              <span className="text-red-500 font-bold">😔</span> No hay horarios disponibles para esta combinación
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <select
              name={name}
              defaultValue={defaultValue}
              required
              className="w-full bg-[#1C1812] border border-[#2C261D] rounded-xl px-4 py-3 text-[#E4E0D9] text-sm font-bold outline-none focus:border-[#E8B031] appearance-none cursor-pointer transition-all"
            >
              <option value="" className="bg-[#14110C] text-[#8E8675]">-- Seleccionar horario --</option>
              {slots.map((slot) => (
                <option key={slot} value={slot} className="bg-[#14110C]">
                  {new Date(slot).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                  })} hs
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 ml-1">
               <div className="w-1 h-1 rounded-full bg-green-500"></div>
               <p className="text-[10px] font-bold text-green-500/70 uppercase tracking-widest">
                 {slots.length} turnos encontrados
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}