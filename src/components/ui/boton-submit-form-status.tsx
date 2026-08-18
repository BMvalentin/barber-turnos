"use client";

import type { CSSProperties, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button/Button";
import { CLASES_BOTON_MARCA } from "@/lib/constants";

type BotonSubmitFormStatusProps = {
  texto: ReactNode;
  textoMientrasCarga?: string;
  mostrarSpinner?: boolean;
  claseAdicional?: string;
  estiloAdicional?: CSSProperties;
};

export default function BotonSubmitFormStatus({
  texto,
  textoMientrasCarga = "Guardando...",
  mostrarSpinner = true,
  claseAdicional,
  estiloAdicional,
}: BotonSubmitFormStatusProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={cn(
        CLASES_BOTON_MARCA,
        "flex items-center gap-2 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed",
        claseAdicional,
      )}
      style={estiloAdicional}
    >
      {pending ? (
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
