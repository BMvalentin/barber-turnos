"use client";

import { useEffect, useRef, useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import type { BarberoParaHorarios } from "@/types/horarios";

type Props = {
  destinos: BarberoParaHorarios[];
  pendiente: boolean;
  alCopiar: (barberoId: string) => void;
};

export default function CopiarHorario({ destinos, pendiente, alCopiar }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [barberoId, setBarberoId] = useState("");
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;

    const alPresionarFuera = (evento: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target as Node)) {
        setAbierto(false);
      }
    };
    const alPresionarEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };

    document.addEventListener("mousedown", alPresionarFuera);
    document.addEventListener("keydown", alPresionarEscape);
    return () => {
      document.removeEventListener("mousedown", alPresionarFuera);
      document.removeEventListener("keydown", alPresionarEscape);
    };
  }, [abierto]);

  const ejecutarCopia = () => {
    if (!barberoId || pendiente) return;
    alCopiar(barberoId);
    setBarberoId("");
    setAbierto(false);
  };

  return (
    <div className="relative" ref={contenedorRef}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setAbierto((v) => !v)}
        className="text-[var(--admin-texto-secundario)]"
      >
        <Copy className="h-4 w-4" />
        Copiar horario a otro
      </Button>

      {abierto && (
        <div
          className="absolute bottom-full left-0 z-50 mb-2 w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-3 shadow-xl sm:w-80"
        >
          <div className="flex items-center gap-2">
            <select
              value={barberoId}
              onChange={(e) => setBarberoId(e.target.value)}
              className="min-w-0 flex-1 rounded-lg px-3 py-2 text-sm text-[var(--admin-texto-primario)] focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]"
              style={{
                backgroundColor: "var(--admin-surface)",
                border: "1px solid var(--admin-border)",
              }}
            >
              <option value="">Seleccionar empleado...</option>
              {destinos.map((destino) => (
                <option key={destino.id} value={destino.id}>
                  {destino.nombre ?? "Sin nombre"}
                </option>
              ))}
            </select>
            <Button
              type="button"
              size="sm"
              disabled={!barberoId || pendiente}
              onClick={ejecutarCopia}
              className="bg-[var(--page-primary)] text-[var(--page-primary-foreground)] hover:bg-[var(--page-primary-hover)]"
            >
              Copiar
            </Button>
          </div>
          {destinos.length === 0 && (
            <p className="mt-2 text-xs text-[var(--admin-texto-muted)]">
              No hay otros empleados para copiar el horario.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
