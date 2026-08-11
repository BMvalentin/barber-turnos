"use client";

import { useState } from "react";
import type { Session } from "next-auth";
import { useConfiguracionTurno } from "@/hooks/useConfiguracionTurno";
import type { BarberoData, RelacionData, ServicioData, UsuarioData } from "@/types/turno";

export type ParametrosDatosTurno = {
  session: Session | null;
  initialServicios?: ServicioData[];
  initialBarberos?: BarberoData[];
  initialUsuarios?: UsuarioData[];
  initialRelaciones?: RelacionData[];
};

export function useDatosFormularioTurno({
  session,
  initialServicios = [],
  initialBarberos = [],
  initialUsuarios = [],
  initialRelaciones = [],
}: ParametrosDatosTurno) {
  const [isOpen, setIsOpen] = useState(false);
  const tieneDatosIniciales = initialServicios.length > 0;
  const { datos, cargando } = useConfiguracionTurno(
    isOpen && !tieneDatosIniciales,
  );

  const servicios =
    datos.servicios.length > 0 ? datos.servicios : initialServicios;
  const barberos = datos.barberos.length > 0 ? datos.barberos : initialBarberos;
  const usuarios = datos.usuarios.length > 0 ? datos.usuarios : initialUsuarios;
  const relaciones =
    datos.relaciones.length > 0 ? datos.relaciones : initialRelaciones;
  const cargandoDatos = tieneDatosIniciales ? false : cargando;

  const [selectedServicioId, setSelectedServicioId] = useState("");
  const [selectedBarberoId, setSelectedBarberoId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(
    session?.user?.role === "USER" ? session?.user?.id ?? "" : "",
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
    setSelectedBarberoId(nuevoBarberoId);
    if (
      selectedServicioId &&
      nuevoBarberoId &&
      !relaciones.some((r) => r.barberoId === nuevoBarberoId && r.servicioId === selectedServicioId)
    ) {
      setSelectedServicioId("");
    }
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
    cargandoDatos,
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
