// components/Hero.tsx
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, MapPin, Scissors, ChevronRight } from "lucide-react";

interface HeroProps {
  config?: {
    slogan?: string | null;
    description?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
  } | null;
}

export function Hero({ config }: HeroProps) {
  const primaryColor = config?.primaryColor || "#d97706";
  
  // Usamos el slogan de la config, o un texto por defecto si está vacío
  const slogan = config?.slogan || "Corte Impecable - Actitud y Estilo";
  const description = config?.description || "Más que un corte, brindamos un servicio pensado para que te veas y te sientas bien. Atención profesional, precisión en cada detalle.";

  // Opcional: Si querés dividir el slogan en dos partes para mantener el diseño original (ej: primera palabra/s vs resto)
  const sloganWords = slogan.split(" ");
  const firstPart = sloganWords.slice(0, 2).join(" ");
  const secondPart = sloganWords.slice(2).join(" ");

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden py-24">
      
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=2070&auto=format&fit=crop')" }}
      />
      
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/60 to-zinc-950" />

      <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center justify-center w-full max-w-6xl mx-auto">
        
        {/* ENCABEZADO PRINCIPAL HERO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-10 md:mb-16 w-full"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-white/5 backdrop-blur-md mb-6">
            <span 
              className="w-2 h-2 rounded-full animate-pulse" 
              style={{ backgroundColor: primaryColor }} 
            />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">Solicita tu Turno</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-tight flex flex-wrap text-center items-center justify-center max-w-4xl mx-auto">
            {firstPart}&nbsp;<span className="italic pr-2" style={{ color: primaryColor }}>{secondPart || "Estilo"}</span>
          </h1>
          
          <p className="mt-6 text-zinc-400 text-sm md:text-base font-medium max-w-xl mx-auto tracking-wide">
            {description}
          </p>
        </motion.div>

        {/* ISLAND CARD - TARJETA DE RESERVA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="w-full max-w-lg relative group"
        >
          <div 
            className="absolute -inset-1 rounded-3xl blur-xl opacity-30 group-hover:opacity-70 transition duration-700" 
            style={{ background: `linear-gradient(to right, ${primaryColor}, #52525b)` }}
          />
          
          <div className="relative bg-zinc-950/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
            
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                  <Calendar className="w-6 h-6" style={{ color: primaryColor }} />
                  Tu Turno
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex flex-col gap-1 p-3 rounded-2xl bg-zinc-900/50 border border-white/5">
                <Scissors className="w-5 h-5 text-zinc-400 mb-1" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Servicio</span>
                <span className="text-sm font-bold text-zinc-200">Premium</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-2xl bg-zinc-900/50 border border-white/5">
                <MapPin className="w-5 h-5 text-zinc-400 mb-1" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Ubicación</span>
                <span className="text-sm font-bold text-zinc-200">Santa Clara, Buenos Aires</span>
              </div>
            </div>

            <Link href="/turno" className="block w-full">
              <button 
                className="relative w-full group overflow-hidden text-zinc-950 font-black py-5 rounded-2xl transition-all active:scale-95 shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest text-sm md:text-base">
                  Reservar Ahora
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </Link>

          </div>
        </motion.div>
        
      </div>
    </section>
  );
}