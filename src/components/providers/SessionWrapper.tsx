"use client";
import { useEffect, useRef } from "react";
import { getSession, SessionProvider, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { limpiarCacheTurnosLocal } from "@/lib/admin/turnos-cache-local";
import { limpiarTurnosUsuarioCacheLocal } from "@/components/dashboard/turnos-usuario-cache-local";

const RETARDO_MAXIMO_MS = 2_147_483_647;

function SincronizarSesion() {
  const { data: sesion } = useSession();
  const usuarioId = sesion?.user?.id;
  const venceEn = sesion?.venceEn ?? Date.parse(sesion?.expires ?? "");
  const usuarioAnterior = useRef(usuarioId);

  useEffect(() => {
    const habiaSesion = Boolean(usuarioAnterior.current);
    usuarioAnterior.current = usuarioId;
    limpiarCacheTurnosLocal();
    if (usuarioId) return;

    limpiarTurnosUsuarioCacheLocal();
    const segmento = window.location.pathname.split("/")[1];
    if (habiaSesion && ["admin", "dashboard", "pago"].includes(segmento)) {
      window.location.reload();
    }
  }, [usuarioId]);

  useEffect(() => {
    if (!usuarioId || !Number.isFinite(venceEn)) return;

    let vigente = true;
    let comprobando = false;
    let proximoVencimiento = venceEn;
    let temporizador: number | undefined;

    async function comprobarAlVencer() {
      if (comprobando || document.visibilityState !== "visible") return;
      window.clearTimeout(temporizador);
      const restante = proximoVencimiento - Date.now();
      if (restante > 0) {
        temporizador = window.setTimeout(alVolver, Math.min(restante, RETARDO_MAXIMO_MS));
        return;
      }

      // Otra pestaña puede haber renovado la cookie desde la última lectura.
      comprobando = true;
      const actual = await getSession({ broadcast: false });
      if (!vigente) return;

      const nuevoVencimiento = Date.parse(actual?.expires ?? "");
      if (actual?.user?.id !== usuarioId || !(nuevoVencimiento > Date.now())) {
        window.location.reload();
        return;
      }

      proximoVencimiento = nuevoVencimiento;
      comprobando = false;
      alVolver();
    }

    function alVolver() {
      void comprobarAlVencer();
    }

    alVolver();
    document.addEventListener("visibilitychange", alVolver);
    window.addEventListener("pageshow", alVolver);
    return () => {
      vigente = false;
      window.clearTimeout(temporizador);
      document.removeEventListener("visibilitychange", alVolver);
      window.removeEventListener("pageshow", alVolver);
    };
  }, [usuarioId, venceEn]);

  return null;
}

export default function SessionWrapper({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <SincronizarSesion />
      {children}
    </SessionProvider>
  );
}
