"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getTurnos } from "@/actions/turnos/listar.actions";
import CargadorModalGestionTurno from "@/components/turno/reserva/CargadorModalGestionTurno";
import DatosReservaProveedor from "@/contextos/DatosReservaProveedor";
import CalendarioMensualTurnos from "./CalendarioMensualTurnos";
import TurnoList from "./TurnoList";
import TurnosFiltros from "./TurnosFiltros";
import NavegacionFecha from "./NavegacionFecha";
import SelectorBarberoTurnos from "./SelectorBarberoTurnos";
import { esAdmin } from "@/lib/seguridad/es-admin";
import { ESTADOS_PAGO, ESTADOS_TURNO } from "@/lib/constants";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import {
  actualizarTurnoCacheLocal,
  guardarConsultaTurnosCacheLocal,
  leerConsultaTurnosCacheLocal,
} from "@/lib/admin/turnos-cache-local";
import type { ParcheTurnoCache } from "@/lib/admin/turnos-cache-local";
import type {
  BarberoData,
  RelacionData,
  ServicioData,
  TurnoListado,
  UsuarioData,
} from "@/types/turno";
import type { Session } from "next-auth";
import type { DatosTransferencia } from "@/types/pago";

interface Props {
  turnosIniciales: TurnoListado[];
  totalPaginasInicial: number;
  cargarTurnosAlMontar?: boolean;
  session: Session | null;
  initialServicios?: ServicioData[];
  initialBarberos?: BarberoData[];
  barberosFiltro?: BarberoData[];
  initialUsuarios?: UsuarioData[];
  initialRelaciones?: RelacionData[];
  whatsappPhone: string;
  datosTransferencia?: DatosTransferencia;
  mostrarFiltroBarbero?: boolean;
  barberoIdInicial?: string;
  fechaInicial?: string;
  vistaAgendaCompleta?: boolean;
}

function deduplicarTurnos(lista: TurnoListado[]): TurnoListado[] {
  const porId = new Map<string, TurnoListado>();
  for (const turno of lista) {
    porId.set(turno.id, turno);
  }
  return Array.from(porId.values());
}

async function buscarPagina(
  pagina: number,
  estado: string,
  fecha: string,
  barberoId: string,
  alcanceCache: string,
) {
  const filtrosCache = { pagina, estado, fecha, barberoId };
  const cache = alcanceCache
    ? leerConsultaTurnosCacheLocal(alcanceCache, filtrosCache)
    : null;

  if (cache) {
    return {
      success: true as const,
      data: cache.turnos.filter((turno) =>
        (estado === "TODOS" || turno.estado === estado) &&
        (!fecha || obtenerFechaSola(turno.horarioReservado) === fecha) &&
        (!barberoId || turno.barberoId === barberoId),
      ),
      totalPages: cache.totalPaginas,
      currentPage: cache.pagina,
    };
  }

  const resultado = await getTurnos(
    pagina,
    estado === "TODOS" ? undefined : estado,
    fecha || undefined,
    barberoId || undefined,
  );
  if (alcanceCache && resultado.success && resultado.data) {
    guardarConsultaTurnosCacheLocal(alcanceCache, filtrosCache, {
      turnos: resultado.data,
      totalPaginas: resultado.totalPages ?? 1,
      pagina: resultado.currentPage ?? pagina,
    });
  }
  return resultado;
}

export default function TurnoManager({
  turnosIniciales,
  totalPaginasInicial,
  cargarTurnosAlMontar = false,
  session,
  initialServicios = [],
  initialBarberos = [],
  barberosFiltro = initialBarberos,
  initialUsuarios = [],
  initialRelaciones = [],
  whatsappPhone,
  datosTransferencia,
  mostrarFiltroBarbero = false,
  barberoIdInicial = "",
  fechaInicial = "",
  vistaAgendaCompleta = false,
}: Props) {
  const esEmpleado = session?.user?.role === "EMPLEADO";
  const filtroInicial = esAdmin(session) || esEmpleado ? "CONFIRMADO" : "PENDIENTE";
  const [filtroEstado, setFiltroEstado] = useState(filtroInicial);
  const [fecha, setFecha] = useState(fechaInicial);
  const [barberoId, setBarberoId] = useState(barberoIdInicial);
  const [versionCalendario, setVersionCalendario] = useState(0);
  const [turnos, setTurnos] = useState(turnosIniciales);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(totalPaginasInicial);
  const [cargandoInicial, setCargandoInicial] = useState(cargarTurnosAlMontar);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [errorCargaMas, setErrorCargaMas] = useState(false);
  const alcanceCacheTurnos = session?.user?.id
    ? `${session.user.id}|${session.user.role ?? "USER"}|${barberoIdInicial}`
    : "";

  const solicitudRef = useRef(0);
  const cargaInicialSolicitadaRef = useRef(false);

  useEffect(() => {
    if (!cargarTurnosAlMontar || cargaInicialSolicitadaRef.current) return;
    cargaInicialSolicitadaRef.current = true;

    const id = ++solicitudRef.current;
    setCargandoInicial(true);
    setErrorCargaMas(false);

    void buscarPagina(1, filtroInicial, fecha, barberoId, alcanceCacheTurnos)
      .then((resultado) => {
        if (id !== solicitudRef.current) return;
        if (resultado.success && resultado.data) {
          setTurnos(resultado.data);
          setPaginaActual(resultado.currentPage ?? 1);
          setTotalPaginas(resultado.totalPages ?? 1);
          return;
        }
        setTurnos([]);
        setPaginaActual(1);
        setTotalPaginas(1);
      })
      .catch(() => {
        if (id !== solicitudRef.current) return;
        setTurnos([]);
        setPaginaActual(1);
        setTotalPaginas(1);
      })
      .finally(() => {
        if (id === solicitudRef.current) setCargandoInicial(false);
      });
  }, [alcanceCacheTurnos, barberoId, cargarTurnosAlMontar, fecha, filtroInicial]);

  const reiniciarBusqueda = async (nuevoEstado: string, nuevaFecha: string, nuevoBarberoId = barberoId) => {
    const id = ++solicitudRef.current;
    setCargandoInicial(true);
    setErrorCargaMas(false);
    const resultado = await buscarPagina(1, nuevoEstado, nuevaFecha, nuevoBarberoId, alcanceCacheTurnos);
    if (id !== solicitudRef.current) return;
    setCargandoInicial(false);
    if (resultado.success && resultado.data) {
      setTurnos(resultado.data);
      setPaginaActual(resultado.currentPage ?? 1);
      setTotalPaginas(resultado.totalPages ?? 1);
    } else {
      setTurnos([]);
      setPaginaActual(1);
      setTotalPaginas(1);
    }
  };

  // Se oculta la lista anterior mientras se muestra el resultado del nuevo filtro;
  // cada combinación consultada permanece guardada para reutilizarla al volver.
  const cambiarEstado = (nuevoEstado: string) => {
    if (nuevoEstado === filtroEstado) return;
    setFiltroEstado(nuevoEstado);
    setTurnos([]);
    void reiniciarBusqueda(nuevoEstado, fecha);
  };

  const cambiarFecha = (nuevaFecha: string) => {
    if (nuevaFecha === fecha) return;
    setFecha(nuevaFecha);
    setTurnos([]);
    void reiniciarBusqueda(filtroEstado, nuevaFecha);
  };

  const cambiarBarbero = (nuevoBarberoId: string) => {
    if (nuevoBarberoId === barberoId) return;
    setBarberoId(nuevoBarberoId);
    setTurnos([]);
    void reiniciarBusqueda(filtroEstado, fecha, nuevoBarberoId);
  };

  const cargarMas = async () => {
    if (cargandoMas || cargandoInicial || paginaActual >= totalPaginas) return;
    const id = ++solicitudRef.current;
    setCargandoMas(true);
    setErrorCargaMas(false);
    const resultado = await buscarPagina(paginaActual + 1, filtroEstado, fecha, barberoId, alcanceCacheTurnos);
    if (id !== solicitudRef.current) return;
    setCargandoMas(false);
    if (resultado.success && resultado.data) {
      setTurnos((prev) => deduplicarTurnos([...prev, ...(resultado.data ?? [])]));
      setPaginaActual(resultado.currentPage ?? paginaActual);
      setTotalPaginas(resultado.totalPages ?? totalPaginas);
    } else {
      setErrorCargaMas(true);
    }
  };

  const actualizarTurnoLocal = useCallback((idTurno: string, parche: ParcheTurnoCache) => {
    actualizarTurnoCacheLocal(alcanceCacheTurnos, idTurno, parche);
    setTurnos((prev) =>
      prev
        .map((turno) => turno.id === idTurno ? { ...turno, ...parche } : turno)
        .filter((turno) =>
          (filtroEstado === "TODOS" || turno.estado === filtroEstado) &&
          (!fecha || obtenerFechaSola(turno.horarioReservado) === fecha) &&
          (!barberoId || turno.barberoId === barberoId),
        ),
    );
  }, [alcanceCacheTurnos, barberoId, fecha, filtroEstado]);

  const actualizarEstadoTurno = useCallback((idTurno: string, nuevoEstado: TurnoListado["estado"]) => {
    const turnoActual = turnos.find((turno) => turno.id === idTurno);
    const nuevoEstadoPago = nuevoEstado === ESTADOS_TURNO[3]
      ? ESTADOS_PAGO[4]
      : nuevoEstado === ESTADOS_TURNO[1]
        ? turnoActual?.tipoPago === "TOTAL" ? ESTADOS_PAGO[2] : ESTADOS_PAGO[1]
        : undefined;
    actualizarTurnoLocal(idTurno, {
      estado: nuevoEstado,
      ...(nuevoEstadoPago ? { estadoPago: nuevoEstadoPago } : {}),
    });
    if (vistaAgendaCompleta) setVersionCalendario((version) => version + 1);
  }, [actualizarTurnoLocal, turnos, vistaAgendaCompleta]);

  const crearTurno = () => {
    if (vistaAgendaCompleta) setVersionCalendario((version) => version + 1);
    void reiniciarBusqueda(filtroEstado, fecha);
  };

  return (
    <DatosReservaProveedor
      servicios={initialServicios}
      barberos={initialBarberos}
      usuarios={initialUsuarios}
      relaciones={initialRelaciones}
      whatsappPhone={whatsappPhone}
    >
      <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="shrink-0 border-b border-[var(--admin-border)] bg-[var(--admin-background)] pb-3">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-texto-primario)] md:text-[28px]">
              {esEmpleado ? "Mis turnos" : "Gestión de Turnos"}
            </h1>
            <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
              {esEmpleado
                ? "Consultá las reservas asignadas a tu agenda."
                : "Administrá y organizá todos los turnos de tu barbería."}
            </p>
          </div>
          <CargadorModalGestionTurno
            session={session}
            initialServicios={initialServicios}
            initialBarberos={initialBarberos}
            initialUsuarios={initialUsuarios}
            initialRelaciones={initialRelaciones}
            alcanceCacheTurnos={alcanceCacheTurnos}
            onTurnoActualizado={actualizarTurnoLocal}
            whatsappPhone={whatsappPhone}
            datosTransferencia={datosTransferencia}
            onTurnoCreado={crearTurno}
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          {mostrarFiltroBarbero && <SelectorBarberoTurnos barberos={barberosFiltro} barberoIdPropio={barberoIdInicial} valor={barberoId} onChange={cambiarBarbero} />}
          <TurnosFiltros
            estado={filtroEstado}
            onChange={cambiarEstado}
            mostrarTodos={vistaAgendaCompleta || esAdmin(session)}
          />
          {!vistaAgendaCompleta && (
            <NavegacionFecha
              fecha={fecha}
              onCambiarFecha={cambiarFecha}
              estado={filtroEstado}
              barberoId={barberoId}
            />
          )}
        </div>
      </div>
      {vistaAgendaCompleta ? (
        <div
          key={`${filtroEstado}|${fecha}|${barberoId}`}
          className="min-h-0 flex-1 overflow-y-auto pr-1 md:overflow-hidden"
        >
          <div className="grid grid-cols-1 gap-4 md:h-full md:grid-cols-[minmax(250px,2fr)_minmax(0,3fr)]">
            <aside className="min-w-0 md:min-h-0 md:overflow-y-auto md:pr-1">
              <CalendarioMensualTurnos
                fecha={fecha}
                barberoId={barberoId}
                estadoFiltro={filtroEstado}
                versionActualizacion={versionCalendario}
                onSeleccionar={cambiarFecha}
              />
            </aside>

            <section
              aria-label="Turnos del día seleccionado"
              className="flex min-w-0 flex-col md:min-h-0 md:overflow-hidden"
            >
              <div className="md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1">
                <TurnoList
                  turnos={turnos}
                  session={session}
                  cargandoInicial={cargandoInicial}
                  cargandoMas={cargandoMas}
                  tieneMas={paginaActual < totalPaginas}
                  errorCargaMas={errorCargaMas}
                  onCargarMas={cargarMas}
                  onEstadoActualizado={actualizarEstadoTurno}
                  whatsappPhone={whatsappPhone}
                  datosTransferencia={datosTransferencia}
                  alcanceCacheTurnos={alcanceCacheTurnos}
                  onTurnoActualizado={actualizarTurnoLocal}
                  modoCronologicoCompacto
                  mensajeVacio="No hay turnos para esta fecha y estos filtros."
                />
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div
          key={`${filtroEstado}|${fecha}|${barberoId}`}
          className="min-h-0 flex-1 overflow-y-auto pr-1"
        >
          <TurnoList
            turnos={turnos}
            session={session}
            cargandoInicial={cargandoInicial}
            cargandoMas={cargandoMas}
            tieneMas={paginaActual < totalPaginas}
            errorCargaMas={errorCargaMas}
            onCargarMas={cargarMas}
            onEstadoActualizado={actualizarEstadoTurno}
            whatsappPhone={whatsappPhone}
            datosTransferencia={datosTransferencia}
            alcanceCacheTurnos={alcanceCacheTurnos}
            onTurnoActualizado={actualizarTurnoLocal}
            mostrarFechas
          />
        </div>
      )}
      </div>
    </DatosReservaProveedor>
  );
}
