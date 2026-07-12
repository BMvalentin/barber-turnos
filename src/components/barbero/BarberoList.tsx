"use client";

import { useState } from "react";
import EditBarberoModal from "./EditBarberoModal";
import { deleteBarbero } from "@/actions/barbero.actions";
import { User } from "lucide-react";
import { Button } from "../ui/button";

type HorarioBarbero = {
  margenLaboralId: string;
  dia: {
    id: string;
    dia: string; // "Lunes" | "Martes" | ... (enum dias_laborales)
  };
  margenLaboral: {
    desde: string;
    hasta: string;
  };
};

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
  horarios?: HorarioBarbero[];
};

// Orden fijo para que los días no aparezcan salteados / desordenados
const ORDEN_DIAS = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo",
];

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

function agruparHorariosPorDia(
  horarios: HorarioBarbero[] = []
): Record<string, HorarioBarbero[]> {
  const acc: Record<string, HorarioBarbero[]> = {};
  for (const h of horarios) {
    const nombreDia = h.dia.dia;
    if (!acc[nombreDia]) acc[nombreDia] = [];
    acc[nombreDia].push(h);
  }
  return acc;
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

  const horariosPorDia = agruparHorariosPorDia(barbero.horarios);

  const diasConHorario = Object.keys(horariosPorDia).sort(
    (a, b) => ORDEN_DIAS.indexOf(a) - ORDEN_DIAS.indexOf(b)
  );

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

          {/* SERVICIOS */}
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

          {/* HORARIOS AGRUPADOS POR DÍA */}
          <div>
            <p className="text-xs text-amber-400 mb-1">Horarios:</p>
            {diasConHorario.length ? (
              <div className="space-y-1.5">
                {diasConHorario.map((dia) => (
                  <div key={dia} className="flex items-start gap-2">
                    <span className="text-[11px] font-semibold text-white w-16 flex-shrink-0 pt-0.5">
                      {dia}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {horariosPorDia[dia].map((h) => (
                        <span
                          key={h.margenLaboralId}
                          className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded"
                        >
                          {h.margenLaboral.desde} - {h.margenLaboral.hasta}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-400">Sin horarios</span>
            )}
          </div>

          {/* BOTONES */}
          <div className="flex gap-2 pt-3 border-t border-amber-900/30">
            <Button
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => setOpen(true)}
            >
              Editar
            </Button>

            <form action={deleteBarbero}>
              <input type="hidden" name="id" value={barbero.id} />
              <Button className="px-3 py-2 bg-red-500/20 text-red-400 rounded">
                Baja
              </Button>
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