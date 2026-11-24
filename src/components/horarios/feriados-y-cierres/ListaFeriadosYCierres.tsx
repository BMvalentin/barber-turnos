"use client";

import { useState } from "react";
import { CalendarDays, Globe2, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { softDeleteExcepcion } from "@/actions/excepciones/eliminar.actions";
import { ConfirmDialog } from "@/components/ui/confirm-modal";
import EmptyState from "@/components/ui/EmptyState";
import { formatearHora } from "@/lib/utils/formatear-hora";
import { ZONA_HORARIA } from "@/lib/constants";
import type { ExcepcionLaboral } from "@/types/excepcion";

type ListaFeriadosYCierresProps = {
  excepciones: ExcepcionLaboral[];
};

const formatoFecha = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeZone: ZONA_HORARIA });

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
      const resultado = await softDeleteExcepcion(datosFormulario);
      if (!resultado.success) {
        toast.error(resultado.error ?? "No se pudo eliminar el cierre");
        return;
      }
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
      <ul className="grid gap-2 p-3 sm:gap-0 sm:divide-y sm:divide-[var(--admin-border)] sm:p-0">
        {excepciones.map((excepcion) => (
          <li
            key={excepcion.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 rounded-xl bg-[var(--admin-surface-elevated)] p-3 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto] sm:items-center sm:gap-4 sm:rounded-none sm:bg-transparent sm:px-6 sm:py-4"
          >
            <div className="col-start-1 row-start-1 min-w-0">
              <p className="font-semibold break-words text-[var(--admin-texto-primario)]">
                {excepcion.motivo}
              </p>
              <span className="mt-1 flex items-center gap-1.5 text-xs text-[var(--admin-texto-muted)]">
                {excepcion.barbero ? <UserRound className="size-3.5 shrink-0" aria-hidden="true" /> : <Globe2 className="size-3.5 shrink-0" aria-hidden="true" />}
                <span className="min-w-0 break-words">{excepcion.barbero?.nombre ?? "Toda la barbería"}</span>
              </span>
            </div>
            <dl className="col-span-2 col-start-1 row-start-2 grid grid-cols-2 gap-2 border-t border-[var(--admin-border)] pt-2 tabular-nums sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:border-t-0 sm:pt-0">
              <FechaExcepcion etiqueta="Desde" fecha={excepcion.desde} />
              <FechaExcepcion etiqueta="Hasta" fecha={excepcion.hasta} />
            </dl>
            <button
              type="button"
              title="Eliminar cierre"
              aria-label={`Eliminar ${excepcion.motivo}`}
              onClick={() => setIdPendienteDeEliminar(excepcion.id)}
              className="col-start-2 row-start-1 grid size-11 place-items-center rounded-lg text-[var(--admin-texto-muted)] transition-colors hover:bg-[var(--admin-error-suave)] hover:text-[var(--admin-error)] focus-visible:outline-2 focus-visible:outline-[var(--page-focus-ring)] sm:col-start-3"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
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

function FechaExcepcion({ etiqueta, fecha }: { etiqueta: string; fecha: Date }) {
  return (
    <div>
      <dt className="text-xs text-[var(--admin-texto-muted)]">{etiqueta}</dt>
      <dd className="mt-0.5 text-[var(--admin-texto-primario)]">
        <time dateTime={fecha.toISOString()}>
          {formatoFecha.format(fecha)} <span className="inline-block text-xs text-[var(--admin-texto-muted)]">{formatearHora(fecha)}</span>
        </time>
      </dd>
    </div>
  );
}
