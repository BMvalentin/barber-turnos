"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import ServicioList from "@/components/servicio/ServicioList";
import type { Servicio } from "@/types/servicio";

export default function ServicioCatalogoCliente({
  servicios,
  puedeGestionar,
}: {
  servicios: Servicio[] | null;
  puedeGestionar: boolean;
}) {
  const router = useRouter();
  const [reintentando, reintentar] = useTransition();

  if (servicios) return <ServicioList servicios={servicios} puedeGestionar={puedeGestionar} />;

  return (
    <div role="alert" className="admin-card space-y-3 p-4 text-sm text-[var(--admin-texto-muted)]">
      <p>No se pudo cargar el catálogo de servicios.</p>
      <button
        type="button"
        disabled={reintentando}
        onClick={() => reintentar(() => router.refresh())}
        className="admin-control"
      >
        {reintentando ? "Cargando catálogo..." : "Reintentar"}
      </button>
    </div>
  );
}
