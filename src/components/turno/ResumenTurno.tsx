"use client";

import { Check } from "lucide-react";
import type { BarberoData, ServicioData } from "@/types/turno";
import { formatearFecha } from "@/lib/utils/formatear-fecha";
import { formatearHora } from "@/lib/utils/formatear-hora";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";
import BotonSubmitFormStatus from "@/components/ui/boton-submit-form-status";

type Props = {
  servicio: ServicioData | null;
  barbero: BarberoData | null;
  fecha: Date | undefined;
  slotSeleccionado: string;
  completo: boolean;
  onCancelar: () => void;
};

export default function ResumenTurno({
  servicio,
  barbero,
  fecha,
  slotSeleccionado,
  completo,
  onCancelar,
}: Props) {
  const descripcionCorta =
    servicio?.descripcion && servicio.descripcion.length > 60
      ? `${servicio.descripcion.slice(0, 60).trimEnd()}...`
      : servicio?.descripcion;

  return (
    <aside className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-6 space-y-4 lg:sticky lg:top-0 lg:self-start min-w-0">
      <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-widest">
        Resumen del Turno
      </h2>

      <div className="space-y-3">
        {/* Servicio */}
        <div>
          <p className="text-[11px] text-zinc-500">Servicio</p>
          <p className="text-sm text-zinc-100 break-words [overflow-wrap:anywhere]">
            {servicio ? `${servicio.nombre} (${servicio.duracion} min)` : "—"}
          </p>
          {descripcionCorta && (
            <p className="text-xs text-zinc-400 mt-0.5 break-words [overflow-wrap:anywhere]">
              {descripcionCorta}
            </p>
          )}
        </div>

        {/* Barbero */}
        <div>
          <p className="text-[11px] text-zinc-500">Barbero</p>
          <p className="text-sm text-zinc-100">{barbero?.nombre ?? "—"}</p>
        </div>

        {/* Fecha */}
        <div>
          <p className="text-[11px] text-zinc-500">Fecha</p>
          <p className="text-sm text-zinc-100">
            {fecha ? formatearFecha(fecha) : "—"}
          </p>
        </div>

        {/* Hora */}
        <div>
          <p className="text-[11px] text-zinc-500">Hora</p>
          <p className="text-sm text-zinc-100">
            {slotSeleccionado ? formatearHora(slotSeleccionado) : "—"}
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-zinc-500">Total</span>
        <span className="text-sm font-bold text-[var(--page-primary-tinta)]">
          {servicio ? `$${formatearMoneda(servicio.precio)}` : "—"}
        </span>
      </div>

      {/* Botones */}
      <div className="space-y-2 border-t border-zinc-800 pt-4">
        <BotonSubmitFormStatus
          texto={
            <span className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4" />
              Confirmar Turno
            </span>
          }
          textoMientrasCarga="Procesando..."
          deshabilitado={!completo}
          claseAdicional="w-full py-3 font-semibold rounded-xl"
        />
        <button
          type="button"
          onClick={onCancelar}
          className="w-full py-3 border border-zinc-700 text-zinc-300 rounded-xl hover:bg-zinc-800 transition-colors font-medium text-sm"
        >
          Cancelar
        </button>
      </div>
    </aside>
  );
}
