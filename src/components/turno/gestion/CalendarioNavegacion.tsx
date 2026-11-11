"use client";

import { useCallback, useMemo, useState } from "react";
import CalendarioReserva from "@/components/turno/reserva/CalendarioReserva";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import type { TurnoListado } from "@/types/turno";

interface Props {
  fecha: string;
  estado?: string;
  barberoId?: string;
  turnos: TurnoListado[];
  cargandoTurnos: boolean;
  onSeleccionar: (dia: string) => void;
}

function fechaComoDate(fecha: string): Date | undefined {
  if (!fecha) return undefined;
  const [anio, mes, dia] = fecha.split("-").map(Number);
  if (!anio || !mes || !dia) return undefined;
  return new Date(anio, mes - 1, dia);
}

function fechaDeInicio(fecha: string): Date {
  return fechaComoDate(fecha) ?? new Date();
}

function dateToString(dia: Date): string {
  const anio = dia.getFullYear();
  const mes = String(dia.getMonth() + 1).padStart(2, "0");
  const diaNumero = String(dia.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${diaNumero}`;
}

function mesKey(mesVisible: Date): string {
  return dateToString(new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1)).slice(0, 7);
}

export default function CalendarioNavegacion({ fecha, estado = "TODOS", barberoId, turnos, cargandoTurnos, onSeleccionar }: Props) {
  const [mesVisible, setMesVisible] = useState<Date>(() => fechaDeInicio(fecha));
  const diasConTurnos = useMemo(() => {
    const mes = mesKey(mesVisible);
    return Array.from(new Set(turnos
      .filter((turno) =>
        (estado === "TODOS" || turno.estado === estado) &&
        (!barberoId || turno.barberoId === barberoId),
      )
      .map((turno) => obtenerFechaSola(turno.horarioReservado))
      .filter((dia) => dia.slice(0, 7) === mes)));
  }, [barberoId, estado, mesVisible, turnos]);

  const irAlMesAnterior = useCallback(() => {
    setMesVisible((mes) => new Date(mes.getFullYear(), mes.getMonth() - 1, 1));
  }, []);

  const irAlMesSiguiente = useCallback(() => {
    setMesVisible((mes) => new Date(mes.getFullYear(), mes.getMonth() + 1, 1));
  }, []);

  return (
    <CalendarioReserva
      mesVisible={mesVisible}
      diasDisponibles={diasConTurnos}
      cargandoDias={cargandoTurnos}
      fecha={fechaComoDate(fecha)}
      onMesAnterior={irAlMesAnterior}
      onMesSiguiente={irAlMesSiguiente}
      onSeleccionarDia={(dia) => onSeleccionar(dateToString(dia))}
      permitirFechasPasadas
    />
  );
}
