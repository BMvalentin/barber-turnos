"use client";

import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { useFormularioTurno } from "@/hooks/useFormularioTurno";
import type { PropsModalGestionTurno } from "@/components/turno/reserva/tipos";
import FormularioReservaTurno from "@/components/turno/reserva/FormularioReservaTurno";
import ModalPagoTurno from "@/components/turno/ModalPagoTurno";
import type { DatosTransferencia } from "@/types/pago";

const DATOS_TRANSFERENCIA_VACIOS: DatosTransferencia = {
  transferenciaTitular: "",
  transferenciaCuit: "",
  transferenciaAlias: "",
  transferenciaCbu: "",
  transferenciaBanco: "",
  transferenciaActiva: false,
};

const ESTILO_TEMAS = {
  "--primary": "var(--page-primary)",
  "--secondary": "var(--page-secondary)",
  "--primary-foreground": "var(--page-primary-foreground)",
  "--primary-tinta": "var(--page-primary-tinta)",
} as React.CSSProperties;

type Propiedades = PropsModalGestionTurno & {
  alCerrar: () => void;
  alCerrarPago: (evento: Event) => void;
  renderizarDialogo: (formulario: ReactNode) => ReactNode;
};

export default function ModalGestionTurno({
  session,
  whatsappPhone,
  datosTransferencia = DATOS_TRANSFERENCIA_VACIOS,
  mostrarAvisoSeniaPendiente = true,
  turnoInicial,
  onTurnoCreado,
  onTurnoActualizado,
  vistaAdministrativa = false,
  alCerrar,
  alCerrarPago,
  renderizarDialogo,
}: Propiedades) {
  const {
    esEdicion,
    puedeGestionarTurnos,
    formRef,
    state,
    formAction,
    sessionId,
    servicios,
    barberos,
    usuarios,
    selectedServicioId,
    selectedBarberoId,
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
    handleBarberoChange,
    handleServicioChange,
    turnoCreado,
    showPagoModal,
    cargandoPago,
    errorPago,
    transferenciaLista,
    setTransferenciaLista,
    setShowPagoModal,
    handlePagar,
  } = useFormularioTurno({
    session,
    alCerrar,
    whatsappPhone,
    datosTransferencia,
    turnoInicial,
    onTurnoCreado,
    onTurnoActualizado,
    vistaAdministrativa,
  });

  return (
    <>
      {renderizarDialogo(
        <FormularioReservaTurno
          vistaAdministrativa={vistaAdministrativa}
          puedeGestionarTurnos={puedeGestionarTurnos}
          session={session}
          formRef={formRef}
          state={state}
          formAction={formAction}
          sessionId={sessionId}
          servicios={servicios}
          barberos={barberos}
          usuarios={usuarios}
          selectedServicioId={selectedServicioId}
          selectedBarberoId={selectedBarberoId}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          clienteNombre={clienteNombre}
          setClienteNombre={setClienteNombre}
          clienteApellido={clienteApellido}
          setClienteApellido={setClienteApellido}
          serviciosFiltrados={serviciosFiltrados}
          handleBarberoChange={handleBarberoChange}
          handleServicioChange={handleServicioChange}
          onCancelar={alCerrar}
          turnoInicial={esEdicion ? turnoInicial : undefined}
          estadoPago={estadoPago}
          setEstadoPago={setEstadoPago}
          estadoTurno={estadoTurno}
          setEstadoTurno={setEstadoTurno}
        />,
      )}

      {!esEdicion && showPagoModal && turnoCreado &&
        createPortal(
          <div style={ESTILO_TEMAS}>
            <ModalPagoTurno
              vistaAdministrativa={vistaAdministrativa}
              turnoCreado={turnoCreado}
              cargandoPago={cargandoPago}
              errorPago={errorPago}
              transferenciaLista={transferenciaLista}
              datosTransferencia={datosTransferencia}
              mostrarAvisoSeniaPendiente={mostrarAvisoSeniaPendiente}
              whatsappPhone={whatsappPhone}
              onPagar={handlePagar}
              onVolverTransferencia={() => setTransferenciaLista(false)}
              onCloseAutoFocus={alCerrarPago}
              onClose={() => {
                setTransferenciaLista(false);
                setShowPagoModal(false);
              }}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
