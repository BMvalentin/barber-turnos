"use client";

import { useState } from "react";
import type { Session } from "next-auth";
import { useDatosReserva } from "@/hooks/useDatosReserva";
import type {
  BarberoData,
  RelacionData,
  ServicioData,
  TurnoListado,
  UsuarioData,
} from "@/types/turno";

export type ParametrosDatosTurno = {
  session: Session | null;
  initialServicios?: ServicioData[];
  initialBarberos?: BarberoData[];
  initialUsuarios?: UsuarioData[];
  initialRelaciones?: RelacionData[];
  /* Turno a editar: si viene, el formulario arranca precargado. */
  turnoInicial?: TurnoListado | null;
};

export function useDatosFormularioTurno({
  session,
  initialServicios = [],
  initialBarberos = [],
  initialUsuarios = [],
  initialRelaciones = [],
  turnoInicial,
}: ParametrosDatosTurno) {
  const datosContexto = useDatosReserva();

  const [isOpen, setIsOpen] = useState(false);

  const servicios =
    initialServicios.length > 0 ? initialServicios : datosContexto.servicios;
  const barberos =
    initialBarberos.length > 0 ? initialBarberos : datosContexto.barberos;
  const usuarios =
    initialUsuarios.length > 0 ? initialUsuarios : datosContexto.usuarios;
  const relaciones =
    initialRelaciones.length > 0 ? initialRelaciones : datosContexto.relaciones;

  const [selectedServicioId, setSelectedServicioId] = useState(
    turnoInicial?.servicio?.id || "",
  );
  const [selectedBarberoId, setSelectedBarberoId] = useState(
    turnoInicial?.barbero?.id || "",
  );
  const [selectedUserId, setSelectedUserId] = useState(
    turnoInicial?.user?.id ||
      (session?.user?.role === "USER" ? session?.user?.id ?? "" : ""),
  );

  const serviciosFiltrados = selectedBarberoId
    ? servicios.filter((s) =>
        relaciones.some((r) => r.barberoId === selectedBarberoId && r.servicioId === s.id),
      )
    : servicios;

  const barberosFiltrados = selectedServicioId
    ? barberos.filter((b) =>
        relaciones.some((r) => r.servicioId === selectedServicioId && r.barberoId === b.id),
      )
    : barberos;

  const handleBarberoChange = (nuevoBarberoId: string) => {
    if (nuevoBarberoId === selectedBarberoId) return;
    setSelectedBarberoId(nuevoBarberoId);
    setSelectedServicioId("");
  };

  const handleServicioChange = (nuevoServicioId: string) => {
    setSelectedServicioId(nuevoServicioId);
    if (
      selectedBarberoId &&
      nuevoServicioId &&
      !relaciones.some((r) => r.servicioId === nuevoServicioId && r.barberoId === selectedBarberoId)
    ) {
      setSelectedBarberoId("");
    }
  };

  return {
    isOpen,
    setIsOpen,
    servicios,
    barberos,
    usuarios,
    selectedServicioId,
    setSelectedServicioId,
    selectedBarberoId,
    setSelectedBarberoId,
    selectedUserId,
    setSelectedUserId,
    serviciosFiltrados,
    barberosFiltrados,
    handleBarberoChange,
    handleServicioChange,
  };
}
