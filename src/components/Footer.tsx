"use client";
import Image from "next/image";
import { Scissors } from "lucide-react";

export function Footer( { openPrivacy, openTerms }: { openPrivacy: () => void; openTerms: () => void } ) {
  return (
    <footer className="py-8 border-t border-amber-900/30 mx-auto bg-black z-99">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* LOGO Y NOMBRE */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Scissors className="w-5 h-5 text-amber-500" />
            </div>
            <span className="font-bold text-white tracking-tight uppercase">
              MAYORAZ
            </span>
          </div>
          
          {/* TEXTO CENTRAL */}
          <p className="text-sm text-amber-100/40 text-center font-light">
            Cortes con estilo.{" "}Barbería en Santa Clara.{" "}{new Date().getFullYear()} 
          </p>

          {/* ENLACES SECUNDARIOS */}
          <div className="flex gap-8">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={(e) => {
              e.preventDefault();
              openTerms();
            }}>

              Términos
            </button>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={(e) => {
              e.preventDefault();
              openPrivacy();
            }}>

              Privacidad
            </button>
          </div>
          
        </div>
      </div>
    </footer>
  );
}