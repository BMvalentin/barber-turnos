"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { DiaLaboral } from "@/types/barbero";

const ORDEN_DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
];

type Props = {
  abierto: boolean;
  onAlternarAbierto: () => void;
  seleccionados: string[];
  diasLaborales: DiaLaboral[];
  onAlternarSeleccion: (id: string) => void;
};

export default function SelectorHorarios({
  abierto,
  onAlternarAbierto,
  seleccionados,
  diasLaborales,
  onAlternarSeleccion,
}: Props) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onAlternarAbierto}
        className="w-full flex items-center justify-between p-3 bg-black/65 rounded-lg transition border"
        style={{ borderColor: `var(--page-primary-30)` }}
      >
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold" style={{ color: `var(--page-primary-70)` }}>
            Horarios disponibles
          </span>
          <span className="text-xs" style={{ color: "var(--page-primary)" }}>
            {seleccionados.length} seleccionados
          </span>
        </div>

        {abierto ? (
          <ChevronUp className="h-4 w-4" style={{ color: "var(--page-primary)" }} />
        ) : (
          <ChevronDown className="h-4 w-4" style={{ color: "var(--page-primary)" }} />
        )}
      </button>

      {abierto && (
        <div
          className="p-4 bg-black/60 rounded-lg space-y-4 max-h-80 overflow-y-auto border"
          style={{ borderColor: `var(--page-primary-30)` }}
        >
          {seleccionados.length === 0 && (
            <p className="text-xs italic" style={{ color: `var(--page-primary-80)` }}>
              No seleccionaste horarios
            </p>
          )}

          {[...diasLaborales]
            .filter((dia) => dia.margenes.length > 0)
            .sort(
              (a, b) =>
                ORDEN_DIAS.indexOf(a.dia) - ORDEN_DIAS.indexOf(b.dia)
            )
            .map((dia) => (
              <div key={dia.id} className="space-y-2">
                <p className="text-sm font-semibold" style={{ color: "var(--page-primary)" }}>
                  {dia.dia}:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {[...dia.margenes]
                    .sort((a, b) => a.desde.localeCompare(b.desde))
                    .map((m) => (
                      <label
                        key={m.id}
                        className="flex items-center gap-2 text-white text-xs p-2 bg-black/40 rounded hover:bg-black/60 transition cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={seleccionados.includes(m.id)}
                          onChange={() => onAlternarSeleccion(m.id)}
                        />
                        {m.desde} - {m.hasta}
                      </label>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}