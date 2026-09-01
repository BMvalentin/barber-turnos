"use client";

import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import type { RangoHorario } from "@/types/horarios";

export type EstadoDiaEditor = {
  trabaja: boolean;
  rangos: RangoHorario[];
  asignacionIds: string[];
};

export const MAX_RANGOS_POR_DIA = 4;

type Props = {
  dias: { diaId: string; dia: number; nombre: string }[];
  valores: Record<string, EstadoDiaEditor>;
  alCambiar: (diaId: string, indiceRango: number, campo: "desde" | "hasta", valor: string) => void;
  alAlternarTrabajo: (diaId: string, trabaja: boolean) => void;
  alAgregarRango: (diaId: string) => void;
  alQuitarRango: (diaId: string, indiceRango: number) => void;
  alEliminarDia: (diaId: string, asignacionIds: string[]) => void;
};

const CLASE_ENCABEZADO =
  "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-texto-muted)]";

const CLASE_INPUT_HORA =
  "rounded-lg px-3 py-2 bg-[var(--admin-surface-elevated)] text-[var(--admin-texto-primario)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:border-[var(--page-primary)]/60 focus:ring-2 focus:ring-[var(--page-focus-ring)]";

export function TablaDiasBarbero({
  dias,
  valores,
  alCambiar,
  alAlternarTrabajo,
  alAgregarRango,
  alQuitarRango,
  alEliminarDia,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="bg-[var(--admin-surface-elevated)]">
            <th className={CLASE_ENCABEZADO}>Día</th>
            <th className={CLASE_ENCABEZADO}>¿Trabaja?</th>
            <th className={CLASE_ENCABEZADO}>Rangos de horario</th>
            <th className={CLASE_ENCABEZADO}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {dias.map((dia) => {
            const estado = valores[dia.diaId];
            const trabaja = estado?.trabaja ?? false;
            const rangos = estado?.rangos ?? [];
            return (
              <tr key={dia.diaId} className="border-t" style={{ borderColor: "var(--admin-border)" }}>
                <td className="px-4 py-3 align-middle">
                  <span className="font-medium text-[var(--admin-texto-primario)]">{dia.nombre}</span>
                </td>
                <td className="px-4 py-3 align-middle">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={trabaja}
                      onChange={(e) => alAlternarTrabajo(dia.diaId, e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="h-6 w-11 rounded-full bg-[var(--admin-border)] transition-colors peer-checked:bg-[var(--page-primary)] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
                  </label>
                </td>
                <td className="px-4 py-3 align-middle">
                  {trabaja ? (
                    <div className="space-y-2">
                      {rangos.map((rango, indice) => (
                        <div key={indice} className="flex flex-wrap items-center gap-2">
                          <label className="text-xs text-[var(--admin-texto-muted)]">Desde</label>
                          <input
                            type="time"
                            value={rango.desde}
                            onChange={(e) => alCambiar(dia.diaId, indice, "desde", e.target.value)}
                            className={CLASE_INPUT_HORA}
                            style={{ border: "1px solid var(--admin-border)" }}
                          />
                          <label className="text-xs text-[var(--admin-texto-muted)]">Hasta</label>
                          <input
                            type="time"
                            value={rango.hasta}
                            onChange={(e) => alCambiar(dia.diaId, indice, "hasta", e.target.value)}
                            className={CLASE_INPUT_HORA}
                            style={{ border: "1px solid var(--admin-border)" }}
                          />
                          {rangos.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="text-[var(--admin-texto-muted)] hover:text-red-400"
                              onClick={() => alQuitarRango(dia.diaId, indice)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {rangos.length < MAX_RANGOS_POR_DIA && (
                        <button
                          type="button"
                          onClick={() => alAgregarRango(dia.diaId)}
                          className="flex items-center gap-1 rounded-lg border border-dashed border-[var(--admin-border)] px-3 py-2 text-sm text-[var(--admin-texto-primario)] transition-colors hover:border-[var(--page-primary-50)] hover:text-[var(--page-primary-tinta)]"
                        >
                          <Plus className="h-4 w-4" />
                          Agregar horario cortado
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-[var(--admin-texto-muted)]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 align-middle">
                  {estado && estado.asignacionIds.length > 0 ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:bg-red-500/10"
                      onClick={() => alEliminarDia(dia.diaId, estado.asignacionIds)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <span className="text-[var(--admin-texto-muted)]">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
