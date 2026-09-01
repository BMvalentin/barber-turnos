import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { MAX_RANGOS_POR_DIA, type EstadoDiaEditor } from "@/components/horarios/TablaDiasBarbero";

type Dia = {
  diaId: string;
  dia: number;
  nombre: string;
};

type Props = {
  dias: Dia[];
  valores: Record<string, EstadoDiaEditor>;
  alCambiar: (diaId: string, indiceRango: number, campo: "desde" | "hasta", valor: string) => void;
  alAlternarTrabajo: (diaId: string, trabaja: boolean) => void;
  alAgregarRango: (diaId: string) => void;
  alQuitarRango: (diaId: string, indiceRango: number) => void;
  alEliminarDia: (diaId: string, asignacionIds: string[]) => void;
};

export function TarjetasDiasBarbero({
  dias,
  valores,
  alCambiar,
  alAlternarTrabajo,
  alAgregarRango,
  alQuitarRango,
  alEliminarDia,
}: Props) {
  return (
    <div className="space-y-3 md:hidden">
      {dias.map((dia) => {
        const estado = valores[dia.diaId];
        const trabaja = estado?.trabaja ?? false;
        const rangos = estado?.rangos ?? [];

        return (
          <article
            key={dia.diaId}
            className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[var(--admin-texto-primario)]">{dia.nombre}</h3>
                <p className="mt-0.5 text-xs text-[var(--admin-texto-muted)]">
                  {trabaja ? "Día laboral habilitado" : "No trabaja este día"}
                </p>
              </div>
              <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-xs font-medium text-[var(--admin-texto-secundario)]">
                Trabaja
                <input
                  type="checkbox"
                  checked={trabaja}
                  onChange={(evento) => alAlternarTrabajo(dia.diaId, evento.target.checked)}
                  className="peer sr-only"
                />
                <span className="relative h-7 w-12 rounded-full bg-[var(--admin-border-fuerte)] transition-colors peer-checked:bg-[var(--page-primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--page-focus-ring)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--admin-surface)] after:absolute after:left-0.5 after:top-0.5 after:h-6 after:w-6 after:rounded-full after:bg-[var(--admin-texto-primario)] peer-checked:after:bg-[var(--page-primary-foreground)] after:transition-transform peer-checked:after:translate-x-5" />
              </label>
            </div>

            {trabaja ? (
              <div className="mt-4 space-y-3">
                {rangos.map((rango, indice) => (
                  <div
                    key={indice}
                    className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <label className="grid gap-1.5 text-xs text-[var(--admin-texto-muted)]">
                        Desde
                        <input
                          type="time"
                          value={rango.desde}
                          onChange={(evento) => alCambiar(dia.diaId, indice, "desde", evento.target.value)}
                          className="min-w-0 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-3 py-2.5 text-sm text-[var(--admin-texto-primario)] focus:border-[var(--page-primary-50)] focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]"
                        />
                      </label>
                      <label className="grid gap-1.5 text-xs text-[var(--admin-texto-muted)]">
                        Hasta
                        <input
                          type="time"
                          value={rango.hasta}
                          onChange={(evento) => alCambiar(dia.diaId, indice, "hasta", evento.target.value)}
                          className="min-w-0 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-3 py-2.5 text-sm text-[var(--admin-texto-primario)] focus:border-[var(--page-primary-50)] focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]"
                        />
                      </label>
                    </div>
                    {rangos.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => alQuitarRango(dia.diaId, indice)}
                        className="mt-3 w-full border border-[var(--admin-border)] text-[var(--admin-texto-secundario)] hover:bg-red-500/10 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                        Quitar este rango
                      </Button>
                    )}
                  </div>
                ))}
                {rangos.length < MAX_RANGOS_POR_DIA && (
                  <button
                    type="button"
                    onClick={() => alAgregarRango(dia.diaId)}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--admin-border)] px-3 py-2.5 text-sm font-medium text-[var(--admin-texto-primario)] transition-colors hover:border-[var(--page-primary-50)] hover:bg-[var(--page-primary-15)]"
                  >
                    <Plus className="h-4 w-4 text-[var(--page-primary-tinta)]" />
                    Agregar horario cortado
                  </button>
                )}
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-xs leading-5 text-[var(--admin-texto-muted)]">
                Activá el interruptor para definir sus horarios de atención.
              </p>
            )}

            <div className="mt-4 border-t border-[var(--admin-border)] pt-3">
              {estado && estado.asignacionIds.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full border border-[var(--admin-border)] text-[var(--admin-texto-secundario)] hover:bg-red-500/10 hover:text-red-400"
                  onClick={() => alEliminarDia(dia.diaId, estado.asignacionIds)}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar horario guardado
                </Button>
              ) : (
                <p className="text-center text-xs text-[var(--admin-texto-muted)]">Sin horario guardado</p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
