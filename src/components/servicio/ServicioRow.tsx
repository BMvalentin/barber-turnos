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
      <div className="flex flex-col md:grid md:grid-cols-12 gap-4 p-4 md:items-center hover:bg-[#14110C]/80 transition-colors group">
        <div className="md:col-span-6 flex items-start md:items-center gap-4">
          <div
            className="w-10 h-10 rounded-lg bg-[#251f15] border border-[#2C261D] flex items-center justify-center flex-shrink-0"
            style={{ color: "var(--page-primary)" }}
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
            <h3 className="text-[#E4E0D9] font-semibold text-sm">
              {servicio.nombre}
            </h3>
            {servicio.descripcion && (
              <p className="text-[#8E8675] text-xs line-clamp-2 md:max-w-[350px] mt-0.5">
                {servicio.descripcion}
              </p>
            )}
          </div>
        </div>

        <div className="hidden md:flex col-span-2 justify-center items-center gap-1 text-[#8E8675] text-sm">
          <Clock className="w-3 h-3" />
          {servicio.duracion} min
        </div>

        <div
          className="hidden md:flex col-span-2 justify-center font-semibold text-sm"
          style={{ color: "var(--page-primary)" }}
        >
          ${servicio.precio}
        </div>

        <div className="hidden md:flex col-span-2 justify-end gap-2 items-center">
          <button
            onClick={() => setShowEditModal(true)}
            title="Editar servicio"
            className="text-[#8E8675] transition-colors p-1"
            style={{ color: "var(--page-primary)" }}
          >
            <SquarePen className="w-5 h-5" />
          </button>
          <button
            onClick={() => onEliminar(servicio.id)}
            title="Eliminar servicio"
            className="text-[#8E8675] hover:text-red-500 transition-colors p-1"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex md:hidden items-center justify-between mt-2 pt-3 border-t border-[#2C261D]/50">
          <div className="flex items-center gap-4">
            <span
              className="font-semibold text-sm"
              style={{ color: "var(--page-primary)" }}
            >
              ${servicio.precio}
            </span>
            <span className="flex items-center gap-1 text-[#8E8675] text-sm">
              <Clock className="w-3 h-3" /> {servicio.duracion} min
            </span>
          </div>
          <div className="flex justify-end gap-2 items-center">
            <button
              onClick={() => setShowEditModal(true)}
              title="Editar servicio"
              className="text-[#8E8675] transition-colors p-1.5 bg-[#1C1812] rounded border border-[#2C261D]"
            >
              <SquarePen className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEliminar(servicio.id)}
              title="Eliminar servicio"
              className="text-[#8E8675] hover:text-red-500 transition-colors p-1.5 bg-[#1C1812] rounded border border-[#2C261D]"
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