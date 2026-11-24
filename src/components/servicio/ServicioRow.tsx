"use client";

import { useId, useState } from "react";
import { ChevronDown, Clock3, Scissors, SquarePen, Trash2 } from "lucide-react";
import Image from "next/image";
import EditServicioModal from "./EditServicioModal";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";
import type { Servicio, ServicioCreado } from "@/types/servicio";

type ServicioRowProps = {
  servicio: Servicio;
  puedeGestionar: boolean;
  onEliminar: (id: string) => void;
  onServicioActualizado?: (servicio: ServicioCreado) => void;
};

export default function ServicioRow({ servicio, puedeGestionar, onEliminar, onServicioActualizado }: ServicioRowProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [expandido, setExpandido] = useState(false);
  const idDescripcion = useId();

  return (
    <li className="min-w-0 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 lg:grid lg:grid-cols-[var(--servicio-columnas)] lg:items-center lg:gap-x-4 lg:rounded-none lg:border-0 lg:border-b lg:bg-transparent lg:px-4 lg:last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-[var(--page-primary-soft)] text-[var(--admin-acento-suave-texto)]">
          <Scissors aria-hidden="true" className="size-4" />
          {servicio.srcImage && (
            <Image
              src={servicio.srcImage}
              alt=""
              width={40}
              height={40}
              className="absolute inset-0 size-full object-cover"
              onError={(evento) => { evento.currentTarget.hidden = true; }}
            />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold [overflow-wrap:anywhere]">{servicio.nombre}</h3>
          {!servicio.estado && <span className="text-xs text-[var(--admin-texto-muted)]">Inactivo</span>}
        </div>
        {servicio.descripcion && (
          <button
            type="button"
            aria-label={`${expandido ? "Ocultar" : "Ver"} descripción de ${servicio.nombre}`}
            aria-expanded={expandido}
            aria-controls={idDescripcion}
            onClick={() => setExpandido((actual) => !actual)}
            className="grid size-11 shrink-0 place-items-center rounded-xl text-[var(--admin-acento-suave-texto)] hover:bg-[var(--admin-item)] lg:hidden"
          >
            <ChevronDown aria-hidden="true" className={`size-5 motion-safe:transition-transform ${expandido ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 pl-[52px] text-sm lg:contents">
        <span className="inline-flex items-center gap-1.5 text-[var(--admin-texto-muted)] lg:justify-end">
          <span className="sr-only">Duración: </span>
          <Clock3 aria-hidden="true" className="size-3.5 shrink-0 lg:hidden" />
          {servicio.duracion} min
        </span>
        <span className="font-semibold tabular-nums text-[var(--admin-texto-primario)] [overflow-wrap:anywhere] lg:text-right">
          <span className="sr-only">Precio: </span>
          ${formatearMoneda(servicio.precio)}
        </span>
      </div>

      {servicio.descripcion && (
        <p id={idDescripcion} className={`${expandido ? "block" : "hidden"} mt-3 border-t border-[var(--admin-border)] pt-3 text-sm text-[var(--admin-texto-muted)] [overflow-wrap:anywhere] lg:col-span-full lg:row-start-2 lg:mt-1 lg:block lg:border-0 lg:pl-[52px] lg:pt-0`}>
          {servicio.descripcion}
        </p>
      )}

      {puedeGestionar && (
        <div className="mt-3 flex items-center justify-end gap-1 border-t border-[var(--admin-border)] pt-1.5 lg:mt-0 lg:border-0 lg:pt-0">
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            title="Editar servicio"
            aria-label={`Editar ${servicio.nombre}`}
            className="grid size-11 place-items-center rounded-xl text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-item)] lg:size-9"
          >
            <SquarePen aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onEliminar(servicio.id)}
            title="Eliminar servicio"
            aria-label={`Eliminar ${servicio.nombre}`}
            className="grid size-11 place-items-center rounded-xl text-[var(--admin-error)] hover:bg-[var(--admin-error-suave)] lg:size-9"
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </button>
        </div>
      )}

      {showEditModal && (
        <EditServicioModal
          servicio={servicio}
          onClose={() => setShowEditModal(false)}
          onServicioActualizado={onServicioActualizado}
        />
      )}
    </li>
  );
}
