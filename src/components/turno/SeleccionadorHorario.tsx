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
  // Estado del turno seleccionado actualmente
  const [slotSeleccionado, setSlotSeleccionado] = useState<string>(
    defaultValue ?? ""
  );

  useEffect(() => {
    async function cargar() {
      if (!fecha || !servicioId || !barberoId) {
        setSlots([]);
        return;
      }

      try {
        setLoading(true);

        const resultado = await obtenerHorariosDisponibles(
          fecha,
          servicioId,
          barberoId,
          turnoIdAExcluir
        );

        if (resultado.success && Array.isArray(resultado.data)) {
          setSlots(resultado.data);
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
    // Limpiar selección al cambiar filtros
    setSlotSeleccionado("");
  }, [fecha, servicioId, barberoId, turnoIdAExcluir]);

  // Formatea un slot ISO a "HH:MM hs"
  const formatearHora = (slot: string) =>
    new Date(slot).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " hs";

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

      {/* CUADRÍCULA DE HORARIOS */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-widest ml-1">
          Horarios Disponibles <span className="text-[#E8B031]">*</span>
        </label>

        {/* Campo oculto que envía el valor al formulario */}
        <input type="hidden" name={name} value={slotSeleccionado} required={slots.length > 0} />

        {/* Estado: faltan datos */}
        {!fecha || !servicioId || !barberoId ? (
          <div className="p-5 bg-black/60 border border-[#2C261D] rounded-xl backdrop-blur-sm border-dashed">
            <p className="text-[11px] text-[#8E8675] flex items-center gap-2">
              <span className="text-amber-500">ℹ️</span> Seleccione servicio,
              barbero y fecha para ver disponibilidad
            </p>
          </div>
        ) : loading ? (
          /* Estado: cargando */
          <div className="p-5 bg-black/20 border border-[#2C261D] rounded-xl flex items-center gap-3 animate-pulse">
            <div className="w-4 h-4 border-2 border-[#E8B031]/30 border-t-[#E8B031] rounded-full animate-spin" />
            <p className="text-[11px] text-[#8E8675]">Consultando agenda...</p>
          </div>
        ) : slots.length === 0 ? (
          /* Estado: sin disponibilidad */
          <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-xl">
            <p className="text-[11px] text-red-400/80 flex items-center gap-2">
              <span className="text-red-500 font-bold">😔</span> No hay
              horarios disponibles para esta combinación
            </p>
          </div>
        ) : (
          /* Estado: cuadrícula de turnos */
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => {
                const estaSeleccionado = slotSeleccionado === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSlotSeleccionado(slot)}
                    className={`
                      relative px-2 py-3 rounded-xl text-xs font-bold tracking-wide
                      border transition-all duration-200 cursor-pointer
                      ${
                        estaSeleccionado
                          ? // Estilo activo: dorado
                            "bg-[#E8B031] border-[#E8B031] text-[#14110C] shadow-[0_0_12px_rgba(232,176,49,0.35)]"
                          : // Estilo inactivo: oscuro con borde sutil
                            "bg-[#1C1812] border-[#2C261D] text-[#E4E0D9] hover:border-[#E8B031]/50 hover:text-[#E8B031]"
                      }
                    `}
                  >
                    {formatearHora(slot)}
                    {/* Indicador de selección */}
                    {estaSeleccionado && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#E8B031] rounded-full border-2 border-[#14110C] flex items-center justify-center">
                        <svg
                          viewBox="0 0 8 8"
                          className="w-2 h-2 fill-[#14110C]"
                        >
                          <path d="M1 4l2 2 4-4" stroke="#14110C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Contador de turnos encontrados */}
            <div className="flex items-center gap-2 ml-1">
              <div className="w-1 h-1 rounded-full bg-green-500" />
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