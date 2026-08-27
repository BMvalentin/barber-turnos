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
      <label className="block ml-1 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        Horarios Disponibles <span className="text-[var(--page-primary)]">*</span>
      </label>

      {!fecha || !servicioId || !barberoId ? (
        /* Estado: faltan datos */
        <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl border-dashed">
          <p className="text-[11px] text-zinc-400 flex items-center gap-2">
            <span className="text-[var(--page-primary)]">ℹ️</span> Seleccione servicio,
            barbero y fecha para ver disponibilidad
          </p>
        </div>
      ) : cargando ? (
        /* Estado: cargando horarios */
        <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl flex items-center gap-3 animate-pulse">
          <div className="w-4 h-4 border-2 border-[var(--page-primary-30)] border-t-[var(--page-primary)] rounded-full animate-spin" />
          <p className="text-[11px] text-zinc-400">Consultando agenda...</p>
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
                          "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-70"
                        : estaSeleccionado
                        ? // Activo: color de marca
                          "bg-[var(--page-primary)] border-[var(--page-primary)] text-[var(--page-primary-foreground)] shadow-[0_0_12px_color-mix(in_srgb,var(--page-primary)_35%,transparent)] cursor-pointer"
                        : // Inactivo: oscuro con borde sutil
                          "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-[var(--page-primary-50)] hover:text-[var(--page-primary)] cursor-pointer"
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
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--page-primary)] rounded-full border-2 border-[var(--page-primary-foreground)] flex items-center justify-center">
                      <svg viewBox="0 0 8 8" className="w-2 h-2 fill-[var(--page-primary-foreground)]">
                        <path
                          d="M1 4l2 2 4-4"
                          stroke="var(--page-primary-foreground)"
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