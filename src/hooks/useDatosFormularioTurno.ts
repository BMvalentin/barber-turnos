"use client";

import { useEffect, useState } from "react";
import type { Session } from "next-auth";
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
  const [servicios, setServicios] = useState<ServicioData[]>(initialServicios);
  const [barberos, setBarberos] = useState<BarberoData[]>(initialBarberos);
  const [usuarios, setUsuarios] = useState<UsuarioData[]>(initialUsuarios);
  const [relaciones, setRelaciones] = useState<RelacionData[]>(initialRelaciones);
  const [cargandoDatos, setCargandoDatos] = useState(!initialServicios.length);

  const [selectedServicioId, setSelectedServicioId] = useState("");
  const [selectedBarberoId, setSelectedBarberoId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(
    session?.user?.role === "USER" ? session?.user?.id ?? "" : "",
  );

  useEffect(() => {
    if (initialServicios.length > 0) {
      setCargandoDatos(false);
      return;
    }

    let isMounted = true;

    async function cargarDatos() {
      try {
        const res = await fetch("/api/configuracion-turno");
        const data = await res.json();

        if (isMounted) {
          setServicios(data.servicios || []);
          setBarberos(data.barberos || []);
          setUsuarios(data.usuarios || []);
          setRelaciones(data.relaciones || []);
          setCargandoDatos(false);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        setCargandoDatos(false);
      }
    }

    if (isOpen) {
      cargarDatos();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialServicios.length]);

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
