"use client";

import { useState } from "react";
import { CalendarDays, Globe2, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { softDeleteExcepcion } from "@/actions/excepciones/eliminar.actions";
import { ConfirmDialog } from "@/components/ui/confirm-modal";
import EmptyState from "@/components/ui/EmptyState";
import { formatearHora } from "@/lib/utils/formatear-hora";
import type { ExcepcionLaboral } from "@/types/excepcion";

type ListaFeriadosYCierresProps = {
  excepciones: ExcepcionLaboral[];
};

export function ListaFeriadosYCierres({ excepciones }: ListaFeriadosYCierresProps) {
  const [idPendienteDeEliminar, setIdPendienteDeEliminar] = useState<string | null>(null);
  const router = useRouter();

  const confirmarEliminacion = async () => {
    if (!idPendienteDeEliminar) {
      return;
    }

    try {
      const datosFormulario = new FormData();
      datosFormulario.append("id", idPendienteDeEliminar);
      await softDeleteExcepcion(datosFormulario);
      setIdPendienteDeEliminar(null);
      toast.success("Cierre eliminado", {
        description: "El feriado o cierre dejó de bloquear la disponibilidad.",
      });
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar el cierre", {
        description: "Intentá nuevamente en unos instantes.",
      });
    }
  };

  if (excepciones.length === 0) {
    return (
      <EmptyState
        icono={<CalendarDays />}
        mensaje="Todavía no hay feriados ni cierres configurados"
        claseContenedor="py-10"
        claseIcono="h-12 w-12 opacity-40"
        estiloIcono={{ color: "var(--page-primary-tinta)" }}
        estiloMensaje={{ color: "var(--admin-texto-muted)" }}
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-[var(--admin-border)]">
        <div className="min-w-[680px] divide-y divide-[var(--admin-border)]">
          <div className="grid grid-cols-[minmax(13rem,1.5fr)_minmax(10rem,1fr)_minmax(11rem,1fr)_minmax(11rem,1fr)_3rem] gap-4 bg-[var(--admin-surface-elevated)] px-4 py-3 text-xs font-medium uppercase tracking-wide text-[var(--admin-texto-muted)]">
            <span>Motivo</span>
            <span>Alcance</span>
            <span>Desde</span>
            <span>Hasta</span>
            <span className="sr-only">Acciones</span>
          </div>
          {excepciones.map((excepcion) => (
            <div
              key={excepcion.id}
              className="grid grid-cols-[minmax(13rem,1.5fr)_minmax(10rem,1fr)_minmax(11rem,1fr)_minmax(11rem,1fr)_3rem] items-center gap-4 px-4 py-4 text-sm transition-colors hover:bg-[var(--page-primary-08)]"
            >
              <p className="min-w-0 truncate font-medium text-[var(--admin-texto-primario)]">
                {excepcion.motivo}
              </p>
              <span className="flex w-fit items-center gap-1.5 rounded-full border border-[var(--page-primary-30)] bg-[var(--page-primary-15)] px-2.5 py-1 text-xs text-[var(--admin-texto-primario)]">
                {excepcion.barbero ? <UserRound className="h-3.5 w-3.5" /> : <Globe2 className="h-3.5 w-3.5" />}
                {excepcion.barbero?.nombre ?? "Toda la barbería"}
              </span>
              <FechaExcepcion fecha={excepcion.desde} />
              <FechaExcepcion fecha={excepcion.hasta} />
              <button
                type="button"
                title="Eliminar cierre"
                aria-label={`Eliminar ${excepcion.motivo}`}
                onClick={() => setIdPendienteDeEliminar(excepcion.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-500/20 text-red-400 transition-colors hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      {idPendienteDeEliminar ? (
        <ConfirmDialog
          title="Eliminar cierre"
          message="¿Querés eliminar este feriado o cierre? Los turnos podrán volver a reservarse en ese horario."
          onConfirm={confirmarEliminacion}
          onCancel={() => setIdPendienteDeEliminar(null)}
        />
      ) : null}
    </>
  );
}

function FechaExcepcion({ fecha }: { fecha: Date }) {
  return (
    <div className="text-[var(--admin-texto-primario)]">
      <p>{new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(fecha)}</p>
      <p className="mt-0.5 text-xs text-[var(--admin-texto-muted)]">{formatearHora(fecha)}</p>
    </div>
  );
}
