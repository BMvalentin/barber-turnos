"use client";

import Image from "next/image";
import { Scissors } from "lucide-react";

type FooterProps = {
  openPrivacy: () => void;
  openTerms: () => void;
  barberiaNombre?: string;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
};

export function Footer({ 
  openPrivacy, 
  openTerms, 
  barberiaNombre = "MAYORAZ",
  logoUrl,
  primaryColor = "#d97706", 
  secondaryColor = "#78350f" 
}: FooterProps) {
  return (
    <footer 
      className="py-8 border-t mx-auto bg-zinc-950 relative z-10"
      style={{
        ["--primary" as any]: primaryColor,
        ["--secondary" as any]: secondaryColor,
        borderColor: "color-mix(in srgb, var(--secondary) 40%, transparent)"
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* LOGO Y NOMBRE */}
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-zinc-800">
                <Image 
                  src={logoUrl} 
                  alt={barberiaNombre} 
                  fill 
                  className="object-cover" 
                />
              </div>
            ) : (
              <div 
                className="p-2 rounded-xl border flex items-center justify-center shadow-md"
                style={{ 
                  backgroundColor: "color-mix(in srgb, var(--primary) 15%, transparent)",
                  borderColor: "color-mix(in srgb, var(--primary) 30%, transparent)" 
                }}
              >
                <Scissors className="w-5 h-5" style={{ color: "var(--primary)" }} />
              </div>
            )}
            <span className="font-bold text-white tracking-wider uppercase text-lg">
              {barberiaNombre}
            </span>
          </div>
          
          {/* TEXTO CENTRAL */}
          <p className="text-sm text-zinc-400 text-center font-light">
            Cortes con estilo.{" "}Barbería en Santa Clara.{" "}{new Date().getFullYear()} 
          </p>

          {/* ENLACES SECUNDARIOS */}
          <div className="flex gap-8">
            <button 
              className="text-sm text-zinc-400 hover:text-white transition-colors font-medium" 
              onClick={(e) => {
                e.preventDefault();
                openTerms();
              }}
            >
              Términos
            </button>
            <button 
              className="text-sm text-zinc-400 hover:text-white transition-colors font-medium" 
              onClick={(e) => {
                e.preventDefault();
                openPrivacy();
              }}
            >
              Privacidad
            </button>
          </div>
          
        </div>
      </div>
    </footer>
  );
}