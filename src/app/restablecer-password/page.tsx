"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import FormularioRestablecimiento from "@/components/auth/FormularioRestablecimiento";
import { KeyRound, Scissors } from "lucide-react";

export default function RestablecerPasswordPage() {
  return (
    <Suspense fallback={null}>
      <RestablecerPasswordContenido />
    </Suspense>
  );
}

function RestablecerPasswordContenido() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

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
                Nueva <span className="text-[var(--page-primary-tinta)]">Contraseña</span>
              </h1>
              <p className="text-sm font-medium text-[var(--admin-texto-secundario)]">
                Elegí una contraseña nueva para tu cuenta. El enlace vence en 30 minutos y solo puede usarse una vez.
              </p>
            </div>

            {token ? (
              <FormularioRestablecimiento token={token} />
            ) : (
              <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-item)] p-4 text-center">
                <p className="text-sm font-medium text-[var(--admin-texto-secundario)]">
                  Este enlace es inválido o está incompleto. Pedile a un administrador que genere uno nuevo.
                </p>
              </div>
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
