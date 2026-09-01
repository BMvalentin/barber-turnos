"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import TurnoRow from "./TurnoRow";
import type { TurnoListado } from "@/types/turno";
import type { Session } from "next-auth";

interface Props {
  turnos: TurnoListado[];
  session: Session | null;
  onCancelar: (id: string) => void;
  onCompletar: (id: string) => void;
  onConfirmar: (id: string) => void;
}

type Medidas = { pixelesPorHora: number; ejeX: number; anchoGutter: number };

type Escala = { inicio: number; fin: number };

type FilaHoraria = { hora: number; turnos: TurnoListado[] };

type FilaLayout = { altura: number; offset: number };

type LayoutCalculado = {
  posiciones: Record<string, number>;
  filasLayout: FilaLayout[];
  alturaTotal: number;
};

const ALTURA_MARCA = 16;
const GAP_ENTRE_TURNOS = 16;
const PADDING_FILA = 24;
const MARGEN_SUPERIOR = 12;
const MARGEN_INFERIOR = 24;
const ALTURA_CARD_ESTIMADA = 190;

function obtenerMedidas(): Medidas {
  const esEscritorio = typeof window === "undefined" || window.innerWidth >= 768;
  return esEscritorio
    ? { pixelesPorHora: 76, ejeX: 48, anchoGutter: 78 }
    : { pixelesPorHora: 48, ejeX: 32, anchoGutter: 52 };
}

function usarMedidasLineaTiempo(): Medidas {
  const [medidas, setMedidas] = useState(obtenerMedidas);
  useEffect(() => {
    const actualizar = () => setMedidas(obtenerMedidas());
    window.addEventListener("resize", actualizar);
    return () => window.removeEventListener("resize", actualizar);
  }, []);
  return medidas;
}

function minutosDeTurno(turno: TurnoListado): number {
  const fecha = new Date(turno.horarioReservado);
  return fecha.getHours() * 60 + fecha.getMinutes();
}

function formatearMarca(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;
  return `${String(horas).padStart(2, "0")}:${String(minutosRestantes).padStart(2, "0")}`;
}

function calcularEscala(turnos: TurnoListado[]): Escala | null {
  if (turnos.length === 0) return null;
  let min = Infinity;
  let max = -Infinity;
  for (const turno of turnos) {
    const minutos = minutosDeTurno(turno);
    min = Math.min(min, minutos);
    max = Math.max(max, minutos);
  }
  const inicio = Math.floor(min / 60) * 60;
  let fin = Math.ceil(max / 60) * 60;
  if (fin - inicio < 120) fin = inicio + 120;
  return { inicio, fin };
}

function agruparTurnosPorHora(turnos: TurnoListado[]): Map<number, TurnoListado[]> {
  const porHora = new Map<number, TurnoListado[]>();
  for (const turno of turnos) {
    const hora = Math.floor(minutosDeTurno(turno) / 60) * 60;
    const lista = porHora.get(hora) ?? [];
    lista.push(turno);
    porHora.set(hora, lista);
  }
  for (const lista of porHora.values()) {
    lista.sort(
      (a, b) =>
        minutosDeTurno(a) - minutosDeTurno(b) ||
        new Date(a.horarioReservado).getTime() - new Date(b.horarioReservado).getTime(),
    );
  }
  return porHora;
}

function calcularLayout(
  filas: FilaHoraria[],
  pxPorMinuto: number,
  alturas: Map<string, number>,
): LayoutCalculado {
  const posiciones: Record<string, number> = {};
  const filasLayout: FilaLayout[] = [];
  let offsetGlobal = MARGEN_SUPERIOR;
  for (const fila of filas) {
    let fondoRelativo = ALTURA_MARCA - GAP_ENTRE_TURNOS;
    for (const turno of fila.turnos) {
      const offsetMinuto = minutosDeTurno(turno) % 60;
      const topRelativo = Math.max(
        ALTURA_MARCA + offsetMinuto * pxPorMinuto,
        fondoRelativo + GAP_ENTRE_TURNOS,
      );
      posiciones[turno.id] = offsetGlobal + topRelativo;
      fondoRelativo = topRelativo + (alturas.get(turno.id) ?? ALTURA_CARD_ESTIMADA);
    }
    const altura = Math.max(
      ALTURA_MARCA + 60 * pxPorMinuto,
      fondoRelativo + PADDING_FILA,
    );
    filasLayout.push({ altura, offset: offsetGlobal });
    offsetGlobal += altura;
  }
  return { posiciones, filasLayout, alturaTotal: offsetGlobal + MARGEN_INFERIOR };
}

export default function LineaTiempoTurnos({
  turnos,
  session,
  onCancelar,
  onCompletar,
  onConfirmar,
}: Props) {
  const medidas = usarMedidasLineaTiempo();
  const { pixelesPorHora, ejeX, anchoGutter } = medidas;
  const pxPorMinuto = pixelesPorHora / 60;

  const escala = useMemo(() => calcularEscala(turnos), [turnos]);
  const filas = useMemo(() => {
    if (!escala) return [];
    const porHora = agruparTurnosPorHora(turnos);
    const resultado: FilaHoraria[] = [];
    for (let hora = escala.inicio; hora <= escala.fin; hora += 60) {
      resultado.push({ hora, turnos: porHora.get(hora) ?? [] });
    }
    return resultado;
  }, [turnos, escala]);

  const alturasRef = useRef(new Map<string, number>());
  const tarjetasRef = useRef(new Map<string, HTMLDivElement | null>());

  const [layout, setLayout] = useState(() =>
    calcularLayout(filas, pxPorMinuto, alturasRef.current),
  );

  useLayoutEffect(() => {
    tarjetasRef.current.forEach((tarjeta, id) => {
      if (tarjeta) alturasRef.current.set(id, tarjeta.offsetHeight);
    });
    setLayout(calcularLayout(filas, pxPorMinuto, alturasRef.current));
  }, [filas, pxPorMinuto]);

  if (!escala) return null;

  return (
    <div className="relative rounded-xl bg-[var(--admin-surface)]">
      <div
        className="absolute bottom-0 top-0 w-px bg-[var(--admin-border)] opacity-70"
        style={{ left: ejeX }}
      />

      <div style={{ height: MARGEN_SUPERIOR }} />

      {filas.map((fila, indice) => {
        const filaLayout = layout.filasLayout[indice] ?? {
          altura: ALTURA_MARCA + 60 * pxPorMinuto,
          offset: MARGEN_SUPERIOR,
        };
        return (
          <div key={fila.hora} className="relative" style={{ height: filaLayout.altura }}>
            <div className="absolute left-0 right-0 flex h-3 items-center">
              <span
                className="text-right text-[11px] font-medium tabular-nums text-[var(--admin-texto-muted)]"
                style={{ width: ejeX - 8 }}
              >
                {formatearMarca(fila.hora)}
              </span>
              <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-[var(--admin-border)]" />
              <div className="ml-3 h-px flex-1 bg-[var(--admin-border)] opacity-40" />
            </div>

            {fila.turnos.map((turno) => {
              const top = (layout.posiciones[turno.id] ?? 0) - filaLayout.offset;
              return (
                <div
                  key={turno.id}
                  className="absolute left-0 right-0"
                  style={{ top, paddingRight: 6 }}
                >
                  <div
                    className="absolute h-px bg-[var(--admin-border)]"
                    style={{ left: ejeX, top: 0, width: anchoGutter - ejeX }}
                  />
                  <div className="flex">
                    <div style={{ width: anchoGutter }} />
                    <div
                      className="min-w-0 flex-1"
                      ref={(tarjeta) => {
                        tarjetasRef.current.set(turno.id, tarjeta);
                      }}
                    >
                      <TurnoRow
                        turno={turno}
                        session={session}
                        onCancelar={onCancelar}
                        onCompletar={onCompletar}
                        onConfirmar={onConfirmar}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      <div style={{ height: MARGEN_INFERIOR }} />
    </div>
  );
}
