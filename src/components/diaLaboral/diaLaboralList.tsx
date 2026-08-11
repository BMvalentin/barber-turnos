"use client";

import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ESTILO_FONDO_MARCA } from "@/lib/constants";

type MargenLaboral = {
  id: string;
  diaId: string;
  estado: boolean;
  desde: string;
  hasta: string;
  createdAt: Date;
  updatedAt: Date;
};

type DiaLaboral = {
  id: string;
  estado: boolean;
  dia: number;
  createdAt: Date;
  updatedAt: Date;
  margenes?: MargenLaboral[];
};

type DiaLaboralListProps = {
  diasLaborales: DiaLaboral[];
  isLoading: boolean;
  onAsignarHorarios: (dia: DiaLaboral) => void;
};

const DIAS_SEMANA: Record<number, { nombre: string; emoji: string }> = {
  0: { nombre: "Domingo", emoji: "🟣" },
  1: { nombre: "Lunes", emoji: "🔵" },
  2: { nombre: "Martes", emoji: "🟢" },
  3: { nombre: "Miércoles", emoji: "🟡" },
  4: { nombre: "Jueves", emoji: "🟠" },
  5: { nombre: "Viernes", emoji: "🔴" },
  6: { nombre: "Sábado", emoji: "🟣" },
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
            className="bg-black/40 backdrop-blur-lg rounded-xl p-6"
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
      <div 
        className="bg-black/40 backdrop-blur-lg rounded-xl p-16 text-center"
        style={{ border: `1px solid var(--page-secondary-30)` }}
      >
        <Clock className="h-16 w-16 mx-auto mb-4" style={{ color: `var(--page-primary-50)` }} />
        <h3 className="text-xl font-semibold mb-2 text-white">
          No hay días laborales configurados
        </h3>
        <p style={{ color: `var(--page-primary-70)` }}>
          Los días de la semana aparecerán aquí una vez configurados
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {diasLaborales.map((dia) => {
        const diaInfo = DIAS_SEMANA[dia.dia];
        const cantidadHorarios = dia.margenes?.length || 0;
        const horariosActivos = dia.margenes?.filter((m) => m.estado) || [];

        return (
          <div
            key={dia.id}
            className={`bg-black/40 backdrop-blur-lg border rounded-xl shadow-lg overflow-hidden transition-all ${
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
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <span>{diaInfo.emoji}</span>
                      {diaInfo.nombre}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: `var(--page-primary-70)` }}>
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
                  <p className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--page-primary)" }}>
                    <Clock className="h-3 w-3" />
                    Horarios activos:
                  </p>
                  <div className="space-y-1.5">
                    {horariosActivos.slice(0, 3).map((margen) => (
                      <div
                        key={margen.id}
                        className="flex items-center gap-2 text-sm bg-black/60 px-3 py-2 rounded-lg border transition-colors hover:bg-black/80"
                        style={{ borderColor: `var(--page-secondary-30)` }}
                      >
                        <Clock className="h-3 w-3 shrink-0" style={{ color: "var(--page-primary)" }} />
                        <span className="font-mono text-white font-semibold">
                          {margen.desde} → {margen.hasta}
                        </span>
                      </div>
                    ))}
                    {horariosActivos.length > 3 && (
                      <p className="text-xs pl-2" style={{ color: `var(--page-primary-70)` }}>
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
                  <p className="text-xs italic" style={{ color: `var(--page-primary-70)` }}>
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