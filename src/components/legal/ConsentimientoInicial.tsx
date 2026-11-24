"use client";

import { aceptarConsentimientoInicial } from "@/actions/legal/aceptar-consentimiento.actions";
import { useConsentimientoLegal } from "@/contextos/ContextoConsentimientoLegal";
import { ChevronDown, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import estilos from "./ConsentimientoInicial.module.css";

const CLASE_ACCION =
  `control-publico ${estilos.accion} inline-flex min-h-11 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold`;
const CLASE_PRINCIPAL =
  `${estilos.principal} bg-[var(--page-primary)] px-4 text-[var(--page-primary-foreground)]`;
const CLASE_ENLACE =
  `control-publico ${estilos.enlace} rounded-sm font-semibold text-[var(--page-primary-tinta)] underline decoration-1 underline-offset-3`;

export default function ConsentimientoInicial() {
  const pathname = usePathname();
  const router = useRouter();
  const { aceptado, marcarAceptado } = useConsentimientoLegal();
  const [expandido, setExpandido] = useState(false);
  const [acepta, setAcepta] = useState(false);
  const [pendiente, setPendiente] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviarAceptacion(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (pendiente) return;

    const datos = new FormData(evento.currentTarget);
    setPendiente(true);
    setError(null);

    try {
      const resultado = await aceptarConsentimientoInicial(datos);
      if (!resultado.success) {
        setError(resultado.error);
        return;
      }

      marcarAceptado();
      router.refresh();
    } catch {
      setError("No se pudo guardar la aceptación. Intentá de nuevo.");
    } finally {
      setPendiente(false);
    }
  }

  // Las políticas deben poder consultarse antes de aceptar.
  if (aceptado || pathname === "/legal" || pathname.startsWith("/legal/")) return null;

  return (
    <aside
      aria-labelledby="consentimiento-inicial-titulo"
      data-consentimiento-inicial
      className={`${estilos.panel} fixed z-[101] overflow-y-auto overscroll-contain rounded-2xl bg-[var(--admin-surface)] p-4 text-[var(--admin-texto-primario)] shadow-xl sm:p-5`}
    >
      <div className={`grid gap-x-3 ${expandido ? "grid-cols-[auto_minmax(0,1fr)_auto]" : "grid-cols-[auto_minmax(0,1fr)]"}`}>
        <span className="col-start-1 row-span-2 row-start-1 grid size-10 place-items-center rounded-lg bg-[var(--admin-item)] text-[var(--admin-texto-secundario)]">
          <ShieldCheck aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </span>
        <h2 id="consentimiento-inicial-titulo" className="col-start-2 row-start-1 self-center text-xl leading-tight font-semibold">
          Privacidad y cookies
        </h2>
        <p className="col-start-2 -col-end-1 row-start-2 mt-1 text-sm leading-normal text-[var(--admin-texto-secundario)]">
          Usamos cookies esenciales para mantener tu sesión y proteger los formularios.
        </p>
        <button
          type="button"
          className={expandido
            ? `${CLASE_ACCION} ${estilos.secundaria} col-start-3 row-start-1 w-11 text-[var(--admin-texto-secundario)]`
            : `${CLASE_ACCION} ${CLASE_PRINCIPAL} col-span-full mt-4`}
          aria-expanded={expandido}
          aria-controls="consentimiento-inicial-detalle"
          onClick={() => setExpandido((anterior) => !anterior)}
        >
          <span className={expandido ? "sr-only" : undefined}>
            {expandido ? "Ocultar detalles" : "Revisar y aceptar"}
          </span>
          <ChevronDown aria-hidden="true" className={expandido ? "size-4 rotate-180" : "size-4"} />
        </button>
      </div>
      <div id="consentimiento-inicial-detalle" hidden={!expandido}>
        <form onSubmit={enviarAceptacion} className="mt-4 border-t border-[var(--page-separador)] pt-4">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 text-sm leading-normal text-[var(--admin-texto-secundario)]">
            <label className={`${estilos.secundaria} grid size-11 cursor-pointer place-items-center rounded-lg`}>
              <input
                type="checkbox"
                aria-labelledby="consentimiento-inicial-texto"
                name="aceptaTerminos"
                value="on"
                checked={acepta}
                onChange={(evento) => setAcepta(evento.target.checked)}
                required
                className="control-publico size-5 cursor-pointer accent-[var(--page-focus-ring)]"
              />
            </label>
            <span id="consentimiento-inicial-texto">
              Acepto los{" "}
              <Link
                href="/legal/terminos"
                target="_blank"
                rel="noopener noreferrer"
                className={CLASE_ENLACE}
              >
                Términos y Condiciones
              </Link>{" "}
              y la{" "}
              <Link
                href="/legal/privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className={CLASE_ENLACE}
              >
                Política de Privacidad
              </Link>. Entiendo el uso de cookies esenciales descrito en la{" "}
              <Link
                href="/legal/cookies"
                target="_blank"
                rel="noopener noreferrer"
                className={CLASE_ENLACE}
              >
                Política de Cookies
              </Link>.
            </span>
          </div>

          {error && (
            <p role="alert" className="mt-3 text-sm text-[var(--page-error)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!acepta}
            aria-disabled={pendiente || undefined}
            className={`${CLASE_ACCION} ${CLASE_PRINCIPAL} mt-4 w-full disabled:cursor-not-allowed disabled:bg-[var(--admin-item)] disabled:text-[var(--admin-texto-muted)] aria-disabled:cursor-wait`}
          >
            {pendiente ? "Guardando…" : "Confirmar aceptación"}
          </button>
        </form>
      </div>
    </aside>
  );
}
