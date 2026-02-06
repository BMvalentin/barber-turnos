"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

interface HeroProps {
  onBookingClick: () => void;
}

export function Hero({ onBookingClick }: HeroProps) {
  return (
    <section id="home" className="relative min-h-screen flex items-start justify-center overflow-hidden pt-24">
      {/* Background */}
      <div className="absolute inset-0 bg-zinc-950" />

      <div className="container relative z-10 flex justify-center">
        {/* Island Card - Centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Minimal Booking Card */}
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-light tracking-[0.2em] text-white mb-2">
                BARBERÍA
              </h1>
            </div>

            {/* Booking Button */}
            <Link href="/turno" className="block">
              <Button 
                onClick={onBookingClick}
                className="w-full h-14 bg-transparent border border-zinc-700 hover:border-white hover:bg-white/5 text-white font-light tracking-[0.1em] transition-all duration-300"
                size="lg"
              >
                RESERVAR TURNO
              </Button>
            </Link>

            {/* Subtle Info */}
            <p className="text-center text-xs text-zinc-600 mt-6 tracking-wide">
              Selecciona barbero, servicio y horario
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}