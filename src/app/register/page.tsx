"use client";
import { registerAction } from "@/actions/auth-actions";
import GoogleButton from "@/components/auth/google-button";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { User, Mail, Lock, Scissors } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(registerAction, { error: "", success: false });

  useEffect(() => {
    if (state.success) {
      router.push("/login?registered=true");
    }
  },);

  return (
    <AuthLayout>
      <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-zinc-950">
        
        {/* ===============*/}
        {/* IMAGEN DE FONDO*/}
        {/* ===============*/}
        <div 
          className="absolute inset-0 z-0 opacity-30 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=2072&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/90 to-zinc-950" />

        {/* Luces de neón de fondo (Efecto velocidad)*/}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-600/10 rounded-full blur-[120px]" />
        
        {/*Líneas abstractas*/} 
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        </div>

        {/* TARJETA DE REGISTRO */}
        <div className="relative z-10 w-full max-w-5xl flex flex-row-reverse rounded- overflow-hidden shadow- border border-white/5 bg-zinc-950/60 backdrop-blur-xl">
          
          {/* LADO DERECHO - IMAGEN (Solo Desktop, Invertido para variar visualmente) */}
          <div className="hidden lg:block lg:w-1/2 relative">
            {/* ========================================================= */}
            {/* OTRA IMAGEN DE BARBERIA PARA EL REGISTRO                  */}
            {/* ========================================================= */}
            <div 
              className="absolute inset-0 bg-cover bg-center grayscale- contrast-125"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1974&auto=format&fit=crop')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-zinc-950/40 to-zinc-950" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
            
            <div className="absolute bottom-12 left-12 right-12 text-right">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
                Forja tu <span className="text-amber-500">Identidad</span>
              </h2>
              <p className="text-zinc-400 font-medium">Únete a la hermandad. Reserva tus turnos al instante.</p>
            </div>
          </div>

          {/* LADO IZQUIERDO - FORMULARIO */}
          <div className="w-full lg:w-1/2 p-8 sm:p-12 md:p-16 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

            <div className="text-center lg:text-left mb-8">
              <div className="inline-flex lg:hidden items-center justify-center w-16 h-16 rounded-full bg-zinc-900 mb-6 border border-amber-500/30 shadow-">
                <Scissors className="w-8 h-8 text-amber-500" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase">
                Únete al <span className="text-amber-500">Club</span>
              </h1>
              <p className="text-zinc-400 text-sm mt-2 font-medium tracking-wide">CREA TU CUENTA EXCLUSIVA</p>
            </div>

            <div className="space-y-4 mb-8">
              <GoogleButton />
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
              <div className="relative flex justify-center lg:justify-start text-xs uppercase tracking-widest font-bold">
                <span className="bg-zinc-950 px-4 text-zinc-500">O usa tu Email</span>
              </div>
            </div>

            <form action={action} className="space-y-5">
              <div className="space-y-2">
                <label className="text- font-black text-amber-500 uppercase tracking- ml-1">Nombre Completo</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-amber-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-zinc-600 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text- font-black text-amber-500 uppercase tracking- ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    name="email"
                    type="email"
                    placeholder="cliente@correo.com"
                    required
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-amber-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-zinc-600 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text- font-black text-amber-500 uppercase tracking- ml-1">Contraseña</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-amber-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-zinc-600 font-medium"
                  />
                </div>
              </div>

              {state.error && (
                <p className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl text-center">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-4 rounded-xl transition-all shadow- hover:shadow- flex items-center justify-center gap-3 uppercase tracking-widest text-sm sm:text-base active:scale- disabled:opacity-50"
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
              <p className="text-sm text-zinc-500 font-medium">
                ¿Ya eres miembro?{" "}
                <Link href="/login" className="text-amber-500 font-bold hover:text-amber-400 transition-colors underline-offset-4 hover:underline">
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