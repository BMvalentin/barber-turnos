"use client";

import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import ModalPagoTurno from "@/components/turno/ModalPagoTurno";
import { usePagoTurno } from "@/hooks/usePagoTurno";
import { ESTADOS_PAGO_REINTENTABLES, ESTADOS_TURNO } from "@/lib/constants";
import type { DatosTransferencia } from "@/types/pago";
import type { TurnoCreado, TurnoListado } from "@/types/turno";

type Props = {
  turno: TurnoListado;
  whatsappPhone: string;
  datosTransferencia: DatosTransferencia;
};

const ESTILO_TEMAS = {
  "--primary": "var(--page-primary)",
  "--secondary": "var(--page-secondary)",
  "--primary-foreground": "var(--page-primary-foreground)",
  "--primary-tinta": "var(--page-primary-tinta)",
} as CSSProperties;

function puedeCompletarPago(turno: TurnoListado): boolean {
  return turno.estado === ESTADOS_TURNO[0] &&
    (ESTADOS_PAGO_REINTENTABLES as readonly string[]).includes(turno.estadoPago);
}

export default function PagoPendienteTurno({
  turno,
  whatsappPhone,
  datosTransferencia,
}: Props) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const turnoCreado: TurnoCreado = {
    id: turno.id,
    precioCongelado: turno.precioCongelado,
    seniaCongelada: turno.seniaCongelada,
    horarioReservado: turno.horarioReservado,
    estado: turno.estado,
    estadoPago: turno.estadoPago,
    tipoPago: turno.tipoPago,
    servicioNombre: turno.servicio?.nombre,
    barberoNombre: turno.barbero?.nombre,
  };
  const pago = usePagoTurno({
    whatsappPhone,
    turnoInicial: turnoCreado,
  });

  if (!puedeCompletarPago(turno)) return null;

  const cerrar = () => {
    pago.setTransferenciaLista(false);
    setAbierto(false);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="flex items-center gap-1.5 rounded-lg bg-[var(--page-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--page-primary-foreground)] transition-colors hover:bg-[var(--page-primary-hover)]"
      >
        <CreditCard className="h-3.5 w-3.5" />
        Completar pago
      </button>

      {abierto && (
        <div style={ESTILO_TEMAS}>
          <ModalPagoTurno
            turnoCreado={turnoCreado}
            cargandoPago={pago.cargandoPago}
            errorPago={pago.errorPago}
            transferenciaLista={pago.transferenciaLista}
            datosTransferencia={datosTransferencia}
            whatsappPhone={whatsappPhone}
            onPagar={pago.handlePagar}
            onVolverTransferencia={() => pago.setTransferenciaLista(false)}
            onClose={cerrar}
          />
        </div>
      )}
    </>
  );
}
