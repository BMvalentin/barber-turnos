"use client";

import { X } from "lucide-react";
import { ESTILO_FONDO_MARCA } from "@/lib/constants";

type Props = {
  onCerrar: () => void;
};

export default function EncabezadoModalBarbero({ onCerrar }: Props) {
  return (
    <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: `var(--page-primary-40)` }}>
      <h2 className="text-2xl font-bold text-white">Editar Barbero</h2>
      <button
        onClick={onCerrar}
        className="rounded-sm transition-opacity hover:opacity-100 focus:outline-none p-1 text-[var(--page-primary-foreground)] hover:cursor-pointer"
        style={ESTILO_FONDO_MARCA}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}