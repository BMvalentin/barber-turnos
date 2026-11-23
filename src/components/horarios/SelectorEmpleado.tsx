"use client";

import Image from "next/image";
import { useMemo } from "react";
import { User } from "lucide-react";
import SelectorDesplegable from "@/components/ui/SelectorDesplegable";
import type { OpcionDesplegable } from "@/components/ui/SelectorDesplegable";
import type { BarberoParaHorarios } from "@/types/horarios";

type Props = {
  barberos: BarberoParaHorarios[];
  valor: string;
  alCambiar: (id: string) => void;
};

function FotoEmpleado({ src }: { src: string | null }) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--page-primary-20)] text-[var(--admin-texto-primario)]"
    >
      <User className="h-4 w-4" />
    </span>
  );
}

export default function SelectorEmpleado({ barberos, valor, alCambiar }: Props) {
  const opciones = useMemo<OpcionDesplegable<string>[]>(
    () => barberos.map((barbero) => {
      const nombre = barbero.nombre ?? "Sin nombre";
      return {
        valor: barbero.id,
        etiqueta: nombre,
        icono: <FotoEmpleado src={barbero.srcImage} />,
      };
    }),
    [barberos],
  );

  return (
    <div className="grid gap-2 sm:w-80">
      <label htmlFor="horario-empleado" className="text-sm font-semibold text-[var(--admin-texto-primario)]">Integrante del equipo</label>
      <SelectorDesplegable
        id="horario-empleado"
        opciones={opciones}
        valor={valor}
        onChange={alCambiar}
        placeholder={barberos.length === 0 ? "Sin perfiles" : "Seleccionar perfil…"}
        deshabilitado={barberos.length === 0}
        claseBoton="min-h-11"
      />
    </div>
  );
}
