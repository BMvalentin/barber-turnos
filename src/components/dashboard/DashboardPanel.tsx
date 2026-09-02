"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/sesion/perfil.actions";
import EncabezadoPanelUsuario from "@/components/dashboard/EncabezadoPanelUsuario";
import FormularioPerfilUsuario from "@/components/dashboard/FormularioPerfilUsuario";
import ModalTelefonoObligatorio from "@/components/dashboard/ModalTelefonoObligatorio";
import PanelTurnosUsuario from "@/components/dashboard/PanelTurnosUsuario";
import type { PestanaPanel, PropiedadesPanelUsuario } from "@/components/dashboard/tipos-panel-usuario";

export default function DashboardPanel({
  user,
  turnos,
  paginaTurnosInicial,
  totalPaginasTurnos,
  session,
}: PropiedadesPanelUsuario) {
  const { update } = useSession();
  const [guardando, iniciarTransicion] = useTransition();
  const [pestana, setPestana] = useState<PestanaPanel>("perfil");
  const [tieneTelefono, setTieneTelefono] = useState(Boolean(user.telefono));
  const coincidencia = user.telefono?.match(/^(\+\d{1,3}(?:\s\d)?)\s?(.*)$/);
  const prefijoInicial = coincidencia?.[1].trim() || "+54 9";
  const telefonoInicial = coincidencia?.[2].trim() || user.telefono || "";

  const guardarPerfil = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const prefijo = datos.get("prefix");
    const telefono = datos.get("telefono");
    if (typeof prefijo === "string" && typeof telefono === "string" && prefijo && telefono) {
      datos.set("telefono", `${prefijo} ${telefono}`);
    }
    iniciarTransicion(async () => {
      const resultado = await updateProfile(user.id, datos);
      if (!resultado.success) {
        toast.error("Error", { description: resultado.error || "Error al actualizar" });
        return;
      }
      toast.success("Perfil actualizado", { description: "Perfil actualizado correctamente." });
      if (resultado.data) {
        await update({ name: resultado.data.name, telefono: resultado.data.telefono });
        if (resultado.data.telefono) setTieneTelefono(true);
      }
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[var(--admin-background)] font-sans text-[var(--admin-texto-primario)]">
      {!tieneTelefono && (
        <ModalTelefonoObligatorio usuario={user} prefijoInicial={prefijoInicial} telefonoInicial={telefonoInicial} guardando={guardando} alGuardar={guardarPerfil} />
      )}
      <main className="mx-auto w-full max-w-5xl flex-grow px-4 pb-12 pt-24 md:px-8">
        <EncabezadoPanelUsuario nombre={user.name} pestana={pestana} alCambiar={setPestana} />
        <AnimatePresence mode="wait">
          <motion.div key={pestana} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
            {pestana === "perfil" ? (
              <FormularioPerfilUsuario usuario={user} prefijoInicial={prefijoInicial} telefonoInicial={telefonoInicial} guardando={guardando} alGuardar={guardarPerfil} />
            ) : (
              <PanelTurnosUsuario
                turnosIniciales={turnos}
                paginaInicial={paginaTurnosInicial}
                totalPaginasInicial={totalPaginasTurnos}
                session={session}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
