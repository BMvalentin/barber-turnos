"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, UserRound, UsersRound } from "lucide-react";
import CargadorModalGestionTurno from "@/components/turno/reserva/CargadorModalGestionTurno";
import DatosReservaProveedor from "@/contextos/DatosReservaProveedor";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import { esAdmin } from "@/lib/seguridad/es-admin";
import { nombreVisibleBarbero } from "@/lib/barberos/nombre-profesional";
import { invalidarDisponibilidadLocal } from "@/lib/turnos/disponibilidad-cliente";
import { ESTADOS_PAGO, ESTADOS_TURNO } from "@/lib/constants";
import type { ParcheTurnoCache } from "@/lib/admin/turnos-cache-local";
import type { BarberoData, RelacionData, ServicioData, TurnoConDetalle, TurnoListado, UsuarioData } from "@/types/turno";
import type { DatosTransferencia } from "@/types/pago";
import type { Session } from "next-auth";
import AgendaDiariaTurnos from "./AgendaDiariaTurnos";
import SelectorDesplegable from "@/components/ui/SelectorDesplegable";
import type { OpcionDesplegable } from "@/components/ui/SelectorDesplegable";
import TurnoList from "./TurnoList";
import TurnosFiltros from "./TurnosFiltros";
import { useAgendaMensual } from "./useAgendaMensual";

const TAMANO_PAGINA_LOCAL = 10;

interface Props {
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
  fechaInicial: string;
  agendaInicial?: "personal" | "equipo";
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
  fechaInicial,
  agendaInicial,
}: Props) {
  const esEmpleado = session?.user?.role === "EMPLEADO";
  const filtroInicial = agendaInicial ? "TODOS" : esAdmin(session) || esEmpleado ? "CONFIRMADO" : "PENDIENTE";
  const [filtroEstado, setFiltroEstado] = useState(filtroInicial);
  const [fecha, setFecha] = useState(fechaInicial);
  const mesAgenda = fecha.slice(0, 7);
  const [mesCalendario, setMesCalendario] = useState(mesAgenda);
  const { agenda, calendario, cargarMes, obtenerTurno, registrarTurno } = useAgendaMensual(mesAgenda, mesCalendario);
  const [barberoSeleccionado, setBarberoId] = useState(agendaInicial === "equipo" ? "" : barberoIdInicial);
  const barberoId = !mostrarFiltroBarbero || barberosFiltro.some(({ id }) => id === barberoSeleccionado)
    ? barberoSeleccionado
    : "";
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
        etiqueta: nombreVisibleBarbero(barbero.nombre),
        distintivos,
        icono: <UserRound className="h-4 w-4 shrink-0 text-[var(--admin-texto-muted)]" aria-hidden="true" />,
      };
    }),
  ], [barberosFiltro, barberoIdInicial]);
  const [paginaActual, setPaginaActual] = useState(1);
  const clavePreferenciaBarbero = mostrarFiltroBarbero && session?.user?.id
    ? `mayoraz-admin-turno-barbero-v1:${session.user.id}`
    : null;
  const clavePreferenciaInicial = agendaInicial ? null : clavePreferenciaBarbero;
  const [preferenciaBarberoLista, setPreferenciaBarberoLista] = useState(
    !clavePreferenciaInicial,
  );

  const preferenciaBarberoLeidaRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      !clavePreferenciaInicial ||
      preferenciaBarberoLeidaRef.current === clavePreferenciaInicial
    ) return;
    preferenciaBarberoLeidaRef.current = clavePreferenciaInicial;

    try {
      const barberoGuardado = window.localStorage.getItem(clavePreferenciaInicial);
      if (barberoGuardado !== null) {
        const esBarberoDisponible = barberosFiltro.some(
          (barbero) => barbero.id === barberoGuardado,
        );
        if (barberoGuardado === "" || esBarberoDisponible) {
          setBarberoId(barberoGuardado);
          setPaginaActual(1);
        } else {
          window.localStorage.removeItem(clavePreferenciaInicial);
        }
      }
    } catch {
      // El filtro sigue funcionando en memoria si el navegador bloquea localStorage.
    } finally {
      setPreferenciaBarberoLista(true);
    }
  }, [barberosFiltro, clavePreferenciaInicial]);

  const turnosFiltrados = useMemo(
    () => agenda.turnos.filter((turno) =>
      (filtroEstado === "TODOS" || turno.estado === filtroEstado) &&
      obtenerFechaSola(turno.horarioReservado) === fecha &&
      (!barberoId || turno.barberoId === barberoId),
    ),
    [agenda.turnos, barberoId, fecha, filtroEstado],
  );
  const totalPaginas = Math.max(1, Math.ceil(turnosFiltrados.length / TAMANO_PAGINA_LOCAL));
  const turnosVisibles = turnosFiltrados.slice(0, paginaActual * TAMANO_PAGINA_LOCAL);

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
    if (nuevoBarberoId === barberoSeleccionado) return;
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
    const turno = obtenerTurno(idTurno);
    if (turno) registrarTurno({ ...turno, ...parche });
  }, [obtenerTurno, registrarTurno]);

  const actualizarEstadoTurno = useCallback((idTurno: string, nuevoEstado: TurnoListado["estado"]) => {
    const turnoActual = obtenerTurno(idTurno);
    if (turnoActual && (nuevoEstado === ESTADOS_TURNO[2] || nuevoEstado === ESTADOS_TURNO[3])) {
      invalidarDisponibilidadLocal(turnoActual.barberoId, obtenerFechaSola(turnoActual.horarioReservado));
    }
    const nuevoEstadoPago = nuevoEstado === ESTADOS_TURNO[3]
      ? ESTADOS_PAGO[4]
      : nuevoEstado === ESTADOS_TURNO[1]
        ? turnoActual?.tipoPago === "TOTAL" ? ESTADOS_PAGO[2] : ESTADOS_PAGO[1]
        : undefined;
    actualizarTurnoLocal(idTurno, {
      estado: nuevoEstado,
      ...(nuevoEstadoPago ? { estadoPago: nuevoEstadoPago } : {}),
    });
  }, [actualizarTurnoLocal, obtenerTurno]);

  const crearTurno = useCallback((turnoCreado: TurnoConDetalle) => {
    registrarTurno(convertirTurnoCreado(turnoCreado));
    setPaginaActual(1);
  }, [registrarTurno]);

  const reintentar = () => {
    if (agenda.error) void cargarMes(mesAgenda);
    if (calendario.error && mesAgenda !== mesCalendario) void cargarMes(mesCalendario);
  };

  const agendaSinDatos = agenda.error && agenda.turnos.length === 0;

  return (
    <DatosReservaProveedor
      servicios={initialServicios}
      barberos={initialBarberos}
      usuarios={initialUsuarios}
      relaciones={initialRelaciones}
      whatsappPhone={whatsappPhone}
    >
      <div className="admin-pagina">
        <header className="admin-encabezado max-sm:grid max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:items-start max-sm:gap-2">
          <div>
            <h1>{esEmpleado ? "Mis turnos" : "Turnos"}</h1>
            <p>
              {esEmpleado
                ? "Consultá las reservas asignadas a tu agenda."
                : "Consultá la agenda y gestioná las reservas."}
            </p>
          </div>
          <CargadorModalGestionTurno
            vistaAdministrativa
            session={session}
            initialServicios={initialServicios}
            initialBarberos={initialBarberos}
            initialUsuarios={initialUsuarios}
            initialRelaciones={initialRelaciones}
            onTurnoActualizado={actualizarTurnoLocal}
            whatsappPhone={whatsappPhone}
            datosTransferencia={datosTransferencia}
            onTurnoCreado={crearTurno}
            claseTrigger="admin-accion whitespace-nowrap max-sm:gap-1 max-sm:px-3 max-sm:text-xs"
            contenidoTrigger={(
              <>
                <Plus size={18} aria-hidden="true" />
                Nuevo turno
              </>
            )}
          />
        </header>

        <div className="flex min-w-0 flex-col gap-2.5 xl:flex-row xl:flex-wrap xl:items-center xl:justify-between">
          {mostrarFiltroBarbero && (
            <SelectorDesplegable
              opciones={opcionesFiltroBarbero}
              valor={barberoId}
              onChange={cambiarBarbero}
              deshabilitado={!preferenciaBarberoLista}
              cargando={!preferenciaBarberoLista}
              etiquetaAria="Filtrar turnos por empleado"
              className="w-full sm:max-w-64"
              claseBoton="admin-control"
            />
          )}
          <TurnosFiltros
            estado={filtroEstado}
            onChange={cambiarEstado}
            mostrarTodos
          />
        </div>
        {(agenda.error || calendario.error) && (
          <div role="status" className="admin-card flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm text-[var(--admin-texto-secundario)]">
            <span>No se pudieron cargar todos los turnos de la agenda.</span>
            <button
              type="button"
              onClick={reintentar}
              className="admin-control"
            >
              Reintentar
            </button>
          </div>
        )}
        <AgendaDiariaTurnos
          fecha={fecha}
          barberoId={barberoId}
          turnos={calendario.turnos}
          cargandoTurnos={calendario.cargando && calendario.turnos.length === 0}
          cargandoAgenda={agenda.cargando && agenda.turnos.length === 0}
          mesVisible={mesCalendario}
          onCambiarMes={setMesCalendario}
          onSeleccionar={cambiarFecha}
          cantidad={agendaSinDatos ? null : turnosFiltrados.length}
        >
          <TurnoList
            turnos={turnosVisibles}
            session={session}
            cargandoInicial={agenda.cargando && agenda.turnos.length === 0}
            tieneMas={paginaActual < totalPaginas}
            onCargarMas={cargarMas}
            onEstadoActualizado={actualizarEstadoTurno}
            whatsappPhone={whatsappPhone}
            datosTransferencia={datosTransferencia}
            onTurnoActualizado={actualizarTurnoLocal}
            mostrarFechas={false}
            modoCronologicoCompacto
            vistaAdministrativa
            mensajeVacio={agendaSinDatos
              ? "Reintentá la carga para consultar la agenda."
              : "No hay turnos para esta fecha y estos filtros."}
          />
        </AgendaDiariaTurnos>
      </div>
    </DatosReservaProveedor>
  );
}
