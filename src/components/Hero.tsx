"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, MapPin, Scissors, Star, ChevronRight } from "lucide-react";

interface HeroProps {
  onBookingClick?: () => void;
}

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden py-24">
      
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=2070&auto=format&fit=crop')" }}
      />
      
      {/* Degradados para fusionar la imagen con el fondo oscuro */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/60 to-zinc-950" />
      <div className="absolute inset-0 z-0 bg-" />

      <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center justify-center w-full max-w-6xl mx-auto">
        
        {/* ENCABEZADO PRINCIPAL HERO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-10 md:mb-16 w-full"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-white/5 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">Solicita tu Turno</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading- flex text-wrap flex-wrap text-center items-center justify-center">
            Corte <span className="text-amber-500 italic pr-2">Impecable</span>
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-600">
              Actitud y Estilo
            </span>
          </h1>
          
          <p className="mt-6 text-zinc-400 text-sm md:text-base font-medium max-w-xl mx-auto tracking-wide">
            Más que un corte, brindamos un servicio pensado para que te veas y te sientas bien.
            Atención profesional, precisión en cada detalle y un ambiente cómodo para cada visita.
          </p>
        </motion.div>

        {/* ISLAND CARD - TARJETA DE RESERVA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="w-full max-w-lg relative group"
        >
          {/* Brillo de fondo detrás de la tarjeta */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-zinc-600/20 rounded- blur-xl opacity-50 group-hover:opacity-100 transition duration-700" />
          
          <div className="relative bg-zinc-950/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-">
            
            {/* Header de la Tarjeta */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-amber-500" />
                  Tu Turno
                </h2>
              </div>
            </div>

            {/* Detalles rápidos */}
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

            {/* BOTÓN DE RESERVA */}
            <Link href="/turno" className="block w-full">
              <button className="relative w-full group overflow-hidden bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-5 rounded-2xl transition-all active:scale-">
                <div className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest text-sm md:text-base">
                  Reservar Ahora
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                {/* Efecto de brillo pasando por el botón */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-" />
              </button>
            </Link>

          </div>
        </motion.div>
        
      </div>
    </section>
  );
}