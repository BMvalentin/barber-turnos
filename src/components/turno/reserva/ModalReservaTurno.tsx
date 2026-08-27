"use client";

import { useCrearTurno } from "@/hooks/useCrearTurno";
import type { PropsModalReservaTurno } from "@/components/turno/reserva/tipos";
import { AlertCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import ModalBase from "@/components/ui/ModalBase";
import FormularioReservaTurno from "@/components/turno/reserva/FormularioReservaTurno";
import ModalPagoTurno from "@/components/turno/ModalPagoTurno";
import { CLASES_BOTON_CERRAR } from "@/lib/constants";

export default function ModalReservaTurno({
  session,
  initialServicios = [],
  initialBarberos = [],
  initialUsuarios = [],
  initialRelaciones = [],
  whatsappPhone,
}: PropsModalReservaTurno) {
  const {
    isOpen,
    setIsOpen,
    formRef,
    state,
    formAction,
    sessionId,
    servicios,
    barberos,
    usuarios,
    cargandoDatos,
    error,
    recargar,
    selectedServicioId,
    selectedBarberoId,
    selectedUserId,
    setSelectedUserId,
    serviciosFiltrados,
    handleBarberoChange,
    handleServicioChange,
    turnoCreado,
    showPagoModal,
    cargandoPago,
    errorPago,
    handlePagarSenia,
    handlePagarDespues,
  } = useCrearTurno({
    session,
    initialServicios,
    initialBarberos,
    initialUsuarios,
    initialRelaciones,
    whatsappPhone,
  });

  return (
    <div
      style={{
        "--primary": "var(--page-primary)",
        "--secondary": "var(--page-secondary)",
        "--primary-foreground": "var(--page-primary-foreground)",
        "--primary-tinta": "var(--page-primary-tinta)",
      } as React.CSSProperties}
    >
      <Button
        className="flex items-center gap-2 px-6 py-3 font-medium text-[var(--primary-foreground)] shadow-lg transition-all hover:opacity-90"
        style={{ backgroundColor: "var(--primary)" }}
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-5 w-5" />
        Nuevo Turno
      </Button>

      {isOpen && (
        <ModalBase
          maxWidth="max-w-6xl"
          overlayClase="bg-black/80 backdrop-blur-md p-2 sm:p-4"
          contenedorClase="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl max-h-[92vh] overflow-hidden flex flex-col"
          onClose={() => setIsOpen(false)}
          header={
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] p-5 sm:p-6">
              <h2 className="text-2xl font-bold text-[var(--admin-texto-primario)]">
                Reservar turno
              </h2>
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
          {cargandoDatos ? (
            <div className="flex flex-col items-center gap-4 p-12 text-center">
              <div
                className="h-10 w-10 animate-spin rounded-full border-b-2"
                style={{ borderColor: "var(--primary)" }}
              />
              <p className="text-sm text-[var(--admin-texto-secundario)]">
                Cargando opciones disponibles...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 p-12 text-center">
              <AlertCircle className="h-10 w-10 text-[#ef4444]" />
              <p className="text-sm text-[var(--admin-texto-secundario)]">{error}</p>
              <button
                type="button"
                onClick={() => void recargar()}
                className="rounded-lg border border-[var(--page-primary)]/30 px-5 py-2.5 text-sm font-medium text-[var(--page-primary-tinta)] transition-colors hover:bg-[var(--page-primary-15)]"
              >
                Reintentar
              </button>
            </div>
          ) : (
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
            />
          )}
        </ModalBase>
      )}

      {showPagoModal && turnoCreado && (
        <ModalPagoTurno
          turnoCreado={turnoCreado}
          cargandoPago={cargandoPago}
          errorPago={errorPago}
          onPagarSenia={handlePagarSenia}
          onPagarDespues={handlePagarDespues}
        />
      )}
    </div>
  );
}
