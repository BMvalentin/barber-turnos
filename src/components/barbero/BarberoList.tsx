"use client";

import { useState } from "react";
import EditBarberoModal from "./EditBarberoModal";
import { deleteBarbero } from "@/actions/barberos/eliminar.actions";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import EmptyState from "@/components/ui/EmptyState";
import { ESTILO_FONDO_MARCA, DIAS_SEMANA_DB } from "@/lib/constants";
import type { BarberoListado, ServicioOpcion, DiaLaboral } from "@/types/barbero";

type HorarioBarbero = NonNullable<BarberoListado["horarios"]>[number];

export default function BarberoList({
  barberos = [],
  servicios = [],
  diasLaborales = [],
}: {
  barberos?: BarberoListado[];
  servicios?: ServicioOpcion[];
  diasLaborales?: DiaLaboral[];
}) {

  if (!barberos.length) {
    return (
      <EmptyState
        icono={<User />}
        mensaje="No hay barberos disponibles"
        claseContenedor="bg-black/40 p-8 rounded-lg border"
        estiloContenedor={{ borderColor: "var(--page-primary-30)" }}
        claseIcono="h-16 w-16"
        estiloIcono={{ color: "var(--page-primary-50)" }}
        estiloMensaje={{ color: "var(--page-primary-70)" }}
      />
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
  barbero: BarberoListado;
  servicios: ServicioOpcion[];
  diasLaborales: DiaLaboral[];
}) {
  const [open, setOpen] = useState(false);

  const horariosPorDia = agruparHorariosPorDia(barbero.horarios);

  const diasConHorario = Object.keys(horariosPorDia).sort(
    (a, b) => DIAS_SEMANA_DB.indexOf(a as (typeof DIAS_SEMANA_DB)[number]) - DIAS_SEMANA_DB.indexOf(b as (typeof DIAS_SEMANA_DB)[number])
  );

  return (
    <>
      <div 
        className="bg-black/40 rounded-xl overflow-hidden border transition-all"
        style={{ borderColor: `var(--page-primary-40)` }}
      >
        {/* IMAGEN */}
        <div className="h-48 border-b" style={{ borderColor: `var(--page-primary-20)` }}>
          {barbero.srcImage ? (
            <img
              src={barbero.srcImage}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <User className="h-12 w-12" style={{ color: `var(--page-primary-50)` }} />
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <h3 className="text-white font-bold text-lg">{barbero.nombre}</h3>

          {/* SERVICIOS */}
          <div>
            <p className="text-xs mb-1 font-semibold" style={{ color: "var(--page-primary)" }}>Servicios:</p>
            <div className="flex flex-wrap gap-1">
              {barbero.servicios?.length ? (
                barbero.servicios.map((s) => (
                  <span
                    key={s.servicio.id}
                    className="text-xs px-2 py-1 rounded"
                    style={{ backgroundColor: `var(--page-primary-20)`, color: "var(--page-primary)" }}
                  >
                    {s.servicio.nombre}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-500">Sin servicios</span>
              )}
            </div>
          </div>

          {/* HORARIOS AGRUPADOS POR DÍA */}
          <div>
            <p className="text-xs mb-1 font-semibold" style={{ color: "var(--page-primary)" }}>Horarios:</p>
            {diasConHorario.length ? (
              <div className="space-y-1.5">
                {diasConHorario.map((dia) => (
                  <div key={dia} className="flex items-start gap-2">
                    <span className="text-[11px] font-semibold text-white w-16 flex-shrink-0 pt-0.5">
                      {dia}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {[...horariosPorDia[dia]]
                        .sort((a, b) => {
                          const [ah, am] = a.margenLaboral.desde.split(":").map(Number);
                          const [bh, bm] = b.margenLaboral.desde.split(":").map(Number);
                          return ah * 60 + am - (bh * 60 + bm);
                        })
                        .map((h) => (
                          <span
                            key={h.margenLaboralId}
                            className="text-xs px-2 py-1 rounded"
                            style={{ backgroundColor: `var(--page-primary-20)`, color: "var(--page-primary)" }}
                          >
                            {h.margenLaboral.desde} - {h.margenLaboral.hasta}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-zinc-500">Sin horarios</span>
            )}
          </div>

          {/* BOTONES */}
          <div className="flex gap-2 pt-3 border-t" style={{ borderColor: `var(--page-primary-20)` }}>
            <Button
              className="flex-1 text-[var(--page-primary-foreground)] transition-all hover:opacity-90"
              style={ESTILO_FONDO_MARCA}
              onClick={() => setOpen(true)}
            >
              Editar
            </Button>

            <form action={deleteBarbero}>
              <input type="hidden" name="id" value={barbero.id} />
              <Button className="px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded">
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