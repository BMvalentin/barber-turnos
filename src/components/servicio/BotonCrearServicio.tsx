"use client";

import { ESTILO_FONDO_MARCA } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export default function BotonCrearServicio({
  pending,
}: {
  pending: boolean;
}) {
  return (
    <Button 
      className="font-bold text-xs uppercase tracking-wider py-3 px-8 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-[var(--page-primary-foreground)]"
      style={ESTILO_FONDO_MARCA}
      type="submit"
      disabled={pending}
    >
      {pending ? "Creando..." : "Crear Servicio"}
    </Button>
  );
}