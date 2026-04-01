"use client";

import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type MargenLaboral = {
  id: string;
  diaId: string;
  estado: boolean;
  desde: string;
  hasta: string;
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

const DIAS_SEMANA = [
  { nombre: "Domingo", color: "bg-purple-500", emoji: "🟣" },
  { nombre: "Lunes", color: "bg-blue-500", emoji: "🔵" },
  { nombre: "Martes", color: "bg-green-500", emoji: "🟢" },
  { nombre: "Miércoles", color: "bg-yellow-500", emoji: "🟡" },
  { nombre: "Jueves", color: "bg-orange-500", emoji: "🟠" },
  { nombre: "Viernes", color: "bg-red-500", emoji: "🔴" },
  { nombre: "Sábado", color: "bg-pink-500", emoji: "🟣" },
];

export function DiaLaboralList({
  diasLaborales,
  isLoading,
  onAsignarHorarios,
}: DiaLaboralListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="border border-amber-900/30 bg-black/40 backdrop-blur-lg rounded-xl p-6">
            <Skeleton className="h-6 w-32 bg-amber-950/20" />
            <Skeleton className="h-4 w-24 mt-2 bg-amber-950/20" />
            <Skeleton className="h-10 w-full mt-4 bg-amber-950/20" />
          </div>
        ))}
      </div>
    );
  }

  if (diasLaborales.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-xl p-16 text-center">
        <Clock className="h-16 w-16 text-amber-500/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-white">
          No hay días laborales configurados
        </h3>
        <p className="text-amber-200/70">
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
        const horariosActivos = dia.margenes?.filter(m => m.estado) || [];
        
        return (
          <div
            key={dia.id}
            className={`bg-black/40 backdrop-blur-lg border rounded-xl shadow-lg overflow-hidden hover:border-amber-500/50 transition-all ${
              dia.estado
                ? "border-amber-900/30"
                : "border-gray-700 opacity-60"
            }`}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-16 rounded-full ${diaInfo.color}`} />
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <span>{diaInfo.emoji}</span>
                      {diaInfo.nombre}
                    </h3>
                    <p className="text-xs text-amber-200/50 mt-1">
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
                  <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/50 gap-1">
                    <Clock className="h-3 w-3" />
                    {cantidadHorarios} {cantidadHorarios === 1 ? "horario" : "horarios"}
                  </Badge>
                )}
              </div>

              {/* Mostrar horarios asignados */}
              {horariosActivos.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-amber-900/30">
                  <p className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Horarios activos:
                  </p>
                  <div className="space-y-1.5">
                    {horariosActivos.slice(0, 3).map((margen) => (
                      <div
                        key={margen.id}
                        className="flex items-center gap-2 text-sm bg-black/60 px-3 py-2 rounded-lg border border-amber-900/30"
                      >
                        <Clock className="h-3 w-3 text-amber-500" />
                        <span className="font-mono text-white font-semibold">
                          {margen.desde} → {margen.hasta}
                        </span>
                      </div>
                    ))}
                    {horariosActivos.length > 3 && (
                      <p className="text-xs text-amber-200/50 pl-2">
                        +{horariosActivos.length - 3} más...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Mensaje cuando no hay horarios */}
              {cantidadHorarios === 0 && (
                <div className="pt-3 border-t border-amber-900/30">
                  <p className="text-xs text-amber-200/50 italic">
                    Sin horarios asignados
                  </p>
                </div>
              )}

              <Button
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
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