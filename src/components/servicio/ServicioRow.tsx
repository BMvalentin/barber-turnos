"use client";

import { useState } from "react";
import { Clock, Scissors, SquarePen, Trash2 } from "lucide-react";
import EditServicioModal from "./EditServicioModal";
import type { Servicio } from "@/types/servicio";
import type { Barbero } from "@/types/barbero";

type ServicioRowProps = {
  servicio: Servicio;
  barberos: Barbero[];
  onEliminar: (id: string) => void;
};

export default function ServicioRow({
  servicio,
  barberos,
  onEliminar,
}: ServicioRowProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <div className="flex flex-col md:grid md:grid-cols-12 gap-4 p-4 md:items-center hover:bg-white/5 transition-colors duration-150 group">
        <div className="md:col-span-6 flex items-start md:items-center gap-4">
          <div
            className="w-10 h-10 rounded-lg bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] flex items-center justify-center flex-shrink-0"
            style={{ color: "var(--page-primary-tinta)" }}
          >
            {servicio.srcImage ? (
              <img
                src={servicio.srcImage}
                alt={servicio.nombre}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <Scissors className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-[var(--admin-texto-primario)] font-semibold text-sm">
              {servicio.nombre}
            </h3>
            {servicio.descripcion && (
              <p className="text-[var(--admin-texto-muted)] text-xs line-clamp-2 md:max-w-[350px] mt-0.5">
                {servicio.descripcion}
              </p>
            )}
          </div>
        </div>

        <div className="hidden md:flex col-span-2 justify-center items-center gap-1 text-[var(--admin-texto-muted)] text-sm">
          <Clock className="w-3 h-3" />
          {servicio.duracion} min
        </div>

        <div
          className="hidden md:flex col-span-2 justify-center font-semibold text-sm"
          style={{ color: "var(--page-primary-tinta)" }}
        >
          ${servicio.precio}
        </div>

        <div className="hidden md:flex col-span-2 justify-end gap-2 items-center">
          <button
            onClick={() => setShowEditModal(true)}
            title="Editar servicio"
            className="text-[var(--admin-texto-muted)] transition-colors duration-150 p-1 hover:bg-white/5 rounded"
            style={{ color: "var(--page-primary-tinta)" }}
          >
            <SquarePen className="w-5 h-5" />
          </button>
          <button
            onClick={() => onEliminar(servicio.id)}
            title="Eliminar servicio"
            className="text-[var(--admin-texto-muted)] hover:text-red-500 transition-colors duration-150 p-1 hover:bg-white/5 rounded"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex md:hidden items-center justify-between mt-2 pt-3 border-t border-[var(--admin-border)]">
          <div className="flex items-center gap-4">
            <span
              className="font-semibold text-sm"
              style={{ color: "var(--page-primary-tinta)" }}
            >
              ${servicio.precio}
            </span>
            <span className="flex items-center gap-1 text-[var(--admin-texto-muted)] text-sm">
              <Clock className="w-3 h-3" /> {servicio.duracion} min
            </span>
          </div>
          <div className="flex justify-end gap-2 items-center">
            <button
              onClick={() => setShowEditModal(true)}
              title="Editar servicio"
              className="text-[var(--admin-texto-muted)] transition-colors duration-150 p-1.5 bg-[var(--admin-surface-elevated)] rounded border border-[var(--admin-border)]"
            >
              <SquarePen className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEliminar(servicio.id)}
              title="Eliminar servicio"
              className="text-[var(--admin-texto-muted)] hover:text-red-500 transition-colors duration-150 p-1.5 bg-[var(--admin-surface-elevated)] rounded border border-[var(--admin-border)]"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditServicioModal
          servicio={servicio}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}