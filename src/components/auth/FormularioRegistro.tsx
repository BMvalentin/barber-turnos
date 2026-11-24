"use client";
import { registerAction } from "@/actions/sesion/registro.actions";
import { CLASE_CAMPO, CLASE_ENLACE, CLASE_ENVIO, CLASE_ERROR, CLASE_ETIQUETA, CLASE_ICONO_CAMPO, CLASE_VER_PASSWORD } from "@/components/auth/estilos-formulario";
import GoogleButton from "@/components/auth/google-button";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { User, Mail, Lock, Scissors, Eye, EyeOff } from "lucide-react";
import type { ActionState } from "@/types/action-state";
import { useConsentimientoLegal } from "@/contextos/ContextoConsentimientoLegal";

export default function FormularioRegistro() {
  const router = useRouter();
  const { aceptado } = useConsentimientoLegal();
  const [state, action, isPending] = useActionState<ActionState, FormData>(
    registerAction,
    { error: "", success: false },
  );
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmPassword, setVerConfirmPassword] = useState(false);

  useEffect(() => {
    if (state.success) {
      const aviso = state.aviso ? "&aviso=1" : "";
      router.push(
        `/verificar-email?email=${encodeURIComponent(state.email ?? "")}${aviso}`,
      );
    }
  }, [state, router]);

  return (
    <AuthLayout>
      <div className="flex w-full max-w-md flex-row-reverse overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] lg:max-w-5xl">
        <div className="relative hidden bg-[#09090b] lg:block lg:w-1/2">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1974&auto=format&fit=crop')" }}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-[#09090b] from-30% via-[#09090b]/55 to-transparent" />
          <div className="absolute inset-x-10 bottom-10 text-right text-white">
            <p className="mb-2 text-4xl font-black uppercase tracking-tight">
              Forja tu <span className="text-[var(--page-primary-sobre-oscuro)]">Identidad</span>
            </p>
            <p className="font-medium">Sumate al club y reservá tus turnos.</p>
          </div>
        </div>

        <div className="min-w-0 flex-1 px-5 py-6 sm:p-8 lg:p-10">
          <div className="mb-6 text-center lg:text-left">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-[var(--admin-surface-elevated)] lg:hidden">
              <Scissors aria-hidden="true" className="size-6 text-[var(--admin-texto-primario)]" />
            </div>
            <h1 className="text-balance text-3xl sm:text-4xl font-black text-[var(--admin-texto-primario)] tracking-tight uppercase">
              Creá tu <span className="text-[var(--page-primary-tinta)]">cuenta</span>
            </h1>
          </div>

          <GoogleButton />

          <div className="my-5 flex items-center gap-3 text-xs font-semibold text-[var(--admin-texto-secundario)] before:h-px before:flex-1 before:bg-[var(--admin-border)] after:h-px after:flex-1 after:bg-[var(--admin-border)]">
            O registrate con tu correo
          </div>

          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className={CLASE_ETIQUETA}>Nombre completo</label>
              <div className="relative">
                <User aria-hidden="true" className={CLASE_ICONO_CAMPO} />
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={`${CLASE_CAMPO} pr-4`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className={CLASE_ETIQUETA}>Correo electrónico</label>
              <div className="relative">
                <Mail aria-hidden="true" className={CLASE_ICONO_CAMPO} />
                <input
                  id="email"
                name="email"
                autoComplete="email"
                  type="email"
                  placeholder="cliente@correo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${CLASE_CAMPO} pr-4`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className={CLASE_ETIQUETA}>Contraseña</label>
              <div className="relative">
                <Lock aria-hidden="true" className={CLASE_ICONO_CAMPO} />
                <input
                  id="password"
                name="password"
                autoComplete="new-password"
                  type={verPassword ? "text" : "password"}
                  required
                  minLength={8}
                  aria-describedby="requisitos-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${CLASE_CAMPO} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setVerPassword((v) => !v)}
                  className={CLASE_VER_PASSWORD}
                  aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {verPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p id="requisitos-password" className="text-xs text-[var(--admin-texto-secundario)]">Usá al menos 8 caracteres.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className={CLASE_ETIQUETA}>Confirmá tu contraseña</label>
              <div className="relative">
                <Lock aria-hidden="true" className={CLASE_ICONO_CAMPO} />
                <input
                  id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                  type={verConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${CLASE_CAMPO} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setVerConfirmPassword((v) => !v)}
                  className={CLASE_VER_PASSWORD}
                  aria-label={verConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
                >
                  {verConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {state.error && <p role="alert" className={CLASE_ERROR}>{state.error}</p>}

            <button
              type="submit"
              disabled={isPending || state.success || !aceptado}
              className={CLASE_ENVIO}
            >
              {isPending || state.success ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <div className="mt-4 text-center lg:text-left">
            <p className="text-sm text-[var(--admin-texto-muted)] font-medium">
              ¿Ya tenés cuenta?{" "}
              <Link href="/login" className={CLASE_ENLACE}>
                Iniciá sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
