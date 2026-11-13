"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/sesion/perfil.actions";
import { getUserTurnos, getUserTurnosProximos } from "@/actions/sesion/listar-turnos-usuario.actions";
import { obtenerDatosPagoPanel } from "@/actions/sesion/datos-panel-usuario.actions";
import EncabezadoPanelUsuario from "@/components/dashboard/EncabezadoPanelUsuario";
import FormularioPerfilUsuario from "@/components/dashboard/FormularioPerfilUsuario";
import ModalTelefonoObligatorio from "@/components/dashboard/ModalTelefonoObligatorio";
import PanelTurnosUsuario from "@/components/dashboard/PanelTurnosUsuario";
import { Skeleton } from "@/components/ui/skeleton";
import {
  guardarTurnosUsuarioCacheLocal,
  leerTurnosUsuarioCacheLocal,
} from "@/components/dashboard/turnos-usuario-cache-local";
import type { DatosUsuarioPanel, PestanaPanel, PropiedadesPanelUsuario } from "@/components/dashboard/tipos-panel-usuario";
import type { DatosTurnosUsuarioCache } from "@/components/dashboard/turnos-usuario-cache-local";
import type { TurnoListado } from "@/types/turno";
import type { DatosTransferencia } from "@/types/pago";

type PaginaTurnos = {
  turnos: TurnoListado[];
  paginaActual: number;
  totalPaginas: number;
};

type DatosTurnosPanel = {
  pagina: PaginaTurnos;
  proximos: TurnoListado[];
  whatsappPhone: string;
  datosTransferencia: DatosTransferencia;
  mostrarAvisoSeniaPendiente: boolean;
};

function CargadorTurnosUsuario() {
  return (
    <div
      className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 shadow-2xl md:p-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Cargando tus turnos...</span>
      <div aria-hidden="true">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-border)] pb-4">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32 rounded-lg bg-[var(--admin-border)]" />
            <Skeleton className="h-9 w-24 rounded-lg bg-[var(--admin-border)]" />
          </div>
          <Skeleton className="h-9 w-36 rounded-lg bg-[var(--admin-border)]" />
        </div>

        <div className="mb-4 space-y-2">
          <Skeleton className="h-6 w-48 bg-[var(--admin-border)]" />
          <Skeleton className="h-4 w-64 max-w-full bg-[var(--admin-border)]" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(250px,2fr)_minmax(0,3fr)]">
          <div className="rounded-xl border border-[var(--admin-border)] p-4">
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-5 w-32 bg-[var(--admin-border)]" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-lg bg-[var(--admin-border)]" />
                <Skeleton className="h-8 w-8 rounded-lg bg-[var(--admin-border)]" />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, indice) => (
                <Skeleton key={indice} className="aspect-square rounded-lg bg-[var(--admin-border)]" />
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-xl bg-[var(--admin-item)] p-2.5">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-2/3 bg-[var(--admin-border)]" />
                <Skeleton className="h-5 w-16 rounded-full bg-[var(--admin-border)]" />
              </div>
              <Skeleton className="mt-3 h-3 w-1/2 bg-[var(--admin-border)]" />
              <Skeleton className="mt-2 h-3 w-2/3 bg-[var(--admin-border)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPanel({
  user,
  session,
  initialTab = "perfil",
  initialServicios,
  initialBarberos,
  initialRelaciones,
}: PropiedadesPanelUsuario) {
  const { update } = useSession();
  const [guardando, iniciarTransicion] = useTransition();
  const [pestana, setPestana] = useState<PestanaPanel>(initialTab);
  const [usuario, setUsuario] = useState<DatosUsuarioPanel>(user);
  const [datosTurnos, setDatosTurnos] = useState<DatosTurnosPanel | null>(null);
  const [errorTurnos, setErrorTurnos] = useState(false);
  const cargaTurnosEnCurso = useRef(false);
  const [tieneTelefono, setTieneTelefono] = useState(Boolean(usuario.telefono));
  const coincidencia = usuario.telefono?.match(/^(\+\d{1,3}(?:\s\d)?)\s?(.*)$/);
  const prefijoInicial = coincidencia?.[1].trim() || "+54 9";
  const telefonoInicial = coincidencia?.[2].trim() || usuario.telefono || "";

  const cargarTurnos = useCallback(async () => {
    if (cargaTurnosEnCurso.current || datosTurnos) return;
    cargaTurnosEnCurso.current = true;
    setDatosTurnos(null);
    setErrorTurnos(false);
    try {
      const cache = leerTurnosUsuarioCacheLocal(usuario.id);
      if (cache) {
        const resultadoPago = await obtenerDatosPagoPanel();
        if (resultadoPago.success && resultadoPago.data) {
          setDatosTurnos({
            pagina: cache.historial,
            proximos: cache.proximos,
            whatsappPhone: resultadoPago.data.whatsappPhone,
            datosTransferencia: resultadoPago.data.datosTransferencia,
            mostrarAvisoSeniaPendiente: resultadoPago.data.mostrarAvisoSeniaPendiente,
          });
        } else {
          setErrorTurnos(true);
        }
        return;
      }

      const [resultadoTurnos, resultadoProximos, resultadoPago] = await Promise.all([
        getUserTurnos(usuario.id),
        getUserTurnosProximos(usuario.id),
        obtenerDatosPagoPanel(),
      ]);
      if (resultadoTurnos.success && resultadoTurnos.data && resultadoProximos.success && resultadoProximos.data && resultadoPago.success && resultadoPago.data) {
        const datosCache: DatosTurnosUsuarioCache = {
          historial: resultadoTurnos.data,
          proximos: resultadoProximos.data,
        };
        guardarTurnosUsuarioCacheLocal(usuario.id, datosCache);
        setDatosTurnos({
          pagina: datosCache.historial,
          proximos: datosCache.proximos,
          whatsappPhone: resultadoPago.data.whatsappPhone,
          datosTransferencia: resultadoPago.data.datosTransferencia,
          mostrarAvisoSeniaPendiente: resultadoPago.data.mostrarAvisoSeniaPendiente,
        });
      } else {
        setErrorTurnos(true);
      }
    } catch {
      setErrorTurnos(true);
    } finally {
      cargaTurnosEnCurso.current = false;
    }
  }, [datosTurnos, usuario.id]);

  useEffect(() => {
    setPestana(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (pestana === "turnos") void cargarTurnos();
  }, [cargarTurnos, pestana]);

  const cambiarPestana = (siguiente: PestanaPanel) => {
    setPestana(siguiente);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", siguiente);
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const guardarPerfil = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const prefijo = datos.get("prefix");
    const telefono = datos.get("telefono");
    if (typeof prefijo === "string" && typeof telefono === "string" && prefijo && telefono) {
      datos.set("telefono", `${prefijo} ${telefono}`);
    }
    iniciarTransicion(async () => {
      const resultado = await updateProfile(usuario.id, datos);
      if (!resultado.success) {
        toast.error("Error", { description: resultado.error || "Error al actualizar" });
        return;
      }
      toast.success("Perfil actualizado", { description: "Perfil actualizado correctamente." });
      if (resultado.data) {
        await update({ name: resultado.data.name, telefono: resultado.data.telefono });
        setUsuario((actual) => ({ ...actual, ...resultado.data }));
        if (resultado.data.telefono) setTieneTelefono(true);
      }
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[var(--admin-background)] font-sans text-[var(--admin-texto-primario)]">
      {!tieneTelefono && (
        <ModalTelefonoObligatorio usuario={usuario} prefijoInicial={prefijoInicial} telefonoInicial={telefonoInicial} guardando={guardando} alGuardar={guardarPerfil} />
      )}
      <main className="mx-auto w-full max-w-5xl flex-grow px-4 pb-12 pt-24 md:px-8">
        <EncabezadoPanelUsuario nombre={usuario.name} pestana={pestana} alCambiar={cambiarPestana} />
        <AnimatePresence mode="wait">
          <motion.div key={pestana} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
            {pestana === "perfil" ? (
              <FormularioPerfilUsuario usuario={usuario} prefijoInicial={prefijoInicial} telefonoInicial={telefonoInicial} guardando={guardando} alGuardar={guardarPerfil} />
            ) : (
              datosTurnos ? (
                <PanelTurnosUsuario
                  turnosProximosIniciales={datosTurnos.proximos}
                  turnosHistorialIniciales={datosTurnos.pagina.turnos}
                  paginaInicial={datosTurnos.pagina.paginaActual}
                  totalPaginasInicial={datosTurnos.pagina.totalPaginas}
                  session={session}
                  initialServicios={initialServicios}
                  initialBarberos={initialBarberos}
                  initialRelaciones={initialRelaciones}
                  whatsappPhone={datosTurnos.whatsappPhone}
                  datosTransferencia={datosTurnos.datosTransferencia}
                  mostrarAvisoSeniaPendiente={datosTurnos.mostrarAvisoSeniaPendiente}
                />
              ) : (
                errorTurnos ? (
                  <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-8 text-center" role="alert">
                    <p className="text-[var(--admin-texto-secundario)]">No se pudieron cargar tus turnos.</p>
                    <button type="button" onClick={() => void cargarTurnos()} className="mt-4 font-semibold text-[var(--page-primary-tinta)] hover:underline">Reintentar</button>
                  </div>
                ) : (
                  <CargadorTurnosUsuario />
                )
              )
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
