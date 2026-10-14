"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import { solicitarRecuperacion } from "@/actions/sesion/solicitar-recuperacion.actions";
import { CLASES_BOTON_MARCA } from "@/lib/constants";
import type { ActionState } from "@/types/action-state";
import { KeyRound, Mail, Scissors, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function FormularioSolicitudRecuperacion() {
  const [state, action, isPending] = useActionState<ActionState, FormData>(
    solicitarRecuperacion,
    { error: "", success: false },
  );
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (state.success) {
      toast.success("Solicitud enviada", {
        description: "Revisá tu bandeja de entrada y la carpeta de spam.",
      });
    }
    if (state.error) toast.error("Error", { description: state.error });
  }, [state]);

  return (
    <AuthLayout>
      <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[var(--page-bg)] text-[var(--page-bg-foreground)]">
        <div
          className="absolute inset-0 z-0 opacity-30 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=2072&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/90 to-zinc-950" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[var(--page-primary)]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--page-primary)] to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]/60 backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--page-primary)]/50 to-transparent" />

          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)]">
                <KeyRound className="w-8 h-8 text-[var(--page-primary-tinta)]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--page-bg-foreground)] tracking-tighter uppercase mb-2">
                Recuperar <span className="text-[var(--page-primary-tinta)]">Contraseña</span>
              </h1>
              <p className="text-sm font-medium text-[var(--admin-texto-secundario)]">
                Ingresá el correo de tu cuenta y te enviaremos un enlace para elegir una contraseña nueva. El enlace vence en 30 minutos.
              </p>
            </div>

            {state.success ? (
              <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-item)] p-4 text-center">
                <p className="text-sm font-medium text-[var(--admin-texto-primario)]">
                  {state.aviso ?? "Revisá tu correo para continuar."}
                </p>
                <p className="mt-2 text-xs text-[var(--admin-texto-muted)]">
                  Si no ves el email, revisá la carpeta de spam o intentá de nuevo en unos minutos.
                </p>
              </div>
            ) : (
              <form action={action} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-[var(--page-primary-tinta)] ml-1">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--admin-texto-muted)] group-focus-within:text-[var(--page-primary-tinta)] transition-colors" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="cliente@correo.com"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(evento) => setEmail(evento.target.value)}
                      className="w-full bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-xl py-3.5 pl-12 pr-4 text-[var(--admin-texto-primario)] outline-none focus:border-[var(--admin-border-fuerte)] focus:bg-[var(--admin-item)] focus:ring-1 focus:ring-[var(--page-focus-ring)] transition-all placeholder:text-[var(--admin-texto-muted)] font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className={`w-full mt-2 ${CLASES_BOTON_MARCA} font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm active:scale- disabled:opacity-50`}
                >
                  {isPending ? "ENVIANDO..." : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      ENVIAR ENLACE
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-[var(--admin-texto-secundario)] hover:text-[var(--page-primary-tinta)] font-bold transition-colors"
              >
                <Scissors className="w-4 h-4" />
                Volver a iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
