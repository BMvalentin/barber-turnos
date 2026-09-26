// src/components/inicio/Hero.tsx
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { ESTILO_FONDO_MARCA } from "@/lib/constants";

const DEFAULT_BACKGROUND =
  "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=2070&auto=format&fit=crop";

interface HeroProps {
  config?: {
    slogan?: string | null;
    description?: string | null;
    backgroundImage?: string | null;
    address?: string | null;
    city?: string | null;
  } | null;
}

export function Hero({ config }: HeroProps) {
  const backgroundImage = config?.backgroundImage || DEFAULT_BACKGROUND;
  
  // Usamos el slogan de la config, o un texto por defecto si está vacío
  const slogan = config?.slogan || "Corte Impecable - Actitud y Estilo";
  const description = config?.description || "Más que un corte, brindamos un servicio pensado para que te veas y te sientas bien. Atención profesional, precisión en cada detalle.";

  // Opcional: Si querés dividir el slogan en dos partes para mantener el diseño original (ej: primera palabra/s vs resto)
  const sloganWords = slogan.split(" ");
  const firstPart = sloganWords.slice(0, 2).join(" ");
  const secondPart = sloganWords.slice(2).join(" ");

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden py-24">
      
      {/* Fondo principal del hero: priority + fill generan el preload del LCP
          (fetchPriority="high") automáticamente con next/image en Next 15 */}
      <Image
        src={backgroundImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="z-0 object-cover object-center opacity-40 mix-blend-luminosity"
      />
      
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[var(--page-bg)]/80 via-[var(--page-bg)]/60 to-[var(--page-bg)]" />

      <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center justify-center w-full max-w-6xl mx-auto">
        
        {/* ENCABEZADO PRINCIPAL HERO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-10 md:mb-16 w-full"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--page-bg)]/80 border border-[var(--page-bg-foreground)]/5 backdrop-blur-md mb-6">
            <span 
              className="w-2 h-2 rounded-full animate-pulse" 
style={ESTILO_FONDO_MARCA}
            />
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--page-bg-foreground)]">Solicita tu Turno</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[var(--page-bg-foreground)] uppercase tracking-tighter leading-tight flex flex-wrap text-center items-center justify-center max-w-4xl mx-auto">
            {firstPart}&nbsp;<span className="italic pr-2" style={{ color: "var(--page-primary-tinta)" }}>{secondPart || "Estilo"}</span>
          </h1>
          
          <p className="mt-6 text-[var(--page-bg-foreground)]/70 text-sm md:text-base font-medium max-w-xl mx-auto tracking-wide">
            {description}
          </p>
        </motion.div>

        {/* CTA PRINCIPAL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="w-full flex justify-center"
        >
          <Link href="/turno" className="group inline-flex">
            <button
              type="button"
              className="relative inline-flex items-center justify-center gap-3 overflow-hidden text-[var(--page-primary-foreground)] font-black uppercase tracking-widest text-base md:text-lg px-10 md:px-14 py-5 rounded-sm transition-all active:scale-95 shadow-lg"
              style={ESTILO_FONDO_MARCA}
            >
              <span className="relative z-10">Reserva tu Turno</span>
              <ChevronRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
        
      </div>
    </section>
  );
}
