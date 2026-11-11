"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { UserRound, UsersRound } from "lucide-react";
import { getTodosTurnos } from "@/actions/turnos/listar.actions";
import CargadorModalGestionTurno from "@/components/turno/reserva/CargadorModalGestionTurno";
import DatosReservaProveedor from "@/contextos/DatosReservaProveedor";
import { insertarTurnoCacheLocal, actualizarTurnoCacheLocal, guardarTurnosCacheLocal, leerTurnosCacheLocal } from "@/lib/admin/turnos-cache-local";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import { esAdmin } from "@/lib/seguridad/es-admin";
import { ESTADOS_PAGO, ESTADOS_TURNO } from "@/lib/constants";
import type { ParcheTurnoCache } from "@/lib/admin/turnos-cache-local";
import type { BarberoData, RelacionData, ServicioData, TurnoConDetalle, TurnoListado, UsuarioData } from "@/types/turno";
import type { DatosTransferencia } from "@/types/pago";
import type { Session } from "next-auth";
import CalendarioMensualTurnos from "./CalendarioMensualTurnos";
import NavegacionFecha from "./NavegacionFecha";
import SelectorDesplegable from "@/components/ui/SelectorDesplegable";
import type { OpcionDesplegable } from "@/components/ui/SelectorDesplegable";
import TurnoList from "./TurnoList";
import TurnosFiltros from "./TurnosFiltros";

const TAMANO_PAGINA_LOCAL = 10;

interface Props {
  turnosIniciales: TurnoListado[];
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

function ordenarTurnos(turnos: TurnoListado[]): TurnoListado[] {
  return [...turnos].sort(
    (primero, segundo) =>
      new Date(segundo.horarioReservado).getTime() - new Date(primero.horarioReservado).getTime(),
  );
}

function convertirTurnoCreado(turno: TurnoConDetalle): TurnoListado {
  return {
    id: turno.id,
    userId: turno.userId,
    clienteNombre: turno.clienteNombre,
    clienteApellido: turno.clienteApellido,
    clienteTelefono: turno.clienteTelefono,
    clienteEmail: turno.clienteEmail,
    barberoId: turno.barberoId,
    servicioId: turno.servicioId,
    horarioReservado: turno.horarioReservado,
    precioCongelado: turno.precioCongelado,
    seniaCongelada: turno.seniaCongelada,
    estado: turno.estado,
    estadoPago: turno.estadoPago,
    tipoPago: turno.tipoPago,
    metodoPago: turno.metodoPago,
    user: {
      id: turno.user.id,
      name: turno.user.name,
      email: turno.user.email,
      telefono: turno.user.telefono,
      esInvitado: turno.user.esInvitado,
      emailContacto: turno.user.emailContacto,
    },
    servicio: {
      id: turno.servicio.id,
      nombre: turno.servicio.nombre,
      duracion: turno.servicio.duracion,
    },
    barbero: { id: turno.barbero.id, nombre: turno.barbero.nombre },
  };
}

export default function TurnoManager({
  turnosIniciales,
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
  const [turnos, setTurnos] = useState(turnosIniciales);
  const opcionesFiltroBarbero = useMemo<OpcionDesplegable<string>[]>(() => [
    {
      valor: "",
      etiqueta: "Todos los empleados",
      icono: <UsersRound className="h-4 w-4 shrink-0 text-[var(--admin-texto-muted)]" aria-hidden="true" />,
    },
    ...barberosFiltro.map((barbero) => {
      const distintivos: string[] = [];
      if (barbero.estado === false) distintivos.push("Inactivo");
      if (barbero.id === barberoIdInicial) distintivos.push("Yo");
      return {
        valor: barbero.id,
        etiqueta: barbero.nombre,
        distintivos,
        icono: <UserRound className="h-4 w-4 shrink-0 text-[var(--admin-texto-muted)]" aria-hidden="true" />,
      };
    }),
  ], [barberosFiltro, barberoIdInicial]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [cargandoInicial, setCargandoInicial] = useState(cargarTurnosAlMontar);
  const [errorCargaInicial, setErrorCargaInicial] = useState(false);
  const contenidoListaMovilRef = useRef<HTMLDivElement>(null);
  const [limitarListaMovil, setLimitarListaMovil] = useState(false);
  const alcanceCacheTurnos = session?.user?.id
    ? `${session.user.id}|${session.user.role ?? "USER"}|${barberoIdInicial}`
    : "";
  const clavePreferenciaBarbero = mostrarFiltroBarbero && session?.user?.id
    ? `mayoraz-admin-turno-barbero-v1:${session.user.id}`
    : null;
  const [preferenciaBarberoLista, setPreferenciaBarberoLista] = useState(
    !clavePreferenciaBarbero,
  );

  const turnosRef = useRef(turnosIniciales);
  const cambiosDuranteCargaRef = useRef(new Map<string, TurnoListado>());
  const cargaServidorActivaRef = useRef(false);
  const solicitudRef = useRef(0);
  const preferenciaBarberoLeidaRef = useRef<string | null>(null);

  const cargarDatosDesdeServidor = useCallback(async () => {
    const idSolicitud = ++solicitudRef.current;
    cargaServidorActivaRef.current = true;
    if (turnosRef.current.length === 0) setCargandoInicial(true);
    setErrorCargaInicial(false);

    try {
      const resultado = await getTodosTurnos();
      if (idSolicitud !== solicitudRef.current) return;
      if (!resultado.success || !resultado.data) {
        setErrorCargaInicial(true);
        return;
      }

      const porId = new Map(resultado.data.map((turno) => [turno.id, turno]));
      for (const [id, turno] of cambiosDuranteCargaRef.current) porId.set(id, turno);
      const datosCompletos = ordenarTurnos(Array.from(porId.values()));
      turnosRef.current = datosCompletos;
      setTurnos(datosCompletos);
      guardarTurnosCacheLocal(alcanceCacheTurnos, datosCompletos);
      cambiosDuranteCargaRef.current.clear();
      setPaginaActual(1);
    } catch {
      if (idSolicitud === solicitudRef.current) setErrorCargaInicial(true);
    } finally {
      if (idSolicitud === solicitudRef.current) {
        cargaServidorActivaRef.current = false;
        cambiosDuranteCargaRef.current.clear();
        setCargandoInicial(false);
      }
    }
  }, [alcanceCacheTurnos]);

  useEffect(() => {
    if (!cargarTurnosAlMontar) return;
    const cache = leerTurnosCacheLocal(alcanceCacheTurnos);
    if (cache) {
      turnosRef.current = cache.turnos;
      setTurnos(cache.turnos);
      setCargandoInicial(false);
      if (cache.vigente) return;
    }

    void cargarDatosDesdeServidor();
    return () => {
      solicitudRef.current += 1;
    };
  }, [alcanceCacheTurnos, cargarDatosDesdeServidor, cargarTurnosAlMontar]);

  useEffect(() => {
    if (
      !clavePreferenciaBarbero ||
      preferenciaBarberoLeidaRef.current === clavePreferenciaBarbero
    ) return;
    preferenciaBarberoLeidaRef.current = clavePreferenciaBarbero;

    try {
      const barberoGuardado = window.localStorage.getItem(clavePreferenciaBarbero);
      if (barberoGuardado !== null) {
        const esBarberoDisponible = barberosFiltro.some(
          (barbero) => barbero.id === barberoGuardado,
        );
        if (barberoGuardado === "" || esBarberoDisponible) {
          setBarberoId(barberoGuardado);
          setPaginaActual(1);
        } else {
          window.localStorage.removeItem(clavePreferenciaBarbero);
        }
      }
    } catch {
      // El filtro sigue funcionando en memoria si el navegador bloquea localStorage.
    } finally {
      setPreferenciaBarberoLista(true);
    }
  }, [barberosFiltro, clavePreferenciaBarbero]);

  const turnosFiltrados = useMemo(
    () => turnos.filter((turno) =>
      (filtroEstado === "TODOS" || turno.estado === filtroEstado) &&
      (!fecha || obtenerFechaSola(turno.horarioReservado) === fecha) &&
      (!barberoId || turno.barberoId === barberoId),
    ),
    [barberoId, fecha, filtroEstado, turnos],
  );
  const totalPaginas = Math.max(1, Math.ceil(turnosFiltrados.length / TAMANO_PAGINA_LOCAL));
  const turnosVisibles = turnosFiltrados.slice(0, paginaActual * TAMANO_PAGINA_LOCAL);

  useLayoutEffect(() => {
    if (!vistaAgendaCompleta) return;
    const contenido = contenidoListaMovilRef.current;
    if (!contenido) return;

    const escritorio = window.matchMedia("(min-width: 768px)");
    const actualizarLimiteLista = () => {
      if (escritorio.matches || cargandoInicial) {
        setLimitarListaMovil(false);
        return;
      }
      const altoVisible = window.visualViewport?.height || window.innerHeight;
      setLimitarListaMovil(contenido.scrollHeight > altoVisible * 0.77);
    };

    actualizarLimiteLista();
    const observador = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(actualizarLimiteLista)
      : null;
    observador?.observe(contenido);
    window.addEventListener("resize", actualizarLimiteLista);
    window.visualViewport?.addEventListener("resize", actualizarLimiteLista);

    return () => {
      observador?.disconnect();
      window.removeEventListener("resize", actualizarLimiteLista);
      window.visualViewport?.removeEventListener("resize", actualizarLimiteLista);
    };
  }, [cargandoInicial, turnosVisibles.length, vistaAgendaCompleta]);

  const cambiarEstado = (nuevoEstado: string) => {
    if (nuevoEstado === filtroEstado) return;
    setFiltroEstado(nuevoEstado);
    setPaginaActual(1);
  };

  const cambiarFecha = (nuevaFecha: string) => {
    if (nuevaFecha === fecha) return;
    setFecha(nuevaFecha);
    setPaginaActual(1);
  };

  const cambiarBarbero = (nuevoBarberoId: string) => {
    if (nuevoBarberoId === barberoId) return;
    setBarberoId(nuevoBarberoId);
    setPaginaActual(1);
    if (clavePreferenciaBarbero) {
      try {
        window.localStorage.setItem(clavePreferenciaBarbero, nuevoBarberoId);
      } catch {
        // La selección continúa activa aunque no pueda guardarse para la próxima visita.
      }
    }
  };

  const cargarMas = useCallback(() => {
    setPaginaActual((pagina) => Math.min(pagina + 1, totalPaginas));
  }, [totalPaginas]);

  const actualizarTurnoLocal = useCallback((idTurno: string, parche: ParcheTurnoCache) => {
    actualizarTurnoCacheLocal(alcanceCacheTurnos, idTurno, parche);
    const turnoActual = turnosRef.current.find((turno) => turno.id === idTurno);
    if (!turnoActual) return;

    const actualizado = { ...turnoActual, ...parche };
    if (cargaServidorActivaRef.current) {
      cambiosDuranteCargaRef.current.set(idTurno, actualizado);
    }
    const datosActualizados = ordenarTurnos(
      turnosRef.current.map((turno) => turno.id === idTurno ? actualizado : turno),
    );
    turnosRef.current = datosActualizados;
    setTurnos(datosActualizados);
  }, [alcanceCacheTurnos]);

  const actualizarEstadoTurno = useCallback((idTurno: string, nuevoEstado: TurnoListado["estado"]) => {
    const turnoActual = turnosRef.current.find((turno) => turno.id === idTurno);
    const nuevoEstadoPago = nuevoEstado === ESTADOS_TURNO[3]
      ? ESTADOS_PAGO[4]
      : nuevoEstado === ESTADOS_TURNO[1]
        ? turnoActual?.tipoPago === "TOTAL" ? ESTADOS_PAGO[2] : ESTADOS_PAGO[1]
        : undefined;
    actualizarTurnoLocal(idTurno, {
      estado: nuevoEstado,
      ...(nuevoEstadoPago ? { estadoPago: nuevoEstadoPago } : {}),
    });
  }, [actualizarTurnoLocal]);

  const crearTurno = useCallback((turnoCreado: TurnoConDetalle) => {
    const nuevoTurno = convertirTurnoCreado(turnoCreado);
    const datosActualizados = ordenarTurnos([
      nuevoTurno,
      ...turnosRef.current.filter((turno) => turno.id !== nuevoTurno.id),
    ]);
    turnosRef.current = datosActualizados;
    if (cargaServidorActivaRef.current) {
      cambiosDuranteCargaRef.current.set(nuevoTurno.id, nuevoTurno);
    }
    insertarTurnoCacheLocal(alcanceCacheTurnos, nuevoTurno);
    setTurnos(datosActualizados);
    setPaginaActual(1);
  }, [alcanceCacheTurnos]);

  return (
    <DatosReservaProveedor
      servicios={initialServicios}
      barberos={initialBarberos}
      usuarios={initialUsuarios}
      relaciones={initialRelaciones}
      whatsappPhone={whatsappPhone}
    >
      <div className={vistaAgendaCompleta
        ? "flex min-h-full flex-col gap-3 md:h-full md:min-h-0"
        : "flex h-full min-h-0 flex-col gap-3"}
      >
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
            {mostrarFiltroBarbero && (
              <SelectorDesplegable
                opciones={opcionesFiltroBarbero}
                valor={barberoId}
                onChange={cambiarBarbero}
                deshabilitado={!preferenciaBarberoLista}
                cargando={!preferenciaBarberoLista}
                etiquetaAria="Filtrar turnos por empleado"
                className="max-w-[250px]"
              />
            )}
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
                turnos={turnos}
                cargandoTurnos={cargandoInicial}
              />
            )}
          </div>
        </div>
        {errorCargaInicial && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 text-sm text-[var(--admin-texto-muted)]">
            <span>{turnos.length > 0 ? "No se pudieron actualizar los turnos guardados." : "No se pudieron cargar los turnos."}</span>
            <button
              type="button"
              onClick={() => void cargarDatosDesdeServidor()}
              className="font-medium text-[var(--page-primary-tinta)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]"
            >
              Reintentar
            </button>
          </div>
        )}
        {vistaAgendaCompleta ? (
          <div className="grid grid-cols-1 grid-rows-[auto_auto] gap-4 pr-1 md:min-h-0 md:flex-1 md:grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[minmax(250px,2fr)_minmax(0,3fr)] lg:grid-rows-1 lg:overflow-hidden">
            <aside className="min-w-0 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
              <CalendarioMensualTurnos
                fecha={fecha}
                barberoId={barberoId}
                turnos={turnos}
                cargandoTurnos={cargandoInicial}
                onSeleccionar={cambiarFecha}
              />
            </aside>
            <section
              aria-label="Turnos del día seleccionado"
              className="flex min-w-0 flex-col md:min-h-0 md:overflow-hidden"
            >
              <div className={`${limitarListaMovil
                ? "max-h-[77dvh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                : "overflow-y-visible"} pr-1 md:max-h-none md:min-h-0 md:flex-1 md:overflow-y-auto`}
              >
                <div ref={contenidoListaMovilRef}>
                  <TurnoList
                    turnos={turnosVisibles}
                    session={session}
                    cargandoInicial={cargandoInicial}
                    tieneMas={paginaActual < totalPaginas}
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
              </div>
            </section>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <TurnoList
              turnos={turnosVisibles}
              session={session}
              cargandoInicial={cargandoInicial}
              tieneMas={paginaActual < totalPaginas}
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
