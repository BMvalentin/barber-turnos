"use client";

import { Lock } from "lucide-react";
import { formatearHora } from "@/lib/utils/formatear-hora";
import EmptyState from "@/components/ui/EmptyState";

interface PropsListaHorarios {
  slots: string[];
  cargando: boolean;
  fecha: Date | undefined;
  servicioId?: string;
  barberoId?: string;
  slotSeleccionado: string;
  isSlotBloqueado: (slot: string) => boolean;
  onSeleccionarSlot: (slot: string) => void;
}

/**
 * Cuadrícula de horarios disponibles para la fecha seleccionada.
 */
export default function ListaHorarios({
  slots,
  cargando,
  fecha,
  servicioId,
  barberoId,
  slotSeleccionado,
  isSlotBloqueado,
  onSeleccionarSlot,
}: PropsListaHorarios) {
  // ─── Formatea un slot ISO a "HH:MM hs" ───────────────────────────────────
  const formatearHorario = (slot: string) => formatearHora(slot) + " hs";

  return (
    <div className="space-y-2">
      {/* Encabezado de la grilla */}
      <label className="block ml-1 text-[10px] font-bold text-[#8E8675] uppercase tracking-widest">
        Horarios Disponibles <span className="text-[#E8B031]">*</span>
      </label>

      {!fecha || !servicioId || !barberoId ? (
        /* Estado: faltan datos */
        <div className="p-5 bg-black/60 border border-[#2C261D] rounded-xl border-dashed">
          <p className="text-[11px] text-[#8E8675] flex items-center gap-2">
            <span className="text-[var(--page-primary)]">ℹ️</span> Seleccione servicio,
            barbero y fecha para ver disponibilidad
          </p>
        </div>
      ) : cargando ? (
        /* Estado: cargando horarios */
        <div className="p-5 bg-black/20 border border-[#2C261D] rounded-xl flex items-center gap-3 animate-pulse">
          <div className="w-4 h-4 border-2 border-[#E8B031]/30 border-t-[#E8B031] rounded-full animate-spin" />
          <p className="text-[11px] text-[#8E8675]">Consultando agenda...</p>
        </div>
      ) : slots.length === 0 ? (
        /* Estado: sin disponibilidad */
        <EmptyState
          horizontal
          icono={<span className="text-red-500 font-bold">😔</span>}
          mensaje="No hay horarios disponibles para esta combinación"
          claseContenedor="p-5 bg-red-500/5 border border-red-500/20 rounded-xl"
          claseMensaje="text-[11px] text-red-400/80"
        />
      ) : (
        /* Estado: grilla de horarios disponibles */
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => {
              const estaSeleccionado = slotSeleccionado === slot;
              const estaBloqueado = isSlotBloqueado(slot);

              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSeleccionarSlot(slot)}
                  disabled={estaBloqueado}
                  title={estaBloqueado ? "Seleccionado por otro usuario" : undefined}
                  className={`
                    relative px-2 py-3 rounded-xl text-xs font-bold tracking-wide
                    border transition-all duration-200
                    ${
                      estaBloqueado
                        ? // Bloqueado por otro usuario: gris con candado
                          "bg-[#1A1612] border-[#2A2318] text-[#4A4438] cursor-not-allowed opacity-70"
                        : estaSeleccionado
                        ? // Activo: dorado
                          "bg-[#E8B031] border-[#E8B031] text-[#14110C] shadow-[0_0_12px_rgba(232,176,49,0.35)] cursor-pointer"
                        : // Inactivo: oscuro con borde sutil
                          "bg-[#1C1812] border-[#2C261D] text-[#E4E0D9] hover:border-[#E8B031]/50 hover:text-[#E8B031] cursor-pointer"
                    }
                  `}
                >
                  {estaBloqueado ? (
                    /* Slot bloqueado por otro usuario */
                    <span className="flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" />
                      {formatearHorario(slot)}
                    </span>
                  ) : (
                    formatearHorario(slot)
                  )}

                  {/* Indicador visual de selección activa */}
                  {estaSeleccionado && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#E8B031] rounded-full border-2 border-[#14110C] flex items-center justify-center">
                      <svg viewBox="0 0 8 8" className="w-2 h-2 fill-[#14110C]">
                        <path
                          d="M1 4l2 2 4-4"
                          stroke="#14110C"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Contador de slots encontrados */}
          <div className="flex items-center gap-2 ml-1">
            <div className="w-1 h-1 rounded-full bg-green-500" />
            <p className="text-[10px] font-bold text-green-500/70 uppercase tracking-widest">
              {slots.length} turnos encontrados
            </p>
          </div>
        </div>
      )}
    </div>
  );
}