"use client";

import { useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/sesion/perfil.actions";
import { getUserTurnos } from "@/actions/sesion/listar-turnos-usuario.actions";
import { obtenerDatosPagoPanel } from "@/actions/sesion/datos-panel-usuario.actions";
import EncabezadoPanelUsuario from "@/components/dashboard/EncabezadoPanelUsuario";
import FormularioPerfilUsuario from "@/components/dashboard/FormularioPerfilUsuario";
import ModalTelefonoObligatorio from "@/components/dashboard/ModalTelefonoObligatorio";
import PanelTurnosUsuario from "@/components/dashboard/PanelTurnosUsuario";
import type { DatosUsuarioPanel, PestanaPanel, PropiedadesPanelUsuario } from "@/components/dashboard/tipos-panel-usuario";
import type { TurnoListado } from "@/types/turno";
import type { DatosTransferencia } from "@/types/pago";

type PaginaTurnos = {
  turnos: TurnoListado[];
  paginaActual: number;
  totalPaginas: number;
};

type DatosTurnosPanel = {
  pagina: PaginaTurnos;
  whatsappPhone: string;
  datosTransferencia: DatosTransferencia;
};

export default function DashboardPanel({
  user,
  session,
}: PropiedadesPanelUsuario) {
  const { update } = useSession();
  const [guardando, iniciarTransicion] = useTransition();
  const [pestana, setPestana] = useState<PestanaPanel>("perfil");
  const [usuario, setUsuario] = useState<DatosUsuarioPanel>(user);
  const [datosTurnos, setDatosTurnos] = useState<DatosTurnosPanel | null>(null);
  const [cargandoTurnos, setCargandoTurnos] = useState(false);
  const [errorTurnos, setErrorTurnos] = useState(false);
  const cargaTurnosEnCurso = useRef(false);
  const [tieneTelefono, setTieneTelefono] = useState(Boolean(usuario.telefono));
  const coincidencia = usuario.telefono?.match(/^(\+\d{1,3}(?:\s\d)?)\s?(.*)$/);
  const prefijoInicial = coincidencia?.[1].trim() || "+54 9";
  const telefonoInicial = coincidencia?.[2].trim() || usuario.telefono || "";

  const cargarTurnos = async () => {
    if (cargaTurnosEnCurso.current || datosTurnos) return;
    cargaTurnosEnCurso.current = true;
    setCargandoTurnos(true);
    setErrorTurnos(false);
    try {
      const [resultadoTurnos, resultadoPago] = await Promise.all([
        getUserTurnos(usuario.id),
        obtenerDatosPagoPanel(),
      ]);
      if (resultadoTurnos.success && resultadoTurnos.data && resultadoPago.success && resultadoPago.data) {
        setDatosTurnos({
          pagina: resultadoTurnos.data,
          whatsappPhone: resultadoPago.data.whatsappPhone,
          datosTransferencia: resultadoPago.data.datosTransferencia,
        });
      } else {
        setErrorTurnos(true);
      }
    } catch {
      setErrorTurnos(true);
    } finally {
      cargaTurnosEnCurso.current = false;
      setCargandoTurnos(false);
    }
  };

  const cambiarPestana = (siguiente: PestanaPanel) => {
    setPestana(siguiente);
    if (siguiente === "turnos") void cargarTurnos();
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
                  turnosIniciales={datosTurnos.pagina.turnos}
                  paginaInicial={datosTurnos.pagina.paginaActual}
                  totalPaginasInicial={datosTurnos.pagina.totalPaginas}
                  session={session}
                  whatsappPhone={datosTurnos.whatsappPhone}
                  datosTransferencia={datosTurnos.datosTransferencia}
                />
              ) : (
                <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-8 text-center" aria-live="polite">
                  {errorTurnos ? (
                    <>
                      <p className="text-[var(--admin-texto-secundario)]">No se pudieron cargar tus turnos.</p>
                      <button type="button" onClick={() => void cargarTurnos()} className="mt-4 font-semibold text-[var(--page-primary-tinta)] hover:underline">Reintentar</button>
                    </>
                  ) : (
                    <p className="text-[var(--admin-texto-secundario)]" aria-busy={cargandoTurnos}>Cargando tus turnos...</p>
                  )}
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
