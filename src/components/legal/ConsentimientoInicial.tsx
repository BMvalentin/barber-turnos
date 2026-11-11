"use client";

import { aceptarConsentimientoInicial } from "@/actions/legal/aceptar-consentimiento.actions";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useConsentimientoLegal } from "@/contextos/ContextoConsentimientoLegal";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function ConsentimientoInicial() {
  const pathname = usePathname();
  const router = useRouter();
  const { aceptado, marcarAceptado } = useConsentimientoLegal();
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
    <DialogPrimitive.Root open modal={false}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          aria-describedby="consentimiento-inicial-descripcion"
          onOpenAutoFocus={(evento) => evento.preventDefault()}
          className="fixed bottom-4 left-3 right-3 z-[101] max-h-[75vh] cursor-default overflow-y-auto rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-3 text-[var(--admin-texto-primario)] shadow-2xl sm:bottom-6 sm:left-auto sm:right-6 sm:w-[min(92vw,22rem)]"
        >
          <DialogPrimitive.Title className="mb-1.5 text-base font-bold">
            Privacidad y cookies
          </DialogPrimitive.Title>
          <DialogPrimitive.Description
            id="consentimiento-inicial-descripcion"
            className="mb-2 text-xs leading-relaxed text-[var(--admin-texto-secundario)]"
          >
            Usamos cookies esenciales para que la página funcione correctamente.
          </DialogPrimitive.Description>

          <form onSubmit={enviarAceptacion}>
            <div className="flex cursor-default items-start gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-item)] p-2.5 text-xs leading-relaxed text-[var(--admin-texto-secundario)]">
              <input
                type="checkbox"
                id="consentimiento-inicial-aceptacion"
                aria-labelledby="consentimiento-inicial-texto"
                name="aceptaTerminos"
                value="on"
                checked={acepta}
                onChange={(evento) => setAcepta(evento.target.checked)}
                required
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded"
                style={{ accentColor: "var(--page-primary)" }}
              />
              <span id="consentimiento-inicial-texto">
                Acepto los{" "}
                <Link
                  href="/legal/terminos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer font-semibold text-[var(--page-primary-tinta)] underline-offset-4 hover:underline focus-visible:underline"
                >
                  Términos y Condiciones
                </Link>{" "}
                y la{" "}
                <Link
                  href="/legal/privacidad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer font-semibold text-[var(--page-primary-tinta)] underline-offset-4 hover:underline focus-visible:underline"
                >
                  Política de Privacidad
                </Link>
                {" "}y entiendo el uso de cookies esenciales descrito en la{" "}
                <Link
                  href="/legal/cookies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer font-semibold text-[var(--page-primary-tinta)] underline-offset-4 hover:underline focus-visible:underline"
                >
                  Política de Cookies
                </Link>.
              </span>
            </div>

            {error && (
              <p role="alert" className="mt-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!acepta || pendiente}
              className="mt-2.5 w-full cursor-pointer rounded-lg bg-[var(--page-primary)] px-4 py-2 text-sm font-bold text-[var(--page-primary-foreground)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pendiente ? "Guardando…" : "Aceptar"}
            </button>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
