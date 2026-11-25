"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import ModalBase from "@/components/ui/ModalBase";
import { Skeleton } from "@/components/ui/skeleton";
import BadgeEstadoTurno from "@/components/turno/gestion/BadgeEstadoTurno";
import DatosReservaProveedor from "@/contextos/DatosReservaProveedor";
import { obtenerDatosModalTurno } from "@/actions/turnos/obtener-datos-modal-turno.actions";
import { precargarDisponibilidadInicial } from "@/lib/turnos/disponibilidad-cliente";
import type { DatosCatalogoTurno } from "@/types/turno";
import type { PropsModalGestionTurno } from "@/components/turno/reserva/tipos";

type ModuloModal = typeof import("@/components/turno/reserva/ModalGestionTurno");
type EstadoApertura =
  | { tipo: "cerrado" | "cargando" | "listo" }
  | { tipo: "error"; mensaje: string };

let promesaModulo: Promise<ModuloModal> | null = null;

const ESTILO_TEMAS = {
  "--primary": "var(--page-primary)",
  "--secondary": "var(--page-secondary)",
  "--primary-foreground": "var(--page-primary-foreground)",
  "--primary-tinta": "var(--page-primary-tinta)",
} as CSSProperties;

function cargarModuloModal() {
  if (!promesaModulo) {
    promesaModulo = import("@/components/turno/reserva/ModalGestionTurno").catch(
      (error: unknown) => {
        promesaModulo = null;
        throw error;
      },
    );
  }
  return promesaModulo;
}

function CargandoTurno() {
  return (
    <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
      <p role="status" className="mb-4 text-sm text-[var(--admin-texto-secundario)]">
        Cargando datos y horarios…
      </p>
      <div aria-hidden="true" className="grid gap-4 motion-reduce:[&_.animate-pulse]:animate-none lg:grid-cols-3">
        <Skeleton className="h-32 bg-[var(--admin-item)] lg:h-52" />
        <div className="grid gap-3">
          <Skeleton className="h-14 bg-[var(--admin-item)]" />
          <Skeleton className="h-14 bg-[var(--admin-item)]" />
          <Skeleton className="hidden h-14 bg-[var(--admin-item)] lg:block" />
        </div>
        <Skeleton className="hidden h-52 bg-[var(--admin-item)] lg:block" />
      </div>
    </div>
  );
}

export default function CargadorModalGestionTurno(props: PropsModalGestionTurno) {
  const [estado, setEstado] = useState<EstadoApertura>({ tipo: "cerrado" });
  const [contenido, setContenido] = useState<{ modulo: ModuloModal; datos: DatosCatalogoTurno } | null>(null);
  const solicitudRef = useRef<symbol | null>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const { turnoInicial, vistaAdministrativa = false, alRestaurarFoco, session } = props;
  const usuarioId = session?.user?.id;
  const esEdicion = Boolean(turnoInicial);
  const titulo = esEdicion ? "Gestionar turno" : vistaAdministrativa ? "Nuevo turno" : "Reservar turno";
  const dialogoId = useId();

  useEffect(() => () => { solicitudRef.current = null; }, []);

  const cerrar = useCallback(() => {
    solicitudRef.current = null;
    setEstado({ tipo: "cerrado" });
  }, []);

  const restaurarFoco = (evento: Event) => {
    if (document.activeElement?.closest("[role='dialog']")) {
      evento.preventDefault();
      return;
    }
    if (alRestaurarFoco || botonRef.current) {
      evento.preventDefault();
      if (alRestaurarFoco) alRestaurarFoco();
      else botonRef.current?.focus({ preventScroll: true });
    }
  };

  const cargar = async () => {
    if (solicitudRef.current) return;

    const solicitud = Symbol();
    solicitudRef.current = solicitud;
    setEstado({ tipo: "cargando" });
    try {
      const cargarDatos = async () => {
        const resultado = await obtenerDatosModalTurno(vistaAdministrativa);
        if (solicitudRef.current !== solicitud) return;
        if (!resultado.success || !resultado.data) {
          return { error: resultado.error ?? "No pudimos cargar los datos del turno." };
        }
        const datos = resultado.data;
        const exclusion = turnoInicial && usuarioId
          ? { barberoId: turnoInicial.barberoId, turnoId: turnoInicial.id, usuarioId }
          : undefined;
        const disponibles = await precargarDisponibilidadInicial(
          datos.barberos.map(({ id }) => id),
          turnoInicial?.horarioReservado,
          exclusion,
        );
        return disponibles ? { datos } : { error: "No pudimos cargar los horarios." };
      };

      const [modulo, resultado] = await Promise.all([cargarModuloModal(), cargarDatos()]);
      if (solicitudRef.current !== solicitud || !resultado) return;
      if (resultado.datos) {
        setContenido({ modulo, datos: resultado.datos });
        setEstado({ tipo: "listo" });
      } else {
        setEstado({ tipo: "error", mensaje: resultado.error });
      }
    } catch {
      if (solicitudRef.current === solicitud) {
        setEstado({ tipo: "error", mensaje: "No pudimos abrir el formulario del turno." });
      }
    } finally {
      if (solicitudRef.current === solicitud) solicitudRef.current = null;
    }
  };

  const abrir = () => {
    props.onTriggerClick?.();
    void cargar();
  };

  const renderizarDialogo = (formulario?: ReactNode) => {
    if (estado.tipo === "cerrado") return null;
    return createPortal(
      <div style={ESTILO_TEMAS}>
        <ModalBase
          id={dialogoId}
          apariencia={vistaAdministrativa ? undefined : "publica"}
          dialogoAccesible
          etiquetaDialogo={titulo}
          maxWidth="max-w-6xl"
          overlayClase="bg-black/50 backdrop-blur-[2px] p-2 sm:p-4"
          contenedorClase={`marco-reserva flex flex-col overflow-hidden${vistaAdministrativa ? " max-h-[92dvh]" : ""}`}
          onClose={cerrar}
          onCloseAutoFocus={restaurarFoco}
          header={
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--page-separador)] px-4 py-3 sm:px-6 sm:py-4">
              <div>
                <h2 className="text-xl font-semibold text-[var(--admin-texto-primario)]">{titulo}</h2>
                {turnoInicial && (
                  <div className="mt-2">
                    <BadgeEstadoTurno estado={turnoInicial.estado} vistaAdministrativa={vistaAdministrativa} />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={cerrar}
                aria-label="Cerrar"
                className="control-publico grid size-11 shrink-0 place-items-center rounded-md text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-item-hover)]"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
          }
        >
          {estado.tipo === "cargando" ? <CargandoTurno /> : estado.tipo === "error" ? (
            <div className="space-y-3 p-4 sm:p-6">
              <p role="alert" className="text-sm text-[var(--admin-texto-primario)]">{estado.mensaje}</p>
              <Button type="button" variant="outline" className="min-h-11" onClick={() => void cargar()}>Reintentar</Button>
            </div>
          ) : formulario}
        </ModalBase>
      </div>,
      document.body,
    );
  };

  const ContenidoModal = contenido?.modulo.default;
  const abierto = estado.tipo !== "cerrado";

  return (
    <>
      <div style={ESTILO_TEMAS}>
        {props.contenidoTrigger ? (
          <button
            ref={botonRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={abierto}
            aria-controls={abierto ? dialogoId : undefined}
            onClick={abrir}
            className={props.claseTrigger}
          >
            {props.contenidoTrigger}
          </button>
        ) : (
          <Button
            ref={botonRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={abierto}
            aria-controls={abierto ? dialogoId : undefined}
            className={vistaAdministrativa
              ? "flex items-center gap-2 px-6 py-3 font-medium text-[var(--primary-foreground)] shadow-lg transition-all hover:opacity-90"
              : "min-h-11 border border-[var(--admin-border-fuerte)] bg-[var(--page-primary)] px-5 font-semibold text-[var(--page-primary-foreground)] transition-colors hover:bg-[var(--page-primary-hover)] hover:brightness-100 focus-visible:ring-[var(--page-focus-ring)]"}
            style={vistaAdministrativa ? { backgroundColor: "var(--primary)" } : undefined}
            onClick={abrir}
          >
            {esEdicion ? <Pencil className="h-5 w-5" aria-hidden="true" /> : <Plus className="h-5 w-5" aria-hidden="true" />}
            {esEdicion ? "Editar turno" : "Nuevo turno"}
          </Button>
        )}
      </div>
      {contenido && ContenidoModal ? (
        <DatosReservaProveedor {...contenido.datos}>
          <ContenidoModal {...props} alCerrar={cerrar} alCerrarPago={restaurarFoco} renderizarDialogo={renderizarDialogo} />
        </DatosReservaProveedor>
      ) : renderizarDialogo()}
    </>
  );
}
