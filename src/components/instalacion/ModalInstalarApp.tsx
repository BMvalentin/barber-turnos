"use client";

import { Download, Share } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { useConsentimientoLegal } from "@/contextos/ContextoConsentimientoLegal";
import estilos from "./ModalInstalarApp.module.css";

const CLAVE_POSPOSICION = "mayoraz-instalar-despues-de";
const PLAZO_POSPOSICION_MS = 7 * 24 * 60 * 60 * 1000;
const CLASE_BOTON =
  "min-h-11 px-3 transition-colors duration-150 focus-visible:ring-[var(--page-focus-ring)] focus-visible:ring-offset-[var(--admin-surface)] motion-reduce:transition-none sm:px-4";
const CLASE_PRIMARIA =
  `${CLASE_BOTON} bg-[var(--page-primary)] text-[var(--page-primary-foreground)] hover:bg-[var(--page-primary-hover)] hover:brightness-100`;

type EventoInstalacion = Event & { prompt: () => Promise<unknown> };

function esEventoInstalacion(evento: Event): evento is EventoInstalacion {
  return "prompt" in evento && typeof evento.prompt === "function";
}

function invitacionPospuesta() {
  try {
    return Number(window.localStorage.getItem(CLAVE_POSPOSICION)) > Date.now();
  } catch {
    return false;
  }
}

export default function ModalInstalarApp() {
  const pathname = usePathname();
  const { aceptado } = useConsentimientoLegal();
  const tituloId = useId();
  const guiaId = useId();
  const [oculto, setOculto] = useState(true);
  const [esIOS, setEsIOS] = useState(false);
  const [guiaAbierta, setGuiaAbierta] = useState(false);
  const [eventoInstalacion, setEventoInstalacion] = useState<EventoInstalacion | null>(null);
  const [abriendo, setAbriendo] = useState(false);
  const [error, setError] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const focoPrevio = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const modoApp = window.matchMedia("(display-mode: standalone)");
    const modoAppIOS = "standalone" in navigator && navigator.standalone === true;

    if (!window.isSecureContext || modoApp.matches || modoAppIOS) return;

    setOculto(invitacionPospuesta());
    setEsIOS(
      /iPhone|iPad|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    );

    function ofrecerInstalacion(evento: Event) {
      if (!esEventoInstalacion(evento)) return;
      evento.preventDefault();
      setError(false);
      setEventoInstalacion(evento);
    }

    function ocultarInvitacion() {
      setOculto(true);
      setEventoInstalacion(null);
    }

    function comprobarModoApp(evento: MediaQueryListEvent) {
      if (evento.matches) ocultarInvitacion();
    }

    window.addEventListener("beforeinstallprompt", ofrecerInstalacion);
    window.addEventListener("appinstalled", ocultarInvitacion);
    modoApp.addEventListener?.("change", comprobarModoApp);
    return () => {
      window.removeEventListener("beforeinstallprompt", ofrecerInstalacion);
      window.removeEventListener("appinstalled", ocultarInvitacion);
      modoApp.removeEventListener?.("change", comprobarModoApp);
    };
  }, []);

  function posponer() {
    if (panel.current?.contains(document.activeElement)) {
      focoPrevio.current?.focus({ preventScroll: true });
    }
    setOculto(true);
    setEventoInstalacion(null);
    try {
      window.localStorage.setItem(CLAVE_POSPOSICION, String(Date.now() + PLAZO_POSPOSICION_MS));
    } catch {
      // La invitación queda cerrada en esta visita si el navegador restringe el almacenamiento.
    }
  }

  async function instalar() {
    if (!eventoInstalacion || abriendo) return;

    setAbriendo(true);
    try {
      await eventoInstalacion.prompt();
      posponer();
    } catch {
      setError(true);
    } finally {
      setAbriendo(false);
    }
  }

  const esAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const guiaIOSDisponible = esIOS && !eventoInstalacion;
  const puedeInstalar = Boolean(eventoInstalacion) && !error;

  if ((!esAdmin && pathname !== "/") || !aceptado || oculto || (!guiaIOSDisponible && !eventoInstalacion)) {
    return null;
  }

  const ofrecerGuia = guiaIOSDisponible && !guiaAbierta;
  const mostrarPosponer = puedeInstalar || ofrecerGuia;
  let etiqueta = "Entendido";
  if (ofrecerGuia) etiqueta = "Cómo instalar";
  if (puedeInstalar) etiqueta = abriendo ? "Abriendo…" : "Instalar app";

  function ejecutarAccion() {
    if (puedeInstalar) {
      void instalar();
      return;
    }
    if (ofrecerGuia) {
      setGuiaAbierta(true);
      return;
    }
    posponer();
  }

  return (
    <aside
      ref={panel}
      aria-labelledby={tituloId}
      data-en-admin={esAdmin ? "" : undefined}
      className={`${estilos.panel} fixed z-40 overflow-y-auto overscroll-contain rounded-2xl bg-[var(--admin-surface)] p-4 text-[var(--admin-texto-primario)] shadow-xl sm:p-5`}
      onFocusCapture={(evento) => {
        if (evento.relatedTarget instanceof HTMLElement && !evento.currentTarget.contains(evento.relatedTarget)) {
          focoPrevio.current = evento.relatedTarget;
        }
      }}
      onKeyDown={(evento) => {
        if (evento.key === "Escape") posponer();
      }}
    >
      <div className="flex items-start gap-3.5">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--admin-item)]">
          <Download aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h2 id={tituloId} className="text-lg leading-tight font-semibold tracking-tight sm:text-xl">
            Instalá la app
          </h2>
          <p className="mt-1 text-sm leading-snug text-pretty text-[var(--admin-texto-secundario)]">
            {esAdmin
              ? "Tené a mano tu agenda y gestioná los turnos desde la app."
              : "Reservá y consultá tus turnos desde el ícono de la app."}
          </p>
        </div>
      </div>

      {guiaIOSDisponible && (
        <div id={guiaId} aria-live="polite">
          {guiaAbierta && (
            <ol className="mt-3 list-decimal space-y-1.5 rounded-xl bg-[var(--admin-item)] py-3 pr-3 pl-8 text-sm leading-snug">
              <li>
                En Safari, tocá <strong>Compartir</strong>{" "}
                <Share aria-hidden="true" className="inline-block size-4 align-text-bottom" />.
              </li>
              <li>Elegí <strong>Agregar a Inicio</strong>.</li>
              <li>Activá <strong>Abrir como app web</strong> si aparece y tocá <strong>Agregar</strong>.</li>
            </ol>
          )}
        </div>
      )}
      {error && (
        <p role="status" className="mt-3 text-sm leading-snug text-[var(--admin-texto-secundario)]">
          Buscá la opción de instalar la app en el menú de tu navegador.
        </p>
      )}

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {mostrarPosponer && (
          <Button
            type="button"
            variant="outline"
            className={`${CLASE_BOTON} grow hover:bg-[var(--admin-item)] hover:text-[var(--admin-texto-primario)] sm:grow-0`}
            onClick={posponer}
          >
            Ahora no
          </Button>
        )}
        <Button
          type="button"
          className={`${CLASE_PRIMARIA} grow aria-disabled:cursor-wait aria-disabled:opacity-60 sm:grow-0`}
          onClick={ejecutarAccion}
          aria-disabled={abriendo || undefined}
          aria-controls={ofrecerGuia ? guiaId : undefined}
          aria-expanded={ofrecerGuia ? false : undefined}
        >
          {etiqueta}
        </Button>
      </div>
    </aside>
  );
}
