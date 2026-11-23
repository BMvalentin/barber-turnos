"use client";

import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { InterruptorAdmin } from "@/components/admin/InterruptorAdmin";
import { MAX_RANGOS_POR_DIA } from "@/components/horarios/constantes-horarios";
import { TarjetasDiasBarbero } from "@/components/horarios/TarjetasDiasBarbero";
import type { RangoHorario } from "@/types/horarios";

export type EstadoDiaEditor = {
  trabaja: boolean;
  rangos: RangoHorario[];
  asignacionIds: string[];
};

export type PropsDiasBarbero = {
  dias: { diaId: string; dia: number; nombre: string }[];
  valores: Record<string, EstadoDiaEditor>;
  alCambiar: (diaId: string, indiceRango: number, campo: "desde" | "hasta", valor: string) => void;
  alAlternarTrabajo: (diaId: string, trabaja: boolean) => void;
  alAgregarRango: (diaId: string) => void;
  alQuitarRango: (diaId: string, indiceRango: number) => void;
  alEliminarDia: (diaId: string, asignacionIds: string[]) => void;
};

const CLASE_ENCABEZADO =
  "px-4 py-3 text-xs font-medium text-[var(--admin-texto-muted)]";

const CLASE_INPUT_HORA =
  "rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-2 py-2 tabular-nums text-[var(--admin-texto-primario)] focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]";

export function TablaDiasBarbero({
  dias,
  valores,
  alCambiar,
  alAlternarTrabajo,
  alAgregarRango,
  alQuitarRango,
  alEliminarDia,
}: PropsDiasBarbero) {
  return (
    <>
      <TarjetasDiasBarbero
        dias={dias}
        valores={valores}
        alCambiar={alCambiar}
        alAlternarTrabajo={alAlternarTrabajo}
        alAgregarRango={alAgregarRango}
        alQuitarRango={alQuitarRango}
        alEliminarDia={alEliminarDia}
      />
      <div className="hidden lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[var(--admin-surface-elevated)]">
              <th scope="col" className={CLASE_ENCABEZADO}>Día</th>
              <th scope="col" className={CLASE_ENCABEZADO}>Atiende</th>
              <th scope="col" className={CLASE_ENCABEZADO}>Horarios</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
          {dias.map((dia) => {
            const estado = valores[dia.diaId];
            const trabaja = estado?.trabaja ?? false;
            const rangos = estado?.rangos ?? [];
            return (
              <tr key={dia.diaId} className="border-t border-[var(--admin-border)]">
                <th scope="row" className="px-4 py-2 align-middle">
                  <span className="font-medium text-[var(--admin-texto-primario)]">{dia.nombre}</span>
                </th>
                <td className="px-4 py-2 align-middle">
                  <InterruptorAdmin etiqueta={`Atiende el ${dia.nombre.toLowerCase()}`} activo={trabaja} alCambiar={(activo) => alAlternarTrabajo(dia.diaId, activo)} />
                </td>
                <td className="px-4 py-3 align-middle">
                  {trabaja ? (
                    <div className="space-y-2">
                      {rangos.map((rango, indice) => (
                        <div key={indice} className="flex flex-wrap items-center gap-2">
                          <label htmlFor={`desde-${dia.diaId}-${indice}`} className="text-xs text-[var(--admin-texto-muted)]">Desde</label>
                          <input
                            id={`desde-${dia.diaId}-${indice}`}
                            type="time"
                            value={rango.desde}
                            onChange={(e) => alCambiar(dia.diaId, indice, "desde", e.target.value)}
                            className={CLASE_INPUT_HORA}
                          />
                          <label htmlFor={`hasta-${dia.diaId}-${indice}`} className="text-xs text-[var(--admin-texto-muted)]">Hasta</label>
                          <input
                            id={`hasta-${dia.diaId}-${indice}`}
                            type="time"
                            value={rango.hasta}
                            onChange={(e) => alCambiar(dia.diaId, indice, "hasta", e.target.value)}
                            className={CLASE_INPUT_HORA}
                          />
                          {rangos.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              aria-label={`Quitar horario ${indice + 1} del ${dia.nombre.toLowerCase()}`}
                              className="text-[var(--admin-texto-muted)] hover:text-[var(--admin-texto-primario)]"
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
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-[var(--page-primary-tinta)] transition-colors hover:bg-[var(--page-primary-soft)] focus-visible:outline-2 focus-visible:outline-[var(--page-focus-ring)]"
                        >
                          <Plus className="h-4 w-4" />
                          Agregar otro horario
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--admin-texto-muted)]">
                      No atiende
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right align-middle">
                  {estado && estado.asignacionIds.length > 0 ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label={`Eliminar horario del ${dia.nombre.toLowerCase()}`}
                      className="text-[var(--admin-texto-muted)] hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)]"
                      onClick={() => alEliminarDia(dia.diaId, estado.asignacionIds)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </>
  );
}
