"use client";

import { useRef, useState } from "react";
import { getTurnos } from "@/actions/turnos/listar.actions";
import ModalGestionTurno from "@/components/turno/reserva/ModalGestionTurno";
import DatosReservaProveedor from "@/contextos/DatosReservaProveedor";
import TurnoList from "./TurnoList";
import TurnosFiltros from "./TurnosFiltros";
import NavegacionFecha from "./NavegacionFecha";
import type {
  BarberoData,
  RelacionData,
  ServicioData,
  TurnoListado,
  UsuarioData,
} from "@/types/turno";
import type { Session } from "next-auth";

interface Props {
  turnosIniciales: TurnoListado[];
  totalPaginasInicial: number;
  session: Session | null;
  initialServicios?: ServicioData[];
  initialBarberos?: BarberoData[];
  initialUsuarios?: UsuarioData[];
  initialRelaciones?: RelacionData[];
  whatsappPhone: string;
}

function deduplicarTurnos(lista: TurnoListado[]): TurnoListado[] {
  const porId = new Map<string, TurnoListado>();
  for (const turno of lista) {
    porId.set(turno.id, turno);
  }
  return Array.from(porId.values());
}

function buscarPagina(pagina: number, estado: string, fecha: string) {
  return getTurnos(pagina, estado === "TODOS" ? undefined : estado, fecha || undefined);
}

export default function TurnoManager({
  turnosIniciales,
  totalPaginasInicial,
  session,
  initialServicios = [],
  initialBarberos = [],
  initialUsuarios = [],
  initialRelaciones = [],
  whatsappPhone,
}: Props) {
  const [filtroEstado, setFiltroEstado] = useState("PENDIENTE");
  const [fecha, setFecha] = useState("");
  const [turnos, setTurnos] = useState(turnosIniciales);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(totalPaginasInicial);
  const [cargandoInicial, setCargandoInicial] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [errorCargaMas, setErrorCargaMas] = useState(false);

  const solicitudRef = useRef(0);

  const reiniciarBusqueda = async (nuevoEstado: string, nuevaFecha: string) => {
    const id = ++solicitudRef.current;
    setCargandoInicial(true);
    setErrorCargaMas(false);
    const resultado = await buscarPagina(1, nuevoEstado, nuevaFecha);
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

  const cargarMas = async () => {
    if (cargandoMas || cargandoInicial || paginaActual >= totalPaginas) return;
    const id = ++solicitudRef.current;
    setCargandoMas(true);
    setErrorCargaMas(false);
    const resultado = await buscarPagina(paginaActual + 1, filtroEstado, fecha);
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
            ? { ...turno, estado: nuevoEstado as TurnoListado["estado"] }
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
              Gestión de Turnos
            </h1>
            <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
              Administrá y organizá todos los turnos de tu barbería.
            </p>
          </div>
          <ModalGestionTurno
            session={session}
            initialServicios={initialServicios}
            initialBarberos={initialBarberos}
            initialUsuarios={initialUsuarios}
            initialRelaciones={initialRelaciones}
            whatsappPhone={whatsappPhone}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TurnosFiltros estado={filtroEstado} onChange={cambiarEstado} />
          <NavegacionFecha fecha={fecha} onCambiarFecha={cambiarFecha} />
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
      />
      </div>
    </DatosReservaProveedor>
  );
}
