import { ChevronDown, Plus, Trash2, X } from "lucide-react";
import { InterruptorAdmin } from "@/components/admin/InterruptorAdmin";
import { MAX_RANGOS_POR_DIA } from "@/components/horarios/constantes-horarios";
import type { PropsDiasBarbero } from "@/components/horarios/TablaDiasBarbero";

const CLASE_HORA =
  "min-h-11 w-full min-w-0 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 text-base text-[var(--admin-texto-primario)] focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]";

export function TarjetasDiasBarbero({
  dias,
  valores,
  alCambiar,
  alAlternarTrabajo,
  alAgregarRango,
  alQuitarRango,
  alEliminarDia,
}: PropsDiasBarbero) {
  return (
    <div className="grid gap-2 px-3 pb-4 lg:hidden">
      {dias.map((dia) => {
        const estado = valores[dia.diaId];
        const trabaja = estado?.trabaja ?? false;
        const rangos = estado?.rangos ?? [];
        const horarios = rangos
          .filter((rango) => rango.desde && rango.hasta)
          .map((rango) => `${rango.desde}–${rango.hasta}`)
          .join(" · ");

        return (
          <details key={dia.diaId} className="group rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)]">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-[var(--page-focus-ring)] [&::-webkit-details-marker]:hidden">
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[var(--admin-texto-primario)]">{dia.nombre}</span>
                <span className="block text-xs tabular-nums text-[var(--admin-texto-muted)]">
                  {trabaja ? horarios || "Horario por definir" : "No atiende"}
                </span>
              </span>
              <ChevronDown
                className="size-4 shrink-0 text-[var(--admin-texto-muted)] transition-transform group-open:rotate-180 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </summary>

            <div className="space-y-3 border-t border-[var(--admin-border)] px-3 pt-1 pb-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[var(--admin-texto-primario)]">Día de atención</span>
                <InterruptorAdmin
                  etiqueta={`Atiende el ${dia.nombre.toLowerCase()}`}
                  activo={trabaja}
                  alCambiar={(activo) => alAlternarTrabajo(dia.diaId, activo)}
                />
              </div>

              {trabaja && (
                <div className="space-y-3">
                  {rangos.map((rango, indice) => (
                    <div key={indice} className={`grid items-end gap-2 ${rangos.length > 1 ? "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]" : "grid-cols-2"}`}>
                      <label className="grid min-w-0 gap-1 text-xs text-[var(--admin-texto-muted)]">
                        Desde
                        <input
                          type="time"
                          value={rango.desde}
                          onChange={(evento) => alCambiar(dia.diaId, indice, "desde", evento.target.value)}
                          className={CLASE_HORA}
                        />
                      </label>
                      <label className="grid min-w-0 gap-1 text-xs text-[var(--admin-texto-muted)]">
                        Hasta
                        <input
                          type="time"
                          value={rango.hasta}
                          onChange={(evento) => alCambiar(dia.diaId, indice, "hasta", evento.target.value)}
                          className={CLASE_HORA}
                        />
                      </label>
                      {rangos.length > 1 && (
                        <button
                          type="button"
                          aria-label={`Quitar horario ${indice + 1} del ${dia.nombre.toLowerCase()}`}
                          className="grid size-11 place-items-center rounded-lg text-[var(--admin-texto-muted)] hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-error)]"
                          onClick={() => alQuitarRango(dia.diaId, indice)}
                        >
                          <X className="size-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  ))}
                  {rangos.length < MAX_RANGOS_POR_DIA && (
                    <button
                      type="button"
                      onClick={() => alAgregarRango(dia.diaId)}
                      className="admin-control w-full justify-center"
                    >
                      <Plus className="size-4 text-[var(--page-primary-tinta)]" aria-hidden="true" />
                      Agregar otro horario
                    </button>
                  )}
                </div>
              )}

              {estado && estado.asignacionIds.length > 0 && (
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-error-suave)] hover:text-[var(--admin-error)]"
                  onClick={() => alEliminarDia(dia.diaId, estado.asignacionIds)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Eliminar horario guardado
                </button>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}
