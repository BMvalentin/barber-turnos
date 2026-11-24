"use client";

import { useActionState, useState } from "react";
import { CLASE_CAMPO, CLASE_ENVIO, CLASE_ERROR, CLASE_ETIQUETA, CLASE_ICONO_CAMPO, CLASE_VOLVER } from "@/components/auth/estilos-formulario";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import { solicitarRecuperacion } from "@/actions/sesion/solicitar-recuperacion.actions";
import type { ActionState } from "@/types/action-state";
import { KeyRound, Mail, Scissors } from "lucide-react";

export default function FormularioSolicitudRecuperacion() {
  const [state, action, isPending] = useActionState<ActionState, FormData>(
    solicitarRecuperacion,
    { error: "", success: false },
  );
  const [email, setEmail] = useState("");

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]">
        <div className="px-5 py-6 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-[var(--admin-surface-elevated)]">
              <KeyRound aria-hidden="true" className="size-6 text-[var(--admin-texto-primario)]" />
            </div>
            <h1 className="text-balance text-2xl sm:text-3xl font-black text-[var(--admin-texto-primario)] tracking-tight uppercase mb-2">
              Recuperar <span className="text-[var(--page-primary-tinta)]">Contraseña</span>
            </h1>
            <p className="text-sm font-medium text-[var(--admin-texto-secundario)]">
              Ingresá el correo de tu cuenta y te enviaremos un enlace para elegir una contraseña nueva. El enlace vence en 30 minutos.
            </p>
          </div>

          {state.success ? (
            <div role="status" className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-item)] p-4 text-center">
              <p className="text-sm font-medium text-[var(--admin-texto-primario)]">
                {state.aviso ?? "Revisá tu correo para continuar."}
              </p>
              <p className="mt-2 text-xs text-[var(--admin-texto-muted)]">
                Si no encontrás el correo, revisá la carpeta de spam o intentá de nuevo en unos minutos.
              </p>
            </div>
          ) : (
            <form action={action} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className={CLASE_ETIQUETA}>
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail aria-hidden="true" className={CLASE_ICONO_CAMPO} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="cliente@correo.com"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(evento) => setEmail(evento.target.value)}
                    className={`${CLASE_CAMPO} pr-4`}
                  />
                </div>
              </div>

              {state.error && <p role="alert" className={CLASE_ERROR}>{state.error}</p>}

              <button
                type="submit"
                disabled={isPending}
                className={CLASE_ENVIO}
              >
                {isPending ? "Enviando enlace..." : "Enviar enlace"}
              </button>
            </form>
          )}

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
