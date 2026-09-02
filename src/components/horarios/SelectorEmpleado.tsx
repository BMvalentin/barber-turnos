"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, User } from "lucide-react";
import type { BarberoParaHorarios } from "@/types/horarios";

type Props = {
  barberos: BarberoParaHorarios[];
  valor: string;
  alCambiar: (id: string) => void;
};

function FotoEmpleado({ src, nombre }: { src: string | null; nombre: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={`Foto de ${nombre}`}
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--page-primary-20)] text-[var(--admin-texto-primario)]">
      <User className="h-4 w-4" />
    </span>
  );
}

export default function SelectorEmpleado({ barberos, valor, alCambiar }: Props) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const seleccionado = barberos.find((b) => b.id === valor);

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

  return (
    <div className="relative w-full sm:w-80" ref={contenedorRef}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        className="flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-[var(--admin-item-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]"
        style={{
          backgroundColor: "var(--admin-surface-elevated)",
          borderColor: "var(--admin-border)",
        }}
      >
        <span className="flex min-w-0 items-center gap-3">
          {seleccionado ? (
            <>
              <FotoEmpleado src={seleccionado.srcImage} nombre={seleccionado.nombre ?? "Empleado"} />
              <span className="truncate text-sm font-medium text-[var(--admin-texto-primario)]">
                {seleccionado.nombre ?? "Sin nombre"}
              </span>
            </>
          ) : (
            <span className="text-sm text-[var(--admin-texto-muted)]">
              {barberos.length === 0 ? "Sin empleados" : "Seleccionar empleado..."}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--admin-texto-muted)] transition-transform ${abierto ? "rotate-180" : ""}`}
        />
      </button>

      {abierto && barberos.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-1 shadow-xl"
        >
          {barberos.map((barbero) => {
            const esSeleccionado = barbero.id === valor;
            return (
              <li key={barbero.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={esSeleccionado}
                  onClick={() => {
                    alCambiar(barbero.id);
                    setAbierto(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    esSeleccionado
                      ? "bg-[var(--page-primary-20)] text-[var(--admin-texto-primario)]"
                      : "text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-border)] hover:text-[var(--admin-texto-primario)]"
                  }`}
                >
                  <FotoEmpleado src={barbero.srcImage} nombre={barbero.nombre ?? "Empleado"} />
                  <span className="truncate font-medium">{barbero.nombre ?? "Sin nombre"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
