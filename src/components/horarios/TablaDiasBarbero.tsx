"use client";

import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge/Badge";
import { Button } from "@/components/ui/button/Button";

export type EstadoDiaEditor = {
  trabaja: boolean;
  desde: string;
  hasta: string;
  asignacionId?: string;
  rangosExtra: number;
};

type Props = {
  dias: { diaId: string; dia: number; nombre: string }[];
  valores: Record<string, EstadoDiaEditor>;
  alCambiar: (diaId: string, campo: "trabaja" | "desde" | "hasta", valor: string | boolean) => void;
  alEliminarDia: (diaId: string, asignacionId: string) => void;
};

const CLASE_ENCABEZADO =
  "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-texto-muted)]";

const CLASE_INPUT_HORA =
  "rounded-lg px-3 py-2 bg-[var(--admin-surface-elevated)] text-[var(--admin-texto-primario)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:border-[var(--page-primary)]/60 focus:ring-2 focus:ring-[var(--page-focus-ring)]";

export function TablaDiasBarbero({ dias, valores, alCambiar, alEliminarDia }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="bg-[var(--admin-surface-elevated)]">
            <th className={CLASE_ENCABEZADO}>Día</th>
            <th className={CLASE_ENCABEZADO}>¿Trabaja?</th>
            <th className={CLASE_ENCABEZADO}>Hora de inicio</th>
            <th className={CLASE_ENCABEZADO}>Hora de fin</th>
            <th className={CLASE_ENCABEZADO}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {dias.map((dia) => {
            const estado = valores[dia.diaId];
            const asignacionId = estado?.asignacionId;
            return (
              <tr key={dia.diaId} className="border-t" style={{ borderColor: "var(--admin-border)" }}>
                <td className="px-4 py-3 align-middle">
                  <span className="font-medium text-[var(--admin-texto-primario)]">{dia.nombre}</span>
                  {estado && estado.rangosExtra > 0 && (
                    <Badge
                      className="mt-1 text-[10px]"
                      style={{
                        backgroundColor: "var(--page-primary-20)",
                        color: "var(--admin-texto-primario)",
                        borderColor: "var(--page-primary-50)",
                      }}
                    >
                      +{estado.rangosExtra} rango{estado.rangosExtra > 1 ? "s" : ""}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 align-middle">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={estado?.trabaja ?? false}
                      onChange={(e) => alCambiar(dia.diaId, "trabaja", e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="h-6 w-11 rounded-full bg-[var(--admin-border)] transition-colors peer-checked:bg-[var(--page-primary)] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
                  </label>
                </td>
                <td className="px-4 py-3 align-middle">
                  <input
                    type="time"
                    value={estado?.desde ?? ""}
                    onChange={(e) => alCambiar(dia.diaId, "desde", e.target.value)}
                    disabled={!estado?.trabaja}
                    className={CLASE_INPUT_HORA}
                    style={{ border: "1px solid var(--admin-border)" }}
                  />
                </td>
                <td className="px-4 py-3 align-middle">
                  <input
                    type="time"
                    value={estado?.hasta ?? ""}
                    onChange={(e) => alCambiar(dia.diaId, "hasta", e.target.value)}
                    disabled={!estado?.trabaja}
                    className={CLASE_INPUT_HORA}
                    style={{ border: "1px solid var(--admin-border)" }}
                  />
                </td>
                <td className="px-4 py-3 align-middle">
                  {asignacionId ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:bg-red-500/10"
                      onClick={() => alEliminarDia(dia.diaId, asignacionId)}
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
