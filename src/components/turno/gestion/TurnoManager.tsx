"use client";

import { useEffect, useRef, useState } from "react";
import { getTurnos } from "@/actions/turnos/listar.actions";
import CargadorModalGestionTurno from "@/components/turno/reserva/CargadorModalGestionTurno";
import DatosReservaProveedor from "@/contextos/DatosReservaProveedor";
import TurnoList from "./TurnoList";
import TurnosFiltros from "./TurnosFiltros";
import NavegacionFecha from "./NavegacionFecha";
import SelectorBarberoTurnos from "./SelectorBarberoTurnos";
import { esAdmin } from "@/lib/seguridad/es-admin";
import { ESTADOS_PAGO, ESTADOS_TURNO } from "@/lib/constants";
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
}

function deduplicarTurnos(lista: TurnoListado[]): TurnoListado[] {
  const porId = new Map<string, TurnoListado>();
  for (const turno of lista) {
    porId.set(turno.id, turno);
  }
  return Array.from(porId.values());
}

function buscarPagina(pagina: number, estado: string, fecha: string, barberoId: string) {
  return getTurnos(pagina, estado === "TODOS" ? undefined : estado, fecha || undefined, barberoId || undefined);
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
}: Props) {
  const esEmpleado = session?.user?.role === "EMPLEADO";
  const filtroInicial = esAdmin(session) || esEmpleado ? "CONFIRMADO" : "PENDIENTE";
  const [filtroEstado, setFiltroEstado] = useState(filtroInicial);
  const [fecha, setFecha] = useState("");
  const [barberoId, setBarberoId] = useState(barberoIdInicial);
  const [turnos, setTurnos] = useState(turnosIniciales);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(totalPaginasInicial);
  const [cargandoInicial, setCargandoInicial] = useState(cargarTurnosAlMontar);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [errorCargaMas, setErrorCargaMas] = useState(false);

  const solicitudRef = useRef(0);
  const cargaInicialSolicitadaRef = useRef(false);

  useEffect(() => {
    if (!cargarTurnosAlMontar || cargaInicialSolicitadaRef.current) return;
    cargaInicialSolicitadaRef.current = true;

    const id = ++solicitudRef.current;
    setCargandoInicial(true);
    setErrorCargaMas(false);

    void buscarPagina(1, filtroInicial, "", barberoId)
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
  }, [barberoId, cargarTurnosAlMontar, filtroInicial]);

  const reiniciarBusqueda = async (nuevoEstado: string, nuevaFecha: string, nuevoBarberoId = barberoId) => {
    const id = ++solicitudRef.current;
    setCargandoInicial(true);
    setErrorCargaMas(false);
    const resultado = await buscarPagina(1, nuevoEstado, nuevaFecha, nuevoBarberoId);
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

  const cambiarEstado = (nuevoEstado: string) => {
    if (nuevoEstado === filtroEstado) return;
    setFiltroEstado(nuevoEstado);
    void reiniciarBusqueda(nuevoEstado, fecha);
  };

  const cambiarFecha = (nuevaFecha: string) => {
    if (nuevaFecha === fecha) return;
    setFecha(nuevaFecha);
    void reiniciarBusqueda(filtroEstado, nuevaFecha);
  };

  const cambiarBarbero = (nuevoBarberoId: string) => {
    if (nuevoBarberoId === barberoId) return;
    setBarberoId(nuevoBarberoId);
    void reiniciarBusqueda(filtroEstado, fecha, nuevoBarberoId);
  };

  const cargarMas = async () => {
    if (cargandoMas || cargandoInicial || paginaActual >= totalPaginas) return;
    const id = ++solicitudRef.current;
    setCargandoMas(true);
    setErrorCargaMas(false);
    const resultado = await buscarPagina(paginaActual + 1, filtroEstado, fecha, barberoId);
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

  const actualizarEstadoTurno = (idTurno: string, nuevoEstado: string) => {
    setTurnos((prev) =>
      prev
        .map((turno) =>
          turno.id === idTurno
            ? {
                ...turno,
                estado: nuevoEstado as TurnoListado["estado"],
                ...(nuevoEstado === ESTADOS_TURNO[3]
                  ? { estadoPago: ESTADOS_PAGO[4] }
                  : {}),
              }
            : turno,
        )
        .filter((turno) => filtroEstado === "TODOS" || turno.estado === filtroEstado),
    );
  };

  return (
    <DatosReservaProveedor
      servicios={initialServicios}
      barberos={initialBarberos}
      usuarios={initialUsuarios}
      relaciones={initialRelaciones}
      whatsappPhone={whatsappPhone}
    >
      <div className="space-y-5">
      <div className="sticky top-0 z-30 border-b border-[var(--admin-border)] bg-[var(--admin-background)] pb-4">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          {!esEmpleado && <CargadorModalGestionTurno
            session={session}
            initialServicios={initialServicios}
            initialBarberos={initialBarberos}
            initialUsuarios={initialUsuarios}
            initialRelaciones={initialRelaciones}
            whatsappPhone={whatsappPhone}
            datosTransferencia={datosTransferencia}
            onTurnoCreado={() => void reiniciarBusqueda(filtroEstado, fecha)}
          />}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {mostrarFiltroBarbero && <SelectorBarberoTurnos barberos={barberosFiltro} valor={barberoId} onChange={cambiarBarbero} />}
          <TurnosFiltros
            estado={filtroEstado}
            onChange={cambiarEstado}
            mostrarTodos={esAdmin(session)}
          />
          <NavegacionFecha
            fecha={fecha}
            onCambiarFecha={cambiarFecha}
            estado={filtroEstado}
            barberoId={barberoId}
          />
        </div>
      </div>
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
      />
      </div>
    </DatosReservaProveedor>
  );
}
