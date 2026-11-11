"use client";

import { useState } from "react";
import { toast } from "sonner";
import { actualizarEstadoPagoTurno } from "@/actions/turnos/estado.actions";
import SelectorDesplegable from "@/components/ui/SelectorDesplegable";
import type { OpcionDesplegable } from "@/components/ui/SelectorDesplegable";
import BadgeEstadoPago from "./BadgeEstadoPago";
import { ESTADOS_PAGO, ESTADOS_PAGO_MANUALES, ESTADOS_TURNO } from "@/lib/constants";
import type { ParcheTurnoCache } from "@/lib/admin/turnos-cache-local";
import type { TurnoListado } from "@/types/turno";

type EstadoPago = TurnoListado["estadoPago"];

const ETIQUETAS: Record<EstadoPago, string> = {
  PENDIENTE: "Pendiente",
  SEÑADO: "Señado",
  PAGADO: "Pagado",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
  CANCELADO: "Cancelado",
  EN_ACREDITACION: "En acreditación",
};

interface Props {
  turno: TurnoListado;
  onTurnoActualizado?: (id: string, parche: ParcheTurnoCache) => void;
}

export default function SelectorEstadoPagoTurno({ turno, onTurnoActualizado }: Props) {
  const [cargando, setCargando] = useState(false);
  const bloqueado = turno.estadoPago === ESTADOS_PAGO[2] || turno.estado === ESTADOS_TURNO[3];
  const esEstadoManual = ESTADOS_PAGO_MANUALES.some((estado) => estado === turno.estadoPago);
  const opciones: OpcionDesplegable<EstadoPago>[] = [
    ...(!esEstadoManual
      ? [{ valor: turno.estadoPago, etiqueta: `Pago: ${ETIQUETAS[turno.estadoPago]}`, deshabilitado: true }]
      : []),
    ...ESTADOS_PAGO_MANUALES
      .filter((estado) => !(turno.estadoPago === ESTADOS_PAGO[1] && estado === ESTADOS_PAGO[0]))
      .map((estado) => ({ valor: estado, etiqueta: `Pago: ${ETIQUETAS[estado]}` })),
  ];

  const cambiarEstado = async (nuevoEstado: EstadoPago) => {
    if (
      nuevoEstado === turno.estadoPago || cargando || bloqueado ||
      (turno.estadoPago === ESTADOS_PAGO[1] && nuevoEstado === ESTADOS_PAGO[0])
    ) return;
    setCargando(true);
    try {
      const resultado = await actualizarEstadoPagoTurno(turno.id, nuevoEstado, turno.estadoPago);
      if (resultado.data) {
        onTurnoActualizado?.(turno.id, resultado.data);
      }
      if (resultado.success) {
        toast.success("Estado del pago actualizado");
      } else {
        toast.error(resultado.error ?? "No se pudo actualizar el estado del pago");
      }
    } catch {
      toast.error("No se pudo actualizar el estado del pago");
    } finally {
      setCargando(false);
    }
  };

  if (bloqueado) return <BadgeEstadoPago estado={turno.estadoPago} />;

  return (
    <SelectorDesplegable
      opciones={opciones}
      valor={turno.estadoPago}
      onChange={(valor) => void cambiarEstado(valor)}
      etiquetaAria="Estado del pago"
      deshabilitado={cargando}
      cargando={cargando}
      className="w-44"
      claseBoton="h-8 rounded-full px-2.5 text-xs"
    />
  );
}
