"use client";

import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { Badge } from "@/components/ui/badge/Badge";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { ESTILO_FONDO_MARCA, DIAS_SEMANA } from "@/lib/constants";
import type { DiaLaboral, MargenLaboralCreado } from "@/types/horarios";

type DiaLaboralListProps = {
  diasLaborales: DiaLaboral[];
  isLoading: boolean;
  onAsignarHorarios: (dia: DiaLaboral) => void;
};

const DIAS_SEMANA_INFO: Record<number, { nombre: string; emoji: string }> = {
  0: { nombre: DIAS_SEMANA[0], emoji: "🟣" },
  1: { nombre: DIAS_SEMANA[1], emoji: "🔵" },
  2: { nombre: DIAS_SEMANA[2], emoji: "🟢" },
  3: { nombre: DIAS_SEMANA[3], emoji: "🟡" },
  4: { nombre: DIAS_SEMANA[4], emoji: "🟠" },
  5: { nombre: DIAS_SEMANA[5], emoji: "🔴" },
  6: { nombre: DIAS_SEMANA[6], emoji: "🟣" },
};

export function DiaLaboralList({
  diasLaborales,
  isLoading,
  onAsignarHorarios,
}: DiaLaboralListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(7)].map((_, i) => (
          <div 
            key={i} 
            className="bg-[var(--admin-surface)] rounded-xl p-6"
            style={{ border: `1px solid var(--page-secondary-30)` }}
          >
            <Skeleton className="h-6 w-32 bg-white/10" />
            <Skeleton className="h-4 w-24 mt-2 bg-white/10" />
            <Skeleton className="h-10 w-full mt-4 bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (diasLaborales.length === 0) {
    return (
      <EmptyState
        icono={<Clock />}
        titulo="No hay días laborales configurados"
        mensaje="Los días de la semana aparecerán aquí una vez configurados"
        claseContenedor="bg-[var(--admin-surface)] rounded-xl p-16"
        estiloContenedor={{ border: "1px solid var(--page-secondary-30)" }}
        claseIcono="h-16 w-16"
        estiloIcono={{ color: "var(--page-primary-tinta)" }}
        claseTitulo="text-xl font-semibold mb-2 text-[var(--admin-texto-primario)]"
        estiloMensaje={{ color: "var(--page-primary-tinta)" }}
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {diasLaborales.map((dia) => {
        const diaInfo = DIAS_SEMANA_INFO[dia.dia];
        const cantidadHorarios = dia.margenes?.length || 0;
        const horariosActivos = dia.margenes?.filter((m) => m.estado) || [];

        return (
          <div
            key={dia.id}
            className={`bg-[var(--admin-surface)] border rounded-xl overflow-hidden transition-colors duration-150 ${
              dia.estado ? "" : "opacity-60"
            }`}
            style={{
              borderColor: dia.estado ? `var(--page-secondary-50)` : "#374151",
            }}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-2 h-16 rounded-full shadow-sm" 
                    style={ESTILO_FONDO_MARCA} 
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--admin-texto-primario)] flex items-center gap-2">
                      <span>{diaInfo.emoji}</span>
                      {diaInfo.nombre}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: `var(--page-primary-tinta)` }}>
                      Día {dia.dia} de la semana
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {dia.estado ? (
                  <Badge className="bg-green-500/20 text-green-400 border border-green-500/50 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Activo
                  </Badge>
                ) : (
                  <Badge className="bg-gray-500/20 text-gray-400 border border-gray-500/50 gap-1">
                    <XCircle className="h-3 w-3" />
                    Inactivo
                  </Badge>
                )}

                {cantidadHorarios > 0 && (
                  <Badge 
                    className="gap-1 border"
                    style={{
                      backgroundColor: `var(--page-primary-20)`,
                      color: "var(--page-primary)",
                      borderColor: `var(--page-primary-50)`,
                    }}
                  >
                    <Clock className="h-3 w-3" />
                    {cantidadHorarios} {cantidadHorarios === 1 ? "horario" : "horarios"}
                  </Badge>
                )}
              </div>

              {/* Mostrar horarios asignados */}
              {horariosActivos.length > 0 && (
                <div 
                  className="space-y-2 pt-3"
                  style={{ borderTop: `1px solid var(--page-secondary-30)` }}
                >
                  <p className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--page-primary-tinta)" }}>
                    <Clock className="h-3 w-3" />
                    Horarios activos:
                  </p>
                  <div className="space-y-1.5">
                    {horariosActivos.slice(0, 3).map((margen) => (
                      <div
                        key={margen.id}
                        className="flex items-center gap-2 text-sm bg-[var(--admin-surface-elevated)] px-3 py-2 rounded-lg border transition-colors duration-150 hover:bg-white/5"
                        style={{ borderColor: `var(--page-secondary-30)` }}
                      >
                        <Clock className="h-3 w-3 shrink-0" style={{ color: "var(--page-primary-tinta)" }} />
                        <span className="font-mono text-[var(--admin-texto-primario)] font-semibold">
                          {margen.desde} → {margen.hasta}
                        </span>
                      </div>
                    ))}
                    {horariosActivos.length > 3 && (
                      <p className="text-xs pl-2" style={{ color: `var(--page-primary-tinta)` }}>
                        +{horariosActivos.length - 3} más...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Mensaje cuando no hay horarios */}
              {cantidadHorarios === 0 && (
                <div 
                  className="pt-3"
                  style={{ borderTop: `1px solid var(--page-secondary-30)` }}
                >
                  <p className="text-xs italic" style={{ color: `var(--page-primary-tinta)` }}>
                    Sin horarios asignados
                  </p>
                </div>
              )}

              <Button
                className="w-full font-medium transition-all shadow-sm hover:opacity-90 active:scale-[0.98] text-[var(--page-primary-foreground)]"
                style={{
                  backgroundColor: "var(--page-primary)",
                  border: `1px solid var(--page-secondary-50)`,
                }}
                onClick={() => onAsignarHorarios(dia)}
              >
                <Clock className="h-4 w-4 mr-2" />
                {cantidadHorarios > 0 ? "Gestionar Horarios" : "Asignar Horarios"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}