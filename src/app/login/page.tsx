"use client";
import { loginAction } from "@/actions/auth-actions";
import GoogleButton from "@/components/auth/google-button";
import Link from "next/link";
import { useActionState, useEffect } from "react"; 
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { Mail, Lock, ChevronRight, Scissors } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(loginAction, { error: "", success: false });

  useEffect(() => {
    if (state.success) {
      router.push("/dashboard");
      router.refresh();
    }
  },);

  return (
    <AuthLayout>
      {/* CONTENEDOR PRINCIPAL - Ocupa toda la pantalla */}
      <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-zinc-950">
        
        {/* ===================*/}
        {/*   IMAGEN DE FONDO  */}
        {/* Esta es provisional*/}
        {/* ===================*/}
        <div 
          className="absolute inset-0 z-0 opacity-30 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop')" }}
        />
        {/* Overlay para oscurecer el fondo */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/90 to-zinc-950" />
        {/* Luces de neón de fondo (Efecto velocidad)*/}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-600/10 rounded-full blur-[120px]" />
        
        {/*Líneas abstractas*/} 
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        </div>

        {/* TARJETA DE LOGIN (SPLIT DESIGN) */}
        <div className="relative z-10 w-full max-w-5xl flex rounded- overflow-hidden shadow- border border-white/5 bg-zinc-950/60 backdrop-blur-xl">
          {/* LADO IZQUIERDO - IMAGEN (Solo Desktop) */}
          <div className="hidden lg:block lg:w-1/2 relative">
            {/* =======*/}
            {/* IMAGEN */}
            {/* =======*/}
            <div 
              className="absolute inset-0 bg-cover bg-center grayscale- contrast-125"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')" }}
            />
            {/* Capas de degradado para fusionar la imagen con el formulario */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-950/40 to-zinc-950" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
            
            <div className="absolute bottom-12 left-12 right-12 text-left">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
                Domina tu <span className="text-amber-500">Estilo</span>
              </h2>
              <p className="text-zinc-400 font-medium">El corte perfecto es solo el principio. Bienvenido al club.</p>
            </div>
          </div>

          {/* LADO DERECHO - FORMULARIO (100% en móvil, 50% en Desktop) */}
          <div className="w-full lg:w-1/2 p-8 sm:p-12 md:p-16 relative">
            {/* Brillo sutil superior */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

            <div className="text-center lg:text-left mb-10">
              <div className="inline-flex lg:hidden items-center justify-center w-16 h-16 rounded-full bg-zinc-900 mb-6 border border-amber-500/30 shadow-">
                <Scissors className="w-8 h-8 text-amber-500" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase">
                MAYORAZ <span className="text-amber-500">Barber</span>
              </h1>
              <p className="text-zinc-400 text-sm mt-2 font-medium tracking-wide">INGRESA A TU CUENTA</p>
            </div>

            <div className="space-y-4 mb-8">
              <GoogleButton />
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
              <div className="relative flex justify-center lg:justify-start text-xs uppercase tracking-widest font-bold">
                <span className="bg-zinc-950 px-4 text-zinc-500">O ingresa con Email</span>
              </div>
            </div>

            <form action={action} className="space-y-6">
              <div className="space-y-2">
                <label className="text- font-black text-amber-500 uppercase tracking- ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="cliente@correo.com"
                    required 
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-amber-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-zinc-600 font-medium"
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
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-amber-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-zinc-600 font-medium"
                  />
                </div>
              </div>

              {state.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl text-center animate-pulse">
                  {state.error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isPending}
                className="w-full group relative bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-4 rounded-xl transition-all overflow-hidden active:scale- disabled:opacity-50 shadow- hover:shadow-"
              >
                <div className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest text-sm sm:text-base">
                  {isPending ? "INGRESANDO..." : "INICIAR SESIÓN"}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                {/* Brillo dinámico en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-" />
              </button>
            </form>

            <p className="text-center lg:text-left text-sm text-zinc-500 mt-8 font-medium">
              ¿No eres miembro aún?{" "}
              <Link href="/register" className="text-amber-500 hover:text-amber-400 font-bold underline-offset-4 hover:underline transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}