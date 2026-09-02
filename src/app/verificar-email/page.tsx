"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import { reenviarVerificacion } from "@/actions/sesion/reenviar-verificacion.actions";
import type { ActionState } from "@/types/action-state";
import { Mail, Scissors, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

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

  useEffect(() => {
    if (errorToken) {
      toast.error("Link inválido", { description: "El link es inválido. Pedí uno nuevo abajo." });
    }
  }, [errorToken]);

  useEffect(() => {
    if (avisoEnvio) {
      toast.info("Envío automático no disponible", {
        description: "No pudimos enviar el email automáticamente. Usá el botón de reenviar.",
      });
    }
  }, [avisoEnvio]);

  useEffect(() => {
    if (state.success) {
      toast.success("Email reenviado", { description: "Revisá tu bandeja de entrada." });
    }
    if (state.aviso) toast.info("Aviso", { description: state.aviso });
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
                <Mail className="w-8 h-8 text-[var(--page-primary-tinta)]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--page-bg-foreground)] tracking-tighter uppercase mb-2">
                Revisá tu <span className="text-[var(--page-primary-tinta)]">Correo</span>
              </h1>
              <p className="text-sm font-medium text-[var(--admin-texto-secundario)]">
                Te enviamos un link para activar tu cuenta. Tocá el botón{" "}
                <span className="text-[var(--admin-texto-primario)]">&ldquo;Activar mi cuenta&rdquo;</span> y listo.
              </p>
            </div>

            {email && !state.success && (
              <div className="mb-6 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-item)] p-3 text-center">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--admin-texto-muted)]">Enviado a</p>
                <p className="text-sm font-bold text-[var(--page-primary-tinta)] break-all">{email}</p>
              </div>
            )}

            <form action={action} className="space-y-4">
              {email ? (
                <input type="hidden" name="email" value={email} />
              ) : (
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--admin-texto-muted)] group-focus-within:text-[var(--page-primary-tinta)] transition-colors" />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    className="w-full bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-xl py-3.5 pl-12 pr-4 text-[var(--admin-texto-primario)] outline-none focus:border-[var(--admin-border-fuerte)] focus:ring-1 focus:ring-[var(--page-focus-ring)] transition-all placeholder:text-[var(--admin-texto-muted)] font-medium"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={isPending || state.success}
                className="w-full bg-[var(--page-primary)] hover:bg-[var(--page-primary-hover)] text-[var(--page-primary-foreground)] font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm disabled:opacity-50"
              >
                {isPending ? "REENVIANDO..." : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    REENVIAR EMAIL
                  </>
                )}
              </button>
            </form>

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
