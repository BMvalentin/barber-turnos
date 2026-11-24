"use client";
import { Suspense, useActionState } from "react";
import { CLASE_CAMPO, CLASE_ENVIO, CLASE_ERROR, CLASE_ETIQUETA, CLASE_ICONO_CAMPO, CLASE_VOLVER } from "@/components/auth/estilos-formulario";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import { reenviarVerificacion } from "@/actions/sesion/reenviar-verificacion.actions";
import type { ActionState } from "@/types/action-state";
import { Mail, Scissors } from "lucide-react";

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerificarEmailContenido />
    </Suspense>
  );
}

function VerificarEmailContenido() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const errorToken = searchParams.get("error");
  const avisoEnvio = searchParams.get("aviso") === "1";

  const [state, action, isPending] = useActionState<ActionState, FormData>(
    reenviarVerificacion,
    { error: "" },
  );

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]">
        <div className="px-5 py-6 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-[var(--admin-surface-elevated)]">
              <Mail aria-hidden="true" className="size-6 text-[var(--admin-texto-primario)]" />
            </div>
            <h1 className="text-balance text-2xl sm:text-3xl font-black text-[var(--admin-texto-primario)] tracking-tight uppercase mb-2">
              Revisá tu <span className="text-[var(--page-primary-tinta)]">Correo</span>
            </h1>
            <p className="text-sm font-medium text-[var(--admin-texto-secundario)]">
              Buscá el enlace de verificación en tu correo y elegí{" "}
              <span className="text-[var(--admin-texto-primario)]">&ldquo;Activar mi cuenta&rdquo;</span>.
            </p>
          </div>

          {email && (
            <div className="mb-6 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-item)] p-3 text-center">
              <p className="mb-1 text-xs font-semibold text-[var(--admin-texto-muted)]">Correo de la cuenta</p>
              <p className="text-sm font-bold text-[var(--admin-texto-primario)] wrap-anywhere">{email}</p>
            </div>
          )}

          {errorToken && <p role="alert" className={CLASE_ERROR + " mb-4"}>El enlace es inválido. Podés solicitar uno nuevo.</p>}

          {avisoEnvio && <p className="mb-4 text-sm text-[var(--admin-texto-secundario)]">El envío automático no está disponible. Usá el botón para reenviar el correo.</p>}

          <form action={action} className="space-y-4">
            {email ? (
              <input type="hidden" name="email" value={email} />
            ) : (
              <div className="space-y-1.5">
                <label htmlFor="email" className={CLASE_ETIQUETA}>Correo electrónico</label>
                <div className="relative">
                  <Mail aria-hidden="true" className={CLASE_ICONO_CAMPO} />
                  <input
                    id="email"
                    name="email"
                    autoComplete="email"
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    className={`${CLASE_CAMPO} pr-4`}
                  />
                </div>
              </div>
            )}
            {(state.success || state.aviso) && (
              <p role="status" className="text-sm text-[var(--admin-texto-secundario)]">
                {state.aviso ?? "Solicitud recibida. Revisá tu bandeja de entrada."}
              </p>
            )}

            {state.error && <p role="alert" className={CLASE_ERROR}>{state.error}</p>}

            <button
              type="submit"
              disabled={isPending || state.success}
              className={CLASE_ENVIO}
            >
              {isPending ? "Reenviando..." : state.success ? "Solicitud recibida" : "Reenviar correo"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className={CLASE_VOLVER}
            >
              <Scissors className="size-4" aria-hidden="true" />
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
