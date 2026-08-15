"use client";

import type { CSSProperties, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button/Button";
import { CLASES_BOTON_MARCA } from "@/lib/constants";

type BotonSubmitPendingProps = {
  pendiente: boolean;
  texto: ReactNode;
  textoMientrasCarga?: string;
  deshabilitado?: boolean;
  tipo?: "submit" | "button";
  mostrarSpinner?: boolean;
  claseAdicional?: string;
  estiloAdicional?: CSSProperties;
  onClic?: () => void;
};

export default function BotonSubmitPending({
  pendiente,
  texto,
  textoMientrasCarga = "Guardando...",
  deshabilitado = false,
  tipo = "submit",
  mostrarSpinner = true,
  claseAdicional,
  estiloAdicional,
  onClic,
}: BotonSubmitPendingProps) {
  return (
    <Button
      type={tipo}
      onClick={onClic}
      disabled={pendiente || deshabilitado}
      className={cn(
        CLASES_BOTON_MARCA,
        "flex items-center gap-2 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed",
        claseAdicional,
      )}
      style={estiloAdicional}
    >
      {pendiente ? (
        <>
          {mostrarSpinner && <Loader2 className="h-4 w-4 animate-spin" />}
          {textoMientrasCarga}
        </>
      ) : (
        texto
      )}
    </Button>
  );
}
