"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { obtenerDiasConTurnos } from "@/actions/turnos/obtener-dias-con-turnos.actions";
import CalendarioReserva from "@/components/turno/reserva/CalendarioReserva";

interface Props {
  fecha: string;
  estado?: string;
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

export default function CalendarioNavegacion({ fecha, estado = "TODOS", onSeleccionar }: Props) {
  const [mesVisible, setMesVisible] = useState<Date>(() => fechaDeInicio(fecha));
  const [diasConTurnos, setDiasConTurnos] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const solicitudRef = useRef(0);

  useEffect(() => {
    const id = ++solicitudRef.current;
    setCargando(true);
    obtenerDiasConTurnos(mesKey(mesVisible), estado)
      .then((resultado) => {
        if (id !== solicitudRef.current) return;
        setDiasConTurnos(resultado.success && Array.isArray(resultado.data) ? resultado.data : []);
      })
      .catch(() => {
        if (id !== solicitudRef.current) return;
        setDiasConTurnos([]);
      })
      .finally(() => {
        if (id !== solicitudRef.current) return;
        setCargando(false);
      });
    return () => {
      solicitudRef.current += 1;
    };
  }, [mesVisible, estado]);

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
      cargandoDias={cargando}
      fecha={fechaComoDate(fecha)}
      onMesAnterior={irAlMesAnterior}
      onMesSiguiente={irAlMesSiguiente}
      onSeleccionarDia={(dia) => onSeleccionar(dateToString(dia))}
    />
  );
}
