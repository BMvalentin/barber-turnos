"use client";

import { useCrearTurno } from "@/hooks/useCrearTurno";
import type { ParametrosCrearTurno } from "@/hooks/useCrearTurno";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import ModalBase from "@/components/ui/ModalBase";
import FormularioTurno from "./FormularioTurno";
import ModalPagoTurno from "./ModalPagoTurno";

type Props = ParametrosCrearTurno;

export default function CreateTurnoModal({
  session,
  initialServicios = [],
  initialBarberos = [],
  initialUsuarios = [],
  initialRelaciones = [],
  whatsappPhone,
}: Props) {
  const {
    isOpen,
    setIsOpen,
    formRef,
    state,
    formAction,
    sessionId,
    servicios,
    usuarios,
    cargandoDatos,
    selectedServicioId,
    selectedBarberoId,
    selectedUserId,
    setSelectedUserId,
    serviciosFiltrados,
    barberosFiltrados,
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
      {/* Botón para abrir modal */}
      <Button
        className="flex items-center gap-2 px-6 py-3 text-[var(--primary-foreground)] font-medium shadow-lg transition-all hover:opacity-90"
        style={{ backgroundColor: "var(--primary)" }}
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-5 w-5" />
        Nuevo Turno
      </Button>

      {/* MODAL CREAR TURNO */}
      {isOpen && (
        <ModalBase
          maxWidth="max-w-4xl"
          overlayClase="bg-black/80 backdrop-blur-md p-4"
          contenedorClase="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-h-[92vh] overflow-y-auto"
          header={
            /* Header sticky con botón X propio */
            <div className="sticky top-0 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white tracking-wide">Nuevo Turno</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 p-2 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          }
        >
          {/* Content */}
          {cargandoDatos ? (
            <div className="p-12 text-center">
              <div
                className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto"
                style={{ borderColor: "var(--primary)" }}
              ></div>
              <p className="text-zinc-400 mt-4 text-sm">Cargando opciones disponibles...</p>
            </div>
          ) : (
            <FormularioTurno
              session={session}
              formRef={formRef}
              state={state}
              formAction={formAction}
              sessionId={sessionId}
              servicios={servicios}
              usuarios={usuarios}
              selectedServicioId={selectedServicioId}
              selectedBarberoId={selectedBarberoId}
              selectedUserId={selectedUserId}
              setSelectedUserId={setSelectedUserId}
              serviciosFiltrados={serviciosFiltrados}
              barberosFiltrados={barberosFiltrados}
              handleBarberoChange={handleBarberoChange}
              handleServicioChange={handleServicioChange}
              onCancelar={() => setIsOpen(false)}
            />
          )}
        </ModalBase>
      )}

      {/* MODAL DE PAGO (SEÑA) */}
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