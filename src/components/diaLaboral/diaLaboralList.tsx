"use client";

import { Pencil, Trash2, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type MargenLaboral = {
  id: string;
  diaId: string;
  estado: boolean;
  desde: string;  // ← Ahora es string "08:00"
  hasta: string;  // ← Ahora es string "17:00"
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
  onEdit: (dia: DiaLaboral) => void;
  onDelete: (id: string) => void;
  onAsignarHorarios: (dia: DiaLaboral) => void;
};

const DIAS_SEMANA = [
  { nombre: "Domingo", color: "bg-purple-500" },
  { nombre: "Lunes", color: "bg-blue-500" },
  { nombre: "Martes", color: "bg-green-500" },
  { nombre: "Miércoles", color: "bg-yellow-500" },
  { nombre: "Jueves", color: "bg-orange-500" },
  { nombre: "Viernes", color: "bg-red-500" },
  { nombre: "Sábado", color: "bg-pink-500" },
];

export function DiaLaboralList({
  diasLaborales,
  isLoading,
  onEdit,
  onDelete,
  onAsignarHorarios,
}: DiaLaboralListProps) {
  // Ya no necesita formatear, solo retorna el string directamente
  const formatTime = (hora: string) => {
    return hora; // "08:00" ya está en formato correcto
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (diasLaborales.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            No hay días laborales registrados
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            Comienza agregando los días de la semana que serán considerados
            como laborales.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {diasLaborales.map((dia) => {
        const diaInfo = DIAS_SEMANA[dia.dia];
        const cantidadHorarios = dia.margenes?.length || 0;
        const horariosActivos = dia.margenes?.filter(m => m.estado) || [];
        
        return (
          <Card
            key={dia.id}
            className={`border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
              dia.estado
                ? "border-green-200 bg-linear-to-br from-amber-100 to-white "
                : "border-gray-200  bg-linear-to-br from-amber-100 to-whiteopacity-75"
            }`}
          >
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-12 rounded-full ${diaInfo.color}`} />
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      {diaInfo.nombre}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Día {dia.dia} de la semana
                    </CardDescription>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {dia.estado ? (
                  <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Activo
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Inactivo
                  </Badge>
                )}
                
                {cantidadHorarios > 0 && (
                  <Badge variant="outline" className="gap-1 border-blue-300 text-blue-950">
                    <Clock className="h-3 w-3" />
                    {cantidadHorarios} {cantidadHorarios === 1 ? "horario" : "horarios"}
                  </Badge>
                )}
              </div>

              {/* Mostrar horarios asignados */}
              {horariosActivos.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <p className="text-xs font-semibold text-blue-950 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Horarios activos:
                  </p>
                  <div className="space-y-1">
                    {horariosActivos.slice(0, 3).map((margen) => (
                      <div
                        key={margen.id}
                        className="flex items-center gap-2 text-sm bg-white/90 px-2 py-1 rounded"
                      >
                        <Clock className="h-3 w-3 text-blue-800" />
                        <span className="font-mono text-blue-950 font-semibold">
                          {formatTime(margen.desde)} → {formatTime(margen.hasta)}
                        </span>
                      </div>
                    ))}
                    {horariosActivos.length > 3 && (
                      <p className="text-xs text-blue-800 pl-2">
                        +{horariosActivos.length - 3} más...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Mensaje cuando no hay horarios */}
              {cantidadHorarios === 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-muted-foreground italic">
                    Sin horarios asignados
                  </p>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-2">
              <Button
                variant="celeste"
                size="sm"
                className="w-full border-2"
                onClick={() => onAsignarHorarios(dia)}
              >
                <Clock className="h-4 w-4 mr-2" />
                Asignar Horarios
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => onEdit(dia)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="border-2 border-red-200"
                  onClick={() => onDelete(dia.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}