"use client";

import { useState } from "react";
import EditBarberoModal from "./EditBarberoModal";
import { deleteBarbero } from "@/actions/barbero.actions";
import { User } from "lucide-react";

type Barbero = {
  id: string;
  nombre: string | null;
  srcImage: string | null;
  estado: boolean;

  servicios?: {
    servicio: {
      id: string;
      nombre: string;
    };
  }[];
  horarios?: {
    margenLaboralId: string;
    margenLaboral: {
      desde: string;
      hasta: string;
    };
  }[];
};

export default function BarberoList({
  barberos = [],
  servicios = [],
  diasLaborales = [],
}: {
  barberos?: Barbero[];
  servicios?: any[];
  diasLaborales?: any[];
}) {
  if (!barberos.length) {
    return (
      <div className="bg-black/40 p-8 text-center rounded-lg">
        <User className="h-16 w-16 text-amber-500/30 mx-auto mb-4" />
        <p className="text-amber-200/70">No hay barberos disponibles</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {barberos.map((b) => (
        <BarberoCard
          key={b.id}
          barbero={b}
          servicios={servicios}
          diasLaborales={diasLaborales}
        />
      ))}
    </div>
  );
}

function BarberoCard({
  barbero,
  servicios,
  diasLaborales,
}: {
  barbero: Barbero;
  servicios: any[];
  diasLaborales: any[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="bg-black/40 border border-amber-900/30 rounded-xl overflow-hidden">
        {/* IMAGEN */}
        <div className="h-48">
          {barbero.srcImage ? (
            <img
              src={barbero.srcImage}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <User className="h-12 w-12 text-amber-500/30" />
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <h3 className="text-white font-bold">{barbero.nombre}</h3>

          {/* ✅ SERVICIOS */}
          <div>
            <p className="text-xs text-amber-400 mb-1">Servicios:</p>
            <div className="flex flex-wrap gap-1">
              {barbero.servicios?.length ? (
                barbero.servicios.map((s) => (
                  <span
                    key={s.servicio.id}
                    className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded"
                  >
                    {s.servicio.nombre}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">Sin servicios</span>
              )}
            </div>
          </div>
          {/* ✅ HORARIOS */}
          <div>
            <p className="text-xs text-amber-400 mb-1">Horarios:</p>
            <div className="flex flex-wrap gap-1">
              {barbero.horarios?.length ? (
                barbero.horarios.map((h) => (
                  <span
                    key={h.margenLaboralId}
                    className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded"
                  >
                    {h.margenLaboral.desde} - {h.margenLaboral.hasta}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">Sin horarios</span>
              )}
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex gap-2 pt-3 border-t border-amber-900/30">
            <button
              onClick={() => setOpen(true)}
              className="flex-1 bg-amber-600 text-white py-2 rounded"
            >
              Editar
            </button>

            <form action={deleteBarbero}>
              <input type="hidden" name="id" value={barbero.id} />
              <button className="px-3 py-2 bg-red-500/20 text-red-400 rounded">
                Baja
              </button>
            </form>
          </div>
        </div>
      </div>

      {open && (
        <EditBarberoModal
          barbero={barbero}
          servicios={servicios}
          diasLaborales={diasLaborales}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
