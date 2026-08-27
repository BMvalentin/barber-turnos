"use client";

import { Check } from "lucide-react";
import type { BarberoData } from "@/types/turno";

type Props = {
  barberos: BarberoData[];
  seleccionadoId: string;
  onChange: (id: string) => void;
  name?: string;
};

export default function SelectorBarberoTarjetas({
  barberos,
  seleccionadoId,
  onChange,
  name,
}: Props) {
  return (
    <div className="flex flex-wrap gap-4">
      {name && <input type="hidden" name={name} value={seleccionadoId} />}
      {barberos.map((barbero) => {
        const seleccionado = barbero.id === seleccionadoId;
        return (
          <button
            key={barbero.id}
            type="button"
            aria-pressed={seleccionado}
            onClick={() => onChange(barbero.id)}
            className="relative rounded-2xl border p-4 flex flex-col items-center gap-2 transition-all duration-200 focus:outline-none bg-transparent hover:bg-[var(--page-primary-60)]"
            style={{
              borderColor: seleccionado
                ? "var(--page-primary)"
                : "var(--page-primary-20)",
              backgroundColor: seleccionado
                ? "var(--page-primary-15)"
                : undefined,
              transform: seleccionado ? "scale(1.03)" : undefined,
              outlineColor: "var(--page-primary)",
            }}
          >
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-full"
              style={
                seleccionado
                  ? { boxShadow: "0 0 0 2px var(--page-primary)" }
                  : undefined
              }
            >
              {barbero.srcImage ? (
                <img
                  src={barbero.srcImage}
                  alt={barbero.nombre}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center rounded-full text-2xl font-bold"
                  style={{
                    backgroundColor: "var(--page-primary-30)",
                    color: "var(--page-primary-tinta)",
                  }}
                >
                  {barbero.nombre.trim().charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
            <span
              className="max-w-28 truncate text-sm font-medium"
              style={{ color: "var(--page-primary-tinta)" }}
            >
              {barbero.nombre}
            </span>
            {seleccionado && (
              <span
                className="absolute top-2 right-2 rounded-full p-1"
                style={{ backgroundColor: "var(--page-primary)" }}
              >
                <Check
                  className="h-3 w-3"
                  style={{ color: "var(--page-primary-foreground)" }}
                />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
