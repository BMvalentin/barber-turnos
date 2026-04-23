"use client";

import { useEffect, useState } from "react";
import { obtenerHorariosDisponibles } from "@/actions/turno.actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const [date, setDate] = useState<Date | undefined>(defaultValue ? new Date(defaultValue) : undefined);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function cargar() {
      if (!date || !servicioId || !barberoId) {
        setSlots([]);
        return;
      }

      const fechaStr = format(date, "yyyy-MM-dd");

      try {
        setLoading(true);

        const result = await obtenerHorariosDisponibles(
          fechaStr,
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
  }, [date, servicioId, barberoId, turnoIdAExcluir]);

  return (
    <div className="space-y-4">
      {/* FECHA */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-widest ml-1">
          Fecha de Reserva <span className="text-[#E8B031]">*</span>
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "w-full flex items-center justify-start text-left bg-[#1C1812] border border-[#2C261D] rounded-xl px-4 py-3 text-[#E4E0D9] text-sm outline-none hover:border-[#E8B031] focus:border-[#E8B031] transition-all",
                !date && "text-[#8E8675]"
              )}
            >
              <CalendarIcon className="mr-3 h-4 w-4 text-[#8E8675]" />
              {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-[#1C1812] border-[#2C261D] text-[#E4E0D9] shadow-2xl rounded-xl" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              initialFocus
              locale={es}
              className="rounded-xl"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* HORARIOS */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-[#8E8675] uppercase tracking-widest ml-1">
          Horarios Disponibles <span className="text-[#E8B031]">*</span>
        </label>

        {!date || !servicioId || !barberoId ? (
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