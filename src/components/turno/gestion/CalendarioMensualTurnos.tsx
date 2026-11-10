"use client";

import { useEffect, useRef, useState } from "react";
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
import { obtenerResumenCalendario } from "@/actions/turnos/obtener-resumen-calendario.actions";
import type {
  EstadoTurnoCalendario,
  ResumenDiaCalendario,
  ResumenMensualCalendario,
} from "@/actions/turnos/obtener-resumen-calendario.actions";
import { ESTADOS_TURNO } from "@/lib/constants";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";

interface Props {
  fecha: string;
  barberoId: string;
  estadoFiltro: string;
  versionActualizacion: number;
  onSeleccionar: (fecha: string) => void;
}

const DIAS_SEMANA = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

const ETIQUETAS_ESTADO: Record<EstadoTurnoCalendario, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
};

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

function descripcionIndicadores(
  resumen: ResumenDiaCalendario | undefined,
  estados: readonly EstadoTurnoCalendario[] = ESTADOS_TURNO,
): string {
  if (!resumen) return "Sin turnos";
  const descripciones = estados
    .filter((estado) => resumen[estado] > 0)
    .map((estado) => `${resumen[estado]} ${ETIQUETAS_ESTADO[estado].toLowerCase()}${resumen[estado] === 1 ? "" : "s"}`);
  return descripciones.length > 0 ? descripciones.join(", ") : "Sin turnos";
}

export default function CalendarioMensualTurnos({
  fecha,
  barberoId,
  estadoFiltro,
  versionActualizacion,
  onSeleccionar,
}: Props) {
  const [mesVisible, setMesVisible] = useState<Date>(() => {
    const fechaInicial = parsearFecha(fecha);
    return fechaInicial ? startOfMonth(fechaInicial) : startOfMonth(new Date());
  });
  const [resumenMensual, setResumenMensual] = useState<ResumenMensualCalendario>({});
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const solicitudRef = useRef(0);

  useEffect(() => {
    const fechaSeleccionada = parsearFecha(fecha);
    if (!fechaSeleccionada) return;
    setMesVisible((mesActual) =>
      isSameMonth(mesActual, fechaSeleccionada) ? mesActual : startOfMonth(fechaSeleccionada),
    );
  }, [fecha]);

  useEffect(() => {
    const id = ++solicitudRef.current;
    setCargando(true);
    setErrorCarga(false);
    obtenerResumenCalendario(mesComoClave(mesVisible), barberoId || undefined)
      .then((resultado) => {
        if (id !== solicitudRef.current) return;
        if (resultado.success && resultado.data) {
          setResumenMensual(resultado.data);
          return;
        }
        setResumenMensual({});
        setErrorCarga(true);
      })
      .catch(() => {
        if (id !== solicitudRef.current) return;
        setResumenMensual({});
        setErrorCarga(true);
      })
      .finally(() => {
        if (id === solicitudRef.current) setCargando(false);
      });

    return () => {
      solicitudRef.current += 1;
    };
  }, [barberoId, mesVisible, versionActualizacion]);

  const dias = eachDayOfInterval({
    start: startOfWeek(startOfMonth(mesVisible), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(mesVisible), { weekStartsOn: 0 }),
  });
  const fechaSeleccionada = parsearFecha(fecha);
  const fechaHoy = obtenerFechaSola(new Date());
  const estadoFiltrado = ESTADOS_TURNO.find((estado) => estado === estadoFiltro);
  const estadosVisibles: readonly EstadoTurnoCalendario[] = estadoFiltrado
    ? [estadoFiltrado]
    : ESTADOS_TURNO;
  const tituloMes = capitalizar(format(mesVisible, "MMMM yyyy", { locale: es }));

  return (
    <div className="space-y-3">
      <section
        aria-label="Calendario mensual de turnos"
        aria-busy={cargando}
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
            const cantidadDiaFiltrada = estadosVisibles.reduce(
              (total, estado) => total + (resumenDia?.[estado] ?? 0),
              0,
            );
            const tieneTurnos = cantidadDiaFiltrada > 0;
            const seleccionado = fechaSeleccionada ? isSameDay(dia, fechaSeleccionada) : false;
            const esHoy = clave === fechaHoy;
            const deshabilitado =
              !estaEnElMes || cargando || errorCarga || !tieneTurnos;
            const descripcionDia = cargando
              ? "Cargando turnos"
              : errorCarga
                ? "No se pudieron cargar los turnos"
                : descripcionIndicadores(resumenDia, estadosVisibles);
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
                    ? tieneTurnos && !cargando && !errorCarga
                      ? "bg-[var(--page-primary)] font-bold text-[var(--page-primary-foreground)] ring-1 ring-[var(--admin-border-fuerte)]"
                      : "bg-[var(--admin-surface)] font-semibold text-[var(--admin-texto-secundario)] ring-1 ring-[var(--admin-border-fuerte)]"
                    : estaEnElMes && tieneTurnos && !cargando && !errorCarga
                      ? "text-[var(--admin-texto-primario)] hover:bg-[var(--page-primary-20)]"
                      : "cursor-default text-[var(--admin-texto-muted)] opacity-30"
                } ${esHoy && !seleccionado ? "ring-1 ring-inset ring-[var(--admin-border-fuerte)]" : ""}`}
              >
                <span>{format(dia, "d")}</span>
                <span className="mt-0.5 flex h-1 items-center justify-center gap-0.5" aria-hidden="true">
                  {estaEnElMes && estadosVisibles.filter((estado) => (resumenDia?.[estado] ?? 0) > 0).map((estado) => (
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

        {errorCarga && (
          <p role="status" className="mt-2 text-xs text-[var(--admin-texto-muted)]">
            No se pudo cargar la información del calendario.
          </p>
        )}
      </section>

    </div>
  );
}
