"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { obtenerTurnosDelMes } from "@/actions/turnos/listar.actions";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import type { TurnoListado } from "@/types/turno";

const VIGENCIA_MES_MS = 60_000;

type EstadoMes = {
  turnos: TurnoListado[];
  actualizadoEn: number;
  cargando: boolean;
  error: boolean;
};

const MES_INICIAL: EstadoMes = { turnos: [], actualizadoEn: 0, cargando: true, error: false };

function mesDelTurno(turno: TurnoListado): string {
  return obtenerFechaSola(turno.horarioReservado).slice(0, 7);
}

function aplicarCambios(mes: string, turnos: TurnoListado[], cambios: Iterable<TurnoListado>) {
  const porId = new Map(turnos.map((turno) => [turno.id, turno]));
  for (const turno of cambios) {
    if (mesDelTurno(turno) === mes) porId.set(turno.id, turno);
    else porId.delete(turno.id);
  }

  return Array.from(porId.values()).sort((primero, segundo) =>
    new Date(segundo.horarioReservado).getTime() - new Date(primero.horarioReservado).getTime()
    || segundo.id.localeCompare(primero.id),
  );
}

export function useAgendaMensual(mesAgenda: string, mesCalendario: string) {
  const [meses, setMeses] = useState<Record<string, EstadoMes>>({});
  const mesesRef = useRef(meses);
  const consultasRef = useRef(new Map<string, Map<string, TurnoListado>>());
  // Una recarga puede retirar el turno de origen antes de que se aplique la edición local.
  const turnosConocidosRef = useRef(new Map<string, TurnoListado>());

  const publicarMeses = useCallback((datos: Record<string, EstadoMes>) => {
    mesesRef.current = datos;
    setMeses(datos);
  }, []);

  const cargarMes = useCallback(async (mes: string) => {
    const consultas = consultasRef.current;
    if (consultas.has(mes)) return;

    const cambios = new Map<string, TurnoListado>();
    consultas.set(mes, cambios);
    publicarMeses({
      ...mesesRef.current,
      [mes]: { ...mesesRef.current[mes] ?? MES_INICIAL, cargando: true, error: false },
    });

    try {
      const resultado = await obtenerTurnosDelMes(mes);
      if (!resultado.success || !resultado.data) throw new Error("No se pudo consultar el mes");
      const turnos = aplicarCambios(mes, resultado.data, cambios.values());
      for (const turno of turnos) turnosConocidosRef.current.set(turno.id, turno);
      publicarMeses({
        ...mesesRef.current,
        [mes]: { turnos, actualizadoEn: Date.now(), cargando: false, error: false },
      });
    } catch {
      publicarMeses({
        ...mesesRef.current,
        [mes]: { ...mesesRef.current[mes], cargando: false, error: true },
      });
    } finally {
      consultas.delete(mes);
    }
  }, [publicarMeses]);

  const cargarSiVencio = useCallback((mes: string) => {
    const actualizadoEn = mesesRef.current[mes]?.actualizadoEn;
    if (!actualizadoEn || Date.now() - actualizadoEn >= VIGENCIA_MES_MS) {
      void cargarMes(mes);
    }
  }, [cargarMes]);

  useEffect(() => { cargarSiVencio(mesAgenda); }, [cargarSiVencio, mesAgenda]);
  useEffect(() => { cargarSiVencio(mesCalendario); }, [cargarSiVencio, mesCalendario]);

  const registrarTurno = useCallback((turno: TurnoListado) => {
    const mesDestino = mesDelTurno(turno);
    const turnoAnterior = turnosConocidosRef.current.get(turno.id);
    const claves = new Set([mesDestino, turnoAnterior ? mesDelTurno(turnoAnterior) : mesDestino]);
    turnosConocidosRef.current.set(turno.id, turno);

    for (const cambios of consultasRef.current.values()) cambios.set(turno.id, turno);

    const datos = { ...mesesRef.current };
    for (const mes of claves) {
      const estado = datos[mes];
      if (estado) datos[mes] = { ...estado, turnos: aplicarCambios(mes, estado.turnos, [turno]) };
    }
    publicarMeses(datos);
  }, [publicarMeses]);

  const obtenerTurno = useCallback((id: string) => turnosConocidosRef.current.get(id), []);

  return {
    agenda: meses[mesAgenda] ?? MES_INICIAL,
    calendario: meses[mesCalendario] ?? MES_INICIAL,
    cargarMes,
    obtenerTurno,
    registrarTurno,
  };
}
