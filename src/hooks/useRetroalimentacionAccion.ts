"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { toast } from "@/lib/toast";
import type { ActionState } from "@/types/action-state";

export type OpcionesRetroalimentacionAccion = {
  mensajeExito?: string;
  descripcionExito?: string;
  mensajeError?: string;
  descripcionError?: string;
  mensajeAdvertencia?: string;
  onExito?: () => void | Promise<void>;
  refrescar?: boolean;
  recargarPagina?: boolean;
};

export function useRetroalimentacionAccion(
  opciones: OpcionesRetroalimentacionAccion = {},
) {
  const router = useRouter();
  const opcionesRef = useRef(opciones);
  opcionesRef.current = opciones;

  const retroalimentar = useCallback(
    async (
      estado: ActionState,
      mensajeExito?: string,
      descripcionExito?: string,
    ) => {
      const {
        mensajeExito: mensajeExitoBase,
        descripcionExito: descripcionExitoBase,
        mensajeError,
        descripcionError,
        mensajeAdvertencia,
        onExito,
        refrescar,
        recargarPagina,
      } = opcionesRef.current;

      if (estado.success) {
        toast({
          title: mensajeExito ?? mensajeExitoBase ?? "Éxito",
          description: descripcionExito ?? descripcionExitoBase,
          variant: "default",
          duration: 4000,
        });
        await onExito?.();
        if (recargarPagina) {
          window.location.reload();
        } else if (refrescar) {
          router.refresh();
        }
      } else if (estado.error) {
        toast({
          title: mensajeError ?? "Error",
          description:
            estado.error ||
            descripcionError ||
            "Ocurrió un error al procesar la solicitud.",
          variant: "destructive",
          duration: 4000,
        });
      } else if (estado.warning) {
        toast({
          title: mensajeAdvertencia ?? "Atención",
          description: estado.warning,
          variant: "default",
          duration: 4000,
        });
      }

      return estado;
    },
    [router],
  );

  return { retroalimentar };
}
