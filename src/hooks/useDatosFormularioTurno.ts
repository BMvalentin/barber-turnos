"use client";

import { useState } from "react";
import type { Session } from "next-auth";
import { ESTADOS_PAGO, ESTADOS_TURNO } from "@/lib/constants";
import { useDatosReserva } from "@/hooks/useDatosReserva";
import type {
  TurnoListado,
} from "@/types/turno";

export type ParametrosDatosTurno = {
  session: Session | null;
  /* Turno a editar: si viene, el formulario arranca precargado. */
  turnoInicial?: TurnoListado | null;
};

export function useDatosFormularioTurno({
  session,
  turnoInicial,
  puedeGestionarTurnos,
}: ParametrosDatosTurno & { puedeGestionarTurnos: boolean }) {
  const { servicios, barberos, usuarios, relaciones } = useDatosReserva();

  const [selectedServicioId, setSelectedServicioId] = useState(
    turnoInicial?.servicio?.id || "",
  );
  const [selectedBarberoId, setSelectedBarberoId] = useState(
    turnoInicial?.barbero?.id || "",
  );
  const [selectedUserId, setSelectedUserId] = useState(
    turnoInicial?.user?.id ||
      (!puedeGestionarTurnos ? session?.user?.id ?? "" : ""),
  );
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteApellido, setClienteApellido] = useState("");
  const [estadoPago, setEstadoPago] = useState<(typeof ESTADOS_PAGO)[number]>(
    turnoInicial?.estadoPago ?? ESTADOS_PAGO[0],
  );
  const [estadoTurno, setEstadoTurno] = useState<(typeof ESTADOS_TURNO)[number]>(
    turnoInicial?.estado ?? ESTADOS_TURNO[0],
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
    servicios,
    barberos,
    usuarios,
    selectedServicioId,
    setSelectedServicioId,
    selectedBarberoId,
    setSelectedBarberoId,
    selectedUserId,
    setSelectedUserId,
    clienteNombre,
    setClienteNombre,
    clienteApellido,
    setClienteApellido,
    estadoPago,
    setEstadoPago,
    estadoTurno,
    setEstadoTurno,
    serviciosFiltrados,
    barberosFiltrados,
    handleBarberoChange,
    handleServicioChange,
  };
}
