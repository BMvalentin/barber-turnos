"use client";

import { Suspense } from "react";
import { CLASE_ENLACE, CLASE_VOLVER } from "@/components/auth/estilos-formulario";
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
      <div className="w-full max-w-md rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]">
        <div className="px-5 py-6 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-[var(--admin-surface-elevated)]">
              <KeyRound aria-hidden="true" className="size-6 text-[var(--admin-texto-primario)]" />
            </div>
            <h1 className="text-balance text-2xl sm:text-3xl font-black text-[var(--admin-texto-primario)] tracking-tight uppercase mb-2">
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
                Este enlace es inválido o está incompleto.
              </p>
              <Link href="/recuperar-password" className={`${CLASE_ENLACE} mt-1 inline-flex min-h-11 items-center text-sm`}>Solicitá un enlace nuevo</Link>
            </div>
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
