"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/sesion/perfil.actions";
import { getResumenTurnosUsuario } from "@/actions/sesion/listar-turnos-usuario.actions";
import EncabezadoPanelUsuario from "@/components/dashboard/EncabezadoPanelUsuario";
import FormularioPerfilUsuario from "@/components/dashboard/FormularioPerfilUsuario";
import ModalTelefonoObligatorio from "@/components/dashboard/ModalTelefonoObligatorio";
import PanelTurnosUsuario from "@/components/dashboard/PanelTurnosUsuario";
import AvisosDeTurnos from "@/components/notificaciones/AvisosDeTurnos";
import { Skeleton } from "@/components/ui/skeleton";
import { precargarDisponibilidadInicial } from "@/lib/turnos/disponibilidad-cliente";
import {
  guardarTurnosUsuarioCacheLocal,
  leerTurnosUsuarioCacheLocal,
} from "@/components/dashboard/turnos-usuario-cache-local";
import type { DatosUsuarioPanel, PestanaPanel, PropiedadesPanelUsuario } from "@/components/dashboard/tipos-panel-usuario";
import type { DatosTurnosUsuarioCache } from "@/components/dashboard/turnos-usuario-cache-local";

function CargadorTurnosUsuario() {
  return (
    <div
      className="rounded-xl bg-[var(--admin-surface)] p-4 md:p-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Cargando tus turnos...</span>
      <div aria-hidden="true" className="motion-reduce:[&_.animate-pulse]:animate-none">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--page-separador)] pb-4">
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
          <div className="rounded-xl bg-[var(--admin-item)] p-4">
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
  actualizarTurnosAlEntrar = false,
  initialServicios,
  initialBarberos,
  initialRelaciones,
  clavePublicaPush,
  datosPago,
}: PropiedadesPanelUsuario) {
  const { update } = useSession();
  const [guardando, iniciarTransicion] = useTransition();
  const [pestana, setPestana] = useState<PestanaPanel>(initialTab);
  const [usuario, setUsuario] = useState<DatosUsuarioPanel>(user);
  const [datosTurnos, setDatosTurnos] = useState<DatosTurnosUsuarioCache | null>(null);
  const [errorTurnos, setErrorTurnos] = useState(false);
  const cargaTurnosEnCurso = useRef(false);
  const actualizarAlEntrarPendiente = useRef(actualizarTurnosAlEntrar);
  const [tieneTelefono, setTieneTelefono] = useState(Boolean(usuario.telefono));
  const coincidencia = usuario.telefono?.match(/^(\+\d{1,3}(?:\s\d)?)\s?(.*)$/);
  const prefijoInicial = coincidencia?.[1].trim() || "+54 9";
  const telefonoInicial = coincidencia?.[2].trim() || usuario.telefono || "";

  const cargarTurnos = useCallback(async () => {
    if (cargaTurnosEnCurso.current) return;
    cargaTurnosEnCurso.current = true;
    setErrorTurnos(false);
    try {
      const actualizar = actualizarAlEntrarPendiente.current;
      const cache = actualizar ? null : leerTurnosUsuarioCacheLocal(usuario.id);
      if (cache) {
        setDatosTurnos(cache);
        return;
      }

      const resultado = await getResumenTurnosUsuario(usuario.id);
      if (resultado.success && resultado.data) {
        const datosActualizados = actualizar ? null : leerTurnosUsuarioCacheLocal(usuario.id);
        if (!datosActualizados) guardarTurnosUsuarioCacheLocal(usuario.id, resultado.data);
        setDatosTurnos(datosActualizados ?? resultado.data);
        actualizarAlEntrarPendiente.current = false;
      } else {
        setErrorTurnos(true);
      }
    } catch {
      setErrorTurnos(true);
    } finally {
      cargaTurnosEnCurso.current = false;
    }
  }, [usuario.id]);

  useEffect(() => {
    setPestana(initialTab);
    void cargarTurnos();
  }, [cargarTurnos, initialTab]);

  useEffect(() => {
    precargarDisponibilidadInicial(initialBarberos.map(({ id }) => id));
  }, [initialBarberos]);

  const cambiarPestana = (siguiente: PestanaPanel) => {
    if (siguiente === "turnos" && pestana !== siguiente) void cargarTurnos();
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
      <main className="mx-auto w-full max-w-5xl grow px-4 pb-12 pt-24 md:px-8">
        <EncabezadoPanelUsuario nombre={usuario.name} pestana={pestana} alCambiar={cambiarPestana} />
        {pestana === "turnos" && clavePublicaPush && (
          <div className="mb-4">
            <AvisosDeTurnos key={user.id} clavePublica={clavePublicaPush} />
          </div>
        )}
        {pestana === "perfil" ? (
          <FormularioPerfilUsuario usuario={usuario} prefijoInicial={prefijoInicial} telefonoInicial={telefonoInicial} guardando={guardando} alGuardar={guardarPerfil} />
        ) : datosTurnos ? (
          <PanelTurnosUsuario
            turnosProximosIniciales={datosTurnos.proximos}
            turnosHistorialIniciales={datosTurnos.historial.turnos}
            paginaInicial={datosTurnos.historial.paginaActual}
            totalPaginasInicial={datosTurnos.historial.totalPaginas}
            session={session}
            initialServicios={initialServicios}
            initialBarberos={initialBarberos}
            initialRelaciones={initialRelaciones}
            {...datosPago}
          />
        ) : errorTurnos ? (
          <div className="rounded-xl bg-[var(--admin-surface)] p-6 text-center sm:p-8">
            <p className="text-[var(--admin-texto-secundario)]" role="alert">No se pudieron cargar tus turnos.</p>
            <button type="button" onClick={() => void cargarTurnos()} className="mt-2 min-h-11 rounded-md px-3 font-semibold text-[var(--page-primary-tinta)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[var(--page-focus-ring)]">Reintentar</button>
          </div>
        ) : (
          <CargadorTurnosUsuario />
        )}
      </main>
    </div>
  );
}
