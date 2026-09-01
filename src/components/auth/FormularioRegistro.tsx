"use client";
import { registerAction } from "@/actions/sesion/registro.actions";
import GoogleButton from "@/components/auth/google-button";
import FondoRegistro from "@/components/auth/FondoRegistro";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { CLASES_BOTON_MARCA } from "@/lib/constants";
import { User, Mail, Lock, Scissors, Eye, EyeOff } from "lucide-react";
import type { ActionState } from "@/types/action-state";
import { toast } from "sonner";

export default function FormularioRegistro() {
  const router = useRouter();
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

  useEffect(() => {
    if (state.error) toast.error("Error", { description: state.error });
  }, [state]);

  return (
    <AuthLayout>
      <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[var(--page-bg)] text-[var(--page-bg-foreground)]">
        
        <FondoRegistro />
        <div className="relative z-10 w-full max-w-5xl flex flex-row-reverse rounded- overflow-hidden shadow- border border-[var(--admin-border)] bg-[var(--admin-surface)]/60 backdrop-blur-xl">
          
          {/* LADO DERECHO - IMAGEN (Solo Desktop, Invertido para variar visualmente) */}
          <div className="hidden lg:block lg:w-1/2 relative">
            {/* ========================================================= */}
            {/* OTRA IMAGEN DE BARBERIA PARA EL REGISTRO                  */}
            {/* ========================================================= */}
            <div 
              className="absolute inset-0 bg-cover bg-center grayscale- contrast-125"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1974&auto=format&fit=crop')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/40 to-black" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            
            <div className="absolute bottom-12 left-12 right-12 text-right">
              <h2 className="text-4xl font-black text-[var(--page-bg-foreground)] uppercase tracking-tighter mb-2">
                Forja tu <span className="text-[var(--page-primary-tinta)]">Identidad</span>
              </h2>
              <p className="text-[var(--admin-texto-secundario)] font-medium">Únete a la hermandad. Reserva tus turnos al instante.</p>
            </div>
          </div>

          {/* LADO IZQUIERDO - FORMULARIO */}
          <div className="w-full lg:w-1/2 p-8 sm:p-12 md:p-16 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--page-primary)]/50 to-transparent" />

            <div className="text-center lg:text-left mb-8">
              <div className="inline-flex lg:hidden items-center justify-center w-16 h-16 rounded-full bg-[var(--admin-surface-elevated)] mb-6 border border-[var(--admin-border-fuerte)] shadow-">
                <Scissors className="w-8 h-8 text-[var(--page-primary-tinta)]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[var(--page-bg-foreground)] tracking-tighter uppercase">
                Únete al <span className="text-[var(--page-primary-tinta)]">Club</span>
              </h1>
              <p className="text-[var(--admin-texto-secundario)] text-sm mt-2 font-medium tracking-wide">CREA TU CUENTA EXCLUSIVA</p>
            </div>

            <div className="space-y-4 mb-8">
              <GoogleButton />
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[var(--admin-border)]" /></div>
              <div className="relative flex justify-center lg:justify-start text-xs uppercase tracking-widest font-bold">
                <span className="bg-[var(--admin-surface)] px-4 text-[var(--admin-texto-muted)]">O usa tu Email</span>
              </div>
            </div>

            <form action={action} className="space-y-5">
              <div className="space-y-2">
                <label className="text- font-black text-[var(--page-primary-tinta)] uppercase tracking- ml-1">Nombre Completo</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--admin-texto-muted)] group-focus-within:text-[var(--page-primary-tinta)] transition-colors" />
                  <input
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-xl py-3.5 pl-12 pr-4 text-[var(--admin-texto-primario)] outline-none focus:border-[var(--admin-border-fuerte)] focus:bg-[var(--admin-item)] focus:ring-1 focus:ring-[var(--page-focus-ring)] transition-all placeholder:text-[var(--admin-texto-muted)] font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text- font-black text-[var(--page-primary-tinta)] uppercase tracking- ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--admin-texto-muted)] group-focus-within:text-[var(--page-primary-tinta)] transition-colors" />
                  <input
                    name="email"
                    type="email"
                    placeholder="cliente@correo.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-xl py-3.5 pl-12 pr-4 text-[var(--admin-texto-primario)] outline-none focus:border-[var(--admin-border-fuerte)] focus:bg-[var(--admin-item)] focus:ring-1 focus:ring-[var(--page-focus-ring)] transition-all placeholder:text-[var(--admin-texto-muted)] font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text- font-black text-[var(--page-primary-tinta)] uppercase tracking- ml-1">Contraseña</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--admin-texto-muted)] group-focus-within:text-[var(--page-primary-tinta)] transition-colors" />
                  <input
                    name="password"
                    type={verPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-xl py-3.5 pl-12 pr-12 text-[var(--admin-texto-primario)] outline-none focus:border-[var(--admin-border-fuerte)] focus:bg-[var(--admin-item)] focus:ring-1 focus:ring-[var(--page-focus-ring)] transition-all placeholder:text-[var(--admin-texto-muted)] font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--admin-texto-muted)] hover:text-[var(--page-primary-tinta)] transition-colors"
                    aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {verPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text- font-black text-[var(--page-primary-tinta)] uppercase tracking- ml-1">Confirmar Contraseña</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--admin-texto-muted)] group-focus-within:text-[var(--page-primary-tinta)] transition-colors" />
                  <input
                    name="confirmPassword"
                    type={verConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-xl py-3.5 pl-12 pr-12 text-[var(--admin-texto-primario)] outline-none focus:border-[var(--admin-border-fuerte)] focus:bg-[var(--admin-item)] focus:ring-1 focus:ring-[var(--page-focus-ring)] transition-all placeholder:text-[var(--admin-texto-muted)] font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setVerConfirmPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--admin-texto-muted)] hover:text-[var(--page-primary-tinta)] transition-colors"
                    aria-label={verConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {verConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className={`w-full mt-4 ${CLASES_BOTON_MARCA} font-black py-4 rounded-xl transition-all shadow- hover:shadow- flex items-center justify-center gap-3 uppercase tracking-widest text-sm sm:text-base active:scale- disabled:opacity-50`}
              >
                {isPending ? "PROCESANDO..." : (
                  <>
                    <Scissors className="w-5 h-5" />
                    RESERVAR MI ASIENTO
                  </>
                )}
              </button>
            </form>

            <div className="text-center lg:text-left mt-8">
              <p className="text-sm text-[var(--admin-texto-muted)] font-medium">
                ¿Ya eres miembro?{" "}
                <Link href="/login" className="text-[var(--page-primary-tinta)] font-bold hover:text-[var(--page-primary-tinta)] transition-colors underline-offset-4 hover:underline">
                  Inicia Sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
