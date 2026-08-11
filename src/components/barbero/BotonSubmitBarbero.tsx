"use client";

import { Button } from "@/components/ui/button";
import { ESTILO_FONDO_MARCA } from "@/lib/constants";

type Props = {
  isPending: boolean;
  deshabilitado?: boolean;
  anchoCompleto?: boolean;
  texto: string;
  onClic?: () => void;
};

export default function BotonSubmitBarbero({
  isPending,
  deshabilitado = false,
  anchoCompleto = true,
  texto,
  onClic,
}: Props) {
  return (
    <Button
      type="button"
      onClick={onClic}
      disabled={isPending || deshabilitado}
      className={`${
        anchoCompleto ? "w-full shadow-lg" : "flex-1 hover:opacity-90"
      } text-[var(--page-primary-foreground)] transition-all`}
      style={ESTILO_FONDO_MARCA}
    >
      {isPending ? "Guardando..." : texto}
    </Button>
  );
}