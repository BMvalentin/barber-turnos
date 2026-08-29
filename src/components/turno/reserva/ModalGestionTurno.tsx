"use client";

import { createPortal } from "react-dom";
import { useFormularioTurno } from "@/hooks/useFormularioTurno";
import type { PropsModalGestionTurno } from "@/components/turno/reserva/tipos";
import { Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import ModalBase from "@/components/ui/ModalBase";
import FormularioReservaTurno from "@/components/turno/reserva/FormularioReservaTurno";
import ModalPagoTurno from "@/components/turno/ModalPagoTurno";
import BadgeEstadoTurno from "@/components/turno/gestion/BadgeEstadoTurno";
import { CLASES_BOTON_CERRAR } from "@/lib/constants";

const ESTILO_TEMAS = {
  "--primary": "var(--page-primary)",
  "--secondary": "var(--page-secondary)",
  "--primary-foreground": "var(--page-primary-foreground)",
  "--primary-tinta": "var(--page-primary-tinta)",
} as React.CSSProperties;

export default function ModalGestionTurno({
  session,
  initialServicios = [],
  initialBarberos = [],
  initialUsuarios = [],
  initialRelaciones = [],
  whatsappPhone,
  turnoInicial,
  claseTrigger,
  contenidoTrigger,
  onTriggerClick,
}: PropsModalGestionTurno) {
  const {
    esEdicion,
    isOpen,
    setIsOpen,
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
    estadoPago,
    setEstadoPago,
    serviciosFiltrados,
    handleBarberoChange,
    handleServicioChange,
    turnoCreado,
    showPagoModal,
    cargandoPago,
    errorPago,
    handlePagarSenia,
    handlePagarDespues,
  } = useFormularioTurno({
    session,
    initialServicios,
    initialBarberos,
    initialUsuarios,
    initialRelaciones,
    whatsappPhone,
    turnoInicial,
  });

  const abrir = () => {
    onTriggerClick?.();
    setIsOpen(true);
  };

  return (
    <>
      <div style={ESTILO_TEMAS}>
        {contenidoTrigger ? (
          <button type="button" onClick={abrir} className={claseTrigger}>
            {contenidoTrigger}
          </button>
        ) : (
          <Button
            className="flex items-center gap-2 px-6 py-3 font-medium text-[var(--primary-foreground)] shadow-lg transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--primary)" }}
            onClick={abrir}
          >
            {esEdicion ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {esEdicion ? "Editar Turno" : "Nuevo Turno"}
          </Button>
        )}
      </div>

      {isOpen &&
        createPortal(
          <div style={ESTILO_TEMAS}>
            <ModalBase
              maxWidth="max-w-6xl"
              overlayClase="bg-black/80 backdrop-blur-md p-2 sm:p-4"
              contenedorClase="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl max-h-[92vh] overflow-hidden flex flex-col"
              onClose={() => setIsOpen(false)}
              header={
                <div className="flex items-center justify-between border-b border-[var(--admin-border)] p-5 sm:p-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--admin-texto-primario)]">
                      {esEdicion && turnoInicial
                        ? "Gestionar Turno"
                        : "Reservar turno"}
                    </h2>
                    {esEdicion && turnoInicial && (
                      <div className="mt-2">
                        <BadgeEstadoTurno estado={turnoInicial.estado} />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className={CLASES_BOTON_CERRAR}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              }
            >
              <FormularioReservaTurno
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
                serviciosFiltrados={serviciosFiltrados}
                handleBarberoChange={handleBarberoChange}
                handleServicioChange={handleServicioChange}
                onCancelar={() => setIsOpen(false)}
                turnoInicial={turnoInicial}
                estadoPago={estadoPago}
                setEstadoPago={setEstadoPago}
              />
            </ModalBase>

            {!esEdicion && showPagoModal && turnoCreado && (
              <ModalPagoTurno
                turnoCreado={turnoCreado}
                cargandoPago={cargandoPago}
                errorPago={errorPago}
                onPagarSenia={handlePagarSenia}
                onPagarDespues={handlePagarDespues}
              />
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
