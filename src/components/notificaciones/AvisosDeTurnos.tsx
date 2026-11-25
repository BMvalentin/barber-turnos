"use client";

import { Bell } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  consultarSuscripcionPush,
  eliminarSuscripcionPush,
  guardarSuscripcionPush,
} from "@/actions/notificaciones/suscripcion.actions";

type EstadoListo = {
  tipo: "listo";
  registro: ServiceWorkerRegistration;
  suscripcion: PushSubscription | null;
  activa: boolean;
};

type EstadoAvisos = EstadoListo | {
  tipo: "consultando" | "instalar" | "incompatible" | "bloqueado" | "error";
};

const WORKER_AVISOS = "/sw-notificaciones.js";

function requiereInstalacionIOS() {
  const esIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const instalada = window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && navigator.standalone === true);
  return esIOS && !instalada;
}

function coincideClave(suscripcion: PushSubscription, clave: string) {
  const actual = suscripcion.options.applicationServerKey;
  if (!actual) return false;
  const bytes = new Uint8Array(actual);
  const esperada = atob(clave.replace(/-/g, "+").replace(/_/g, "/"));
  return bytes.length === esperada.length &&
    bytes.every((byte, indice) => byte === esperada.charCodeAt(indice));
}

async function registrarWorker() {
  const registro = await navigator.serviceWorker.register(WORKER_AVISOS);
  if (registro.active) return registro;

  return new Promise<ServiceWorkerRegistration>((resolve, reject) => {
    const limite = window.setTimeout(reject, 10000);
    void navigator.serviceWorker.ready.then((registroActivo) => {
      window.clearTimeout(limite);
      resolve(registroActivo);
    });
  });
}

export default function AvisosDeTurnos({
  clavePublica,
  agenda = false,
}: {
  clavePublica: string;
  agenda?: boolean;
}) {
  const tituloId = useId();
  const detalleId = useId();
  const [estado, establecerEstado] = useState<EstadoAvisos>({ tipo: "consultando" });
  const [ocupado, establecerOcupado] = useState(false);
  const [mensaje, establecerMensaje] = useState("");
  const [intento, establecerIntento] = useState(0);
  const modificando = useRef(false);
  const revision = useRef(0);

  useEffect(() => {
    let vigente = true;
    let registro: ServiceWorkerRegistration | undefined;

    async function comprobar() {
      if (modificando.current) return;
      const consulta = ++revision.current;
      try {
        if (requiereInstalacionIOS()) {
          establecerEstado({ tipo: "instalar" });
          return;
        }
        if (!window.isSecureContext || !("Notification" in window) ||
            !("PushManager" in window) || !("serviceWorker" in navigator)) {
          establecerEstado({ tipo: "incompatible" });
          return;
        }
        if (Notification.permission === "denied") {
          establecerEstado({ tipo: "bloqueado" });
          return;
        }

        registro ??= await registrarWorker();
        const suscripcion = await registro.pushManager.getSubscription();
        const resultado = suscripcion && Notification.permission === "granted" &&
          coincideClave(suscripcion, clavePublica)
          ? await consultarSuscripcionPush(suscripcion.endpoint)
          : { success: true, activa: false };
        if (!vigente || consulta !== revision.current) return;
        establecerEstado(resultado.success
          ? { tipo: "listo", registro, suscripcion, activa: resultado.activa }
          : { tipo: "error" });
      } catch {
        if (vigente && consulta === revision.current) establecerEstado({ tipo: "error" });
      }
    }

    function comprobarAlVolver() {
      if (document.visibilityState === "visible") void comprobar();
    }

    void comprobar();
    document.addEventListener("visibilitychange", comprobarAlVolver);
    return () => {
      vigente = false;
      document.removeEventListener("visibilitychange", comprobarAlVolver);
    };
  }, [clavePublica, intento]);

  async function cambiarSuscripcion() {
    if (estado.tipo !== "listo" || modificando.current) return;
    modificando.current = true;
    revision.current++;
    establecerOcupado(true);
    establecerMensaje("");

    let suscripcion = estado.suscripcion;
    try {
      if (estado.activa && suscripcion) {
        const resultado = await eliminarSuscripcionPush(suscripcion.endpoint);
        if (!resultado.success) throw new Error();
        if (await suscripcion.unsubscribe().catch(() => false)) suscripcion = null;
        establecerEstado({ ...estado, suscripcion, activa: false });
      } else {
        if (suscripcion && !coincideClave(suscripcion, clavePublica)) {
          await suscripcion.unsubscribe();
          suscripcion = null;
        }
        // El navegador pide permiso desde este gesto.
        suscripcion ??= await estado.registro.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: clavePublica,
        });
        const resultado = await guardarSuscripcionPush(suscripcion.toJSON());
        if (!resultado.success) throw new Error();
        establecerEstado({ ...estado, suscripcion, activa: resultado.activa });
      }
    } catch {
      if (Notification.permission === "denied") {
        establecerEstado({ tipo: "bloqueado" });
      } else {
        establecerEstado({ ...estado, suscripcion });
        establecerMensaje(estado.activa
          ? "No pudimos desactivar las notificaciones. Volvé a intentarlo."
          : "No pudimos activar las notificaciones. Volvé a intentarlo y aceptá el permiso si aparece.");
      }
    } finally {
      modificando.current = false;
      establecerOcupado(false);
    }
  }

  const activa = estado.tipo === "listo" && estado.activa;
  const detalle = {
    consultando: "Comprobando las notificaciones de este dispositivo…",
    instalar: "En iPhone y iPad, elegí «Agregar a pantalla de inicio» en Compartir y volvé a entrar desde el ícono.",
    incompatible: "Las notificaciones no están disponibles en este navegador. Probá con uno actualizado.",
    bloqueado: "El permiso está bloqueado. Habilitá las notificaciones desde los ajustes del navegador o del dispositivo.",
    error: "No pudimos comprobar las notificaciones de este dispositivo.",
    listo: activa
      ? "Avisos activados en este dispositivo."
      : agenda
        ? "Recibí un aviso en este dispositivo cuando te asignen un turno."
        : "Recibí confirmaciones, cambios y recordatorios en este dispositivo.",
  }[estado.tipo];

  return (
    <section
      aria-labelledby={tituloId}
      className="flex min-w-0 flex-col gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3">
        <Bell size={18} className="mt-0.5 shrink-0 text-[var(--admin-texto-secundario)]" aria-hidden="true" />
        <div className="min-w-0">
          <h2 id={tituloId} className="text-sm font-semibold text-[var(--admin-texto-primario)]">
            {agenda ? "Notificaciones de la agenda" : "Notificaciones de turnos"}
          </h2>
          <div id={detalleId} role="status" className="mt-0.5 text-sm text-[var(--admin-texto-secundario)]">
            <p>{detalle}</p>
            {mensaje && <p className="mt-1">{mensaje}</p>}
          </div>
        </div>
      </div>
      {(estado.tipo === "listo" || estado.tipo === "error") && (
        <button
          type="button"
          aria-describedby={detalleId}
          disabled={ocupado}
          onClick={estado.tipo === "listo" ? cambiarSuscripcion : () => {
            establecerMensaje("");
            establecerEstado({ tipo: "consultando" });
            establecerIntento((actual) => actual + 1);
          }}
          className="min-h-11 shrink-0 rounded-lg border border-[var(--admin-border-fuerte)] px-4 text-sm font-semibold text-[var(--admin-texto-primario)] transition-colors hover:bg-[var(--admin-item-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--page-focus-ring)] disabled:opacity-60 motion-reduce:transition-none"
        >
          {estado.tipo === "error" ? "Reintentar" : ocupado ? "Guardando…" :
            activa ? "Desactivar avisos" : "Activar avisos"}
        </button>
      )}
    </section>
  );
}
