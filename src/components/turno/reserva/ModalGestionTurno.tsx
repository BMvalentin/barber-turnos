"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import { useFormularioTurno } from "@/hooks/useFormularioTurno";
import type { PropsModalGestionTurno } from "@/components/turno/reserva/tipos";
import { Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import ModalBase from "@/components/ui/ModalBase";
import FormularioReservaTurno from "@/components/turno/reserva/FormularioReservaTurno";
import ModalPagoTurno from "@/components/turno/ModalPagoTurno";
import BadgeEstadoTurno from "@/components/turno/gestion/BadgeEstadoTurno";
import type { DatosTransferencia } from "@/types/pago";
import { cn } from "@/lib/utils/cn";

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

const CLASE_TRIGGER_PUBLICO = "min-h-11 border border-[var(--admin-border-fuerte)] bg-[var(--page-primary)] px-5 font-semibold text-[var(--page-primary-foreground)] transition-colors duration-150 hover:bg-[var(--page-primary-hover)] hover:brightness-100 focus-visible:ring-[var(--page-focus-ring)]";

export default function ModalGestionTurno({
  session,
  initialServicios,
  initialBarberos,
  initialUsuarios,
  initialRelaciones,
  whatsappPhone,
  datosTransferencia = DATOS_TRANSFERENCIA_VACIOS,
  mostrarAvisoSeniaPendiente = true,
  turnoInicial,
  claseTrigger,
  contenidoTrigger,
  onTriggerClick,
  onTurnoCreado,
  onTurnoActualizado,
  abrirAlMontar = false,
  vistaAdministrativa = false,
}: PropsModalGestionTurno) {
  const {
    esEdicion,
    puedeGestionarTurnos,
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
    initialServicios,
    initialBarberos,
    initialUsuarios,
    initialRelaciones,
    whatsappPhone,
    datosTransferencia,
    turnoInicial,
    onTurnoCreado,
    onTurnoActualizado,
    vistaAdministrativa,
  });

  const aperturaInicialProcesadaRef = useRef(false);
  const botonAbrirRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!abrirAlMontar || aperturaInicialProcesadaRef.current) return;
    aperturaInicialProcesadaRef.current = true;
    setIsOpen(true);
  }, [abrirAlMontar, setIsOpen]);

  const abrir = () => {
    onTriggerClick?.();
    setIsOpen(true);
  };
  const restaurarFoco = (evento: Event) => {
    if (document.activeElement?.closest("[role='dialog']")) {
      evento.preventDefault();
    } else if (botonAbrirRef.current) {
      evento.preventDefault();
      botonAbrirRef.current.focus({ preventScroll: true });
    }
  };
  const titulo = esEdicion ? "Gestionar turno" : vistaAdministrativa ? "Nuevo turno" : "Reservar turno";

  return (
    <>
      <div style={ESTILO_TEMAS}>
        {contenidoTrigger ? (
          <button ref={botonAbrirRef} type="button" aria-haspopup="dialog" onClick={abrir} className={claseTrigger}>
            {contenidoTrigger}
          </button>
        ) : (
          <Button
            ref={botonAbrirRef}
            aria-haspopup="dialog"
            className={vistaAdministrativa ? "flex items-center gap-2 px-6 py-3 font-medium text-[var(--primary-foreground)] shadow-lg transition-all hover:opacity-90" : CLASE_TRIGGER_PUBLICO}
            style={vistaAdministrativa ? { backgroundColor: "var(--primary)" } : undefined}
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
              apariencia={vistaAdministrativa ? undefined : "publica"}
              etiquetaDialogo={titulo}
              maxWidth="max-w-6xl"
              overlayClase="bg-black/50 backdrop-blur-[2px] p-2 sm:p-4"
              contenedorClase={cn(
                "marco-reserva flex flex-col overflow-hidden",
                vistaAdministrativa && "max-h-[92dvh]",
              )}
              onClose={() => setIsOpen(false)}
              onCloseAutoFocus={restaurarFoco}
              header={
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--page-separador)] px-4 py-3 sm:px-6 sm:py-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--admin-texto-primario)]">
                      {titulo}
                    </h2>
                    {esEdicion && turnoInicial && (
                      <div className="mt-2">
                        <BadgeEstadoTurno estado={turnoInicial.estado} vistaAdministrativa={vistaAdministrativa} />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Cerrar"
                    className="control-publico grid size-11 shrink-0 place-items-center rounded-md text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)]"
                  >
                    <X className="size-5" aria-hidden="true" />
                  </button>
                </div>
              }
            >
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
                onCancelar={() => setIsOpen(false)}
                turnoInicial={esEdicion ? turnoInicial : undefined}
                estadoPago={estadoPago}
                setEstadoPago={setEstadoPago}
                estadoTurno={estadoTurno}
                setEstadoTurno={setEstadoTurno}
              />
            </ModalBase>
          </div>,
          document.body,
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
              onCloseAutoFocus={restaurarFoco}
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
