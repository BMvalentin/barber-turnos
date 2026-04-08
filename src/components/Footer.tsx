"use client";
import Image from "next/image";
import { Scissors } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-8 border-t border-amber-900/30 mx-auto bg-black">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* LOGO Y NOMBRE */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Scissors className="w-5 h-5 text-amber-500" />
            </div>
            <span className="font-bold text-white tracking-tight uppercase">
              Barber<span className="text-amber-500">Shop</span>
            </span>
          </div>
          
          {/* TEXTO CENTRAL */}
          <p className="text-sm text-amber-100/40 text-center font-light">
            Cortes con estilo.{" "}Barbería en Santa Clara.{" "}{new Date().getFullYear()} 
          </p>

          {/* ENLACES SECUNDARIOS */}
          <div className="flex gap-8">
            <a href="#" className="text-xs uppercase tracking-widest text-amber-100/40 hover:text-amber-500 transition-colors">
              Términos
            </a>
            <a href="#" className="text-xs uppercase tracking-widest text-amber-100/40 hover:text-amber-500 transition-colors">
              Privacidad
            </a>
          </div>
          
        </div>
      </div>
    </footer>
  );
}