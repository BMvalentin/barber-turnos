"use client";

import { useEffect, useMemo, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type {
  EstadoTurnoCalendario,
  ResumenDiaCalendario,
  ResumenMensualCalendario,
} from "@/actions/turnos/obtener-resumen-calendario.actions";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import type { TurnoListado } from "@/types/turno";

interface Props {
  fecha: string;
  barberoId: string;
  turnos: TurnoListado[];
  cargandoTurnos: boolean;
  onSeleccionar: (fecha: string) => void;
}

const DIAS_SEMANA = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

const ETIQUETAS_ESTADO: Record<EstadoTurnoCalendario, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
};

const ESTADOS_CON_INDICADOR: readonly EstadoTurnoCalendario[] = [
  "PENDIENTE",
  "CONFIRMADO",
  "CANCELADO",
];

const CLASES_PUNTO_ESTADO: Record<EstadoTurnoCalendario, string> = {
  PENDIENTE: "bg-amber-400",
  CONFIRMADO: "bg-emerald-400",
  COMPLETADO: "bg-emerald-400/70",
  CANCELADO: "bg-red-400/80",
};

const FORMATO_FECHA_LARGA = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function crearResumenDia(): ResumenDiaCalendario {
  return {
    total: 0,
    PENDIENTE: 0,
    CONFIRMADO: 0,
    COMPLETADO: 0,
    CANCELADO: 0,
  };
}

function parsearFecha(fecha: string): Date | undefined {
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if (!coincidencia) return undefined;
  const anio = Number(coincidencia[1]);
  const mes = Number(coincidencia[2]);
  const dia = Number(coincidencia[3]);
  const resultado = new Date(anio, mes - 1, dia);
  if (
    resultado.getFullYear() !== anio ||
    resultado.getMonth() !== mes - 1 ||
    resultado.getDate() !== dia
  ) {
    return undefined;
  }
  return resultado;
}

function fechaComoClave(dia: Date): string {
  return format(dia, "yyyy-MM-dd");
}

function mesComoClave(mesVisible: Date): string {
  return format(mesVisible, "yyyy-MM");
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function descripcionIndicadores(resumen: ResumenDiaCalendario | undefined): string {
  if (!resumen) return "Sin turnos pendientes, confirmados o cancelados";
  const descripciones = ESTADOS_CON_INDICADOR
    .filter((estado) => resumen[estado] > 0)
    .map((estado) => `${resumen[estado]} ${ETIQUETAS_ESTADO[estado].toLowerCase()}${resumen[estado] === 1 ? "" : "s"}`);
  return descripciones.length > 0
    ? descripciones.join(", ")
    : "Sin turnos pendientes, confirmados o cancelados";
}

export default function CalendarioMensualTurnos({
  fecha,
  barberoId,
  turnos,
  cargandoTurnos,
  onSeleccionar,
}: Props) {
  const [mesVisible, setMesVisible] = useState<Date>(() => {
    const fechaInicial = parsearFecha(fecha);
    return fechaInicial ? startOfMonth(fechaInicial) : startOfMonth(new Date());
  });
  const resumenMensual = useMemo(() => {
    const resumen: ResumenMensualCalendario = {};
    const claveMesVisible = mesComoClave(mesVisible);

    for (const turno of turnos) {
      if (barberoId && turno.barberoId !== barberoId) continue;
      const dia = obtenerFechaSola(turno.horarioReservado);
      if (dia.slice(0, 7) !== claveMesVisible) continue;

      const resumenDia = resumen[dia] ?? crearResumenDia();
      resumenDia.total += 1;
      resumenDia[turno.estado] += 1;
      resumen[dia] = resumenDia;
    }
    return resumen;
  }, [barberoId, mesVisible, turnos]);

  useEffect(() => {
    const fechaSeleccionada = parsearFecha(fecha);
    if (!fechaSeleccionada) return;
    setMesVisible((mesActual) =>
      isSameMonth(mesActual, fechaSeleccionada) ? mesActual : startOfMonth(fechaSeleccionada),
    );
  }, [fecha]);

  const dias = eachDayOfInterval({
    start: startOfWeek(startOfMonth(mesVisible), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(mesVisible), { weekStartsOn: 0 }),
  });
  const fechaSeleccionada = parsearFecha(fecha);
  const fechaHoy = obtenerFechaSola(new Date());
  const tituloMes = capitalizar(format(mesVisible, "MMMM yyyy", { locale: es }));

  return (
    <div className="space-y-3">
      <section
        aria-label="Calendario mensual de turnos"
        aria-busy={cargandoTurnos}
        className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-3.5 sm:p-4"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold capitalize text-[var(--admin-texto-primario)]">
            {tituloMes}
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={() => setMesVisible((mes) => new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}
              className="rounded-lg p-1.5 text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={() => setMesVisible((mes) => new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}
              className="rounded-lg p-1.5 text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1" role="group" aria-label={`Días de ${tituloMes}`}>
          {DIAS_SEMANA.map((dia) => (
            <span
              key={dia}
              className="py-1 text-center text-[10px] font-semibold text-[var(--admin-texto-muted)] sm:text-[11px]"
            >
              {dia}
            </span>
          ))}
          {dias.map((dia) => {
            const estaEnElMes = isSameMonth(dia, mesVisible);
            const clave = fechaComoClave(dia);
            const resumenDia = resumenMensual[clave];
            const tieneTurnos = (resumenDia?.total ?? 0) > 0;
            const tieneTurnosConIndicador = ESTADOS_CON_INDICADOR.some(
              (estado) => (resumenDia?.[estado] ?? 0) > 0,
            );
            const seleccionado = fechaSeleccionada ? isSameDay(dia, fechaSeleccionada) : false;
            const esHoy = clave === fechaHoy;
            const deshabilitado =
              !estaEnElMes || cargandoTurnos || !tieneTurnos;
            const descripcionDia = cargandoTurnos
              ? "Cargando turnos"
              : descripcionIndicadores(resumenDia);
            const etiqueta = `${capitalizar(FORMATO_FECHA_LARGA.format(dia))}. ${descripcionDia}.`;

            return (
              <button
                key={clave}
                type="button"
                aria-label={etiqueta}
                aria-pressed={seleccionado}
                disabled={deshabilitado}
                onClick={() => onSeleccionar(clave)}
                className={`flex h-10 w-full flex-col items-center justify-center rounded-lg border border-transparent text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] sm:h-11 sm:text-sm ${
                  seleccionado
                    ? tieneTurnos && !cargandoTurnos
                      ? "bg-[var(--page-primary-20)] font-bold text-[var(--admin-texto-primario)] ring-1 ring-[var(--admin-border-fuerte)]"
                      : "bg-[var(--admin-surface)] font-semibold text-[var(--admin-texto-secundario)] ring-1 ring-[var(--admin-border-fuerte)]"
                    : estaEnElMes && tieneTurnos && !cargandoTurnos
                      ? "text-[var(--admin-texto-primario)] hover:bg-[var(--page-primary-20)]"
                      : estaEnElMes && tieneTurnosConIndicador && !cargandoTurnos
                        ? "text-[var(--admin-texto-muted)]"
                        : "cursor-default text-[var(--admin-texto-muted)] opacity-30"
                } ${esHoy && !seleccionado ? "ring-1 ring-inset ring-[var(--admin-border-fuerte)]" : ""}`}
              >
                <span>{format(dia, "d")}</span>
                <span className="mt-0.5 flex h-1 items-center justify-center gap-0.5" aria-hidden="true">
                  {estaEnElMes && ESTADOS_CON_INDICADOR.filter((estado) => (resumenDia?.[estado] ?? 0) > 0).map((estado) => (
                    <span
                      key={estado}
                      className={`h-1 w-1 rounded-full ${CLASES_PUNTO_ESTADO[estado]}`}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>

      </section>

    </div>
  );
}
