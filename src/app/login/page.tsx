"use client";
import { loginAction } from "@/actions/sesion/login.actions";
import GoogleButton from "@/components/auth/google-button";
import Link from "next/link";
import { Suspense, useActionState, useEffect, useRef } from "react"; 
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import AuthLayout from "@/components/auth/AuthLayout";
import { CLASE_CAMPO, CLASE_ENLACE, CLASE_ENVIO, CLASE_ERROR, CLASE_ETIQUETA, CLASE_ICONO_CAMPO } from "@/components/auth/estilos-formulario";
import { Mail, Lock, ChevronRight, Scissors } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContenido />
    </Suspense>
  );
}

function LoginPageContenido() {
  const router = useRouter();
  const { update } = useSession();
  const searchParams = useSearchParams();
  const verificado = searchParams.get("verificado") === "true";
  const [state, action, isPending] = useActionState(loginAction, { error: "", success: false });
  const redirigido = useRef(false);

  useEffect(() => {
    if (!state.success || redirigido.current) return;
    redirigido.current = true;
    // Sincroniza la sesión del cliente (navbar) sin exigir volver a guardar
    // el perfil, y delega el destino final al servidor con datos persistidos.
    void update().finally(() => {
      router.replace("/dashboard?redireccion=post-login");
    });
  }, [state, update, router]);

  return (
    <AuthLayout imagenFondo="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop">
      <div className="flex w-full max-w-md overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] lg:max-w-5xl">
        <div className="relative hidden bg-[#09090b] lg:block lg:w-1/2">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')" }}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-[#09090b] from-30% via-[#09090b]/55 to-transparent" />

          <div className="absolute inset-x-10 bottom-10 text-white">
            <p className="mb-2 text-4xl font-black uppercase tracking-tight">
              Domina tu <span className="text-[var(--page-primary-sobre-oscuro)]">Estilo</span>
            </p>
            <p className="font-medium">El corte perfecto es solo el principio. Bienvenido al club.</p>
          </div>
        </div>

        <div className="min-w-0 flex-1 px-5 py-6 sm:p-8 lg:p-10">
          <div className="mb-6 text-center lg:text-left">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-[var(--admin-surface-elevated)] lg:hidden">
              <Scissors aria-hidden="true" className="size-6 text-[var(--admin-texto-primario)]" />
            </div>
            <h1 className="text-balance text-3xl font-black uppercase tracking-tight text-[var(--admin-texto-primario)] sm:text-4xl">
              MAYORAZ <span className="text-[var(--page-primary-tinta)]">Barber</span>
            </h1>
            <p className="mt-2 text-sm font-medium text-[var(--admin-texto-secundario)]">Ingresá a tu cuenta</p>
          </div>

          {verificado && (
            <p role="status" className="mb-4 rounded-lg bg-[var(--admin-surface-elevated)] px-3 py-2 text-sm font-medium">
              Cuenta activada. Ya podés iniciar sesión.
            </p>
          )}

          <GoogleButton />

          <div className="my-5 flex items-center gap-3 text-xs font-semibold text-[var(--admin-texto-secundario)] before:h-px before:flex-1 before:bg-[var(--admin-border)] after:h-px after:flex-1 after:bg-[var(--admin-border)]">
            O ingresá con tu correo
          </div>

          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className={CLASE_ETIQUETA}>Correo electrónico</label>
              <div className="relative">
                <Mail aria-hidden="true" className={CLASE_ICONO_CAMPO} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="cliente@correo.com"
                  required
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
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`${CLASE_CAMPO} pr-4`}
                />
              </div>
            </div>

            {state.error && <p role="alert" className={CLASE_ERROR}>{state.error}</p>}

            <button type="submit" disabled={isPending || state.success} className={CLASE_ENVIO}>
              {isPending || state.success ? "Ingresando..." : "Iniciar sesión"}
              <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
            </button>
          </form>

          <p className="mt-4 text-center text-sm leading-relaxed text-[var(--admin-texto-secundario)] lg:text-left">
            <Link href="/recuperar-password" className={CLASE_ENLACE}>
              ¿Olvidaste tu contraseña?
            </Link>
          </p>

          <p className="mt-3 text-center text-sm leading-relaxed text-[var(--admin-texto-secundario)] lg:text-left">
            ¿Todavía no tenés cuenta?{" "}
            <Link href="/register" className={CLASE_ENLACE}>Registrate</Link>
          </p>

          <p className="mt-4 text-center text-xs leading-relaxed text-[var(--admin-texto-secundario)] lg:text-left">
            Consultá los{" "}
            <Link href="/legal/terminos" className={CLASE_ENLACE}>Términos y Condiciones</Link>
            {" "}y la{" "}
            <Link href="/legal/privacidad" className={CLASE_ENLACE}>Política de Privacidad</Link>.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
