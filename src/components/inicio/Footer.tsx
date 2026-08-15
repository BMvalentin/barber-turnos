"use client";

import Image from "next/image";
import { Code2, Scissors } from "lucide-react";

type FooterProps = {
  openPrivacy: () => void;
  openTerms: () => void;
  barberiaNombre?: string | null;
  logoUrl?: string | null;
  descripcion?: string | null;
  localidad?: string | null;    
};

export function Footer({ 
  openPrivacy, 
  openTerms, 
  barberiaNombre,
  logoUrl,
  descripcion,
  localidad
}: FooterProps) {
  return (
    <footer 
      className="py-8 border-t mx-auto bg-[var(--page-bg)] relative z-10 w-full"
      style={{
        "--primary": "var(--page-primary)",
        "--secondary": "var(--page-secondary)",
        borderColor: "color-mix(in srgb, var(--secondary) 40%, transparent)"
      } as React.CSSProperties}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-[var(--admin-border)]">
                <Image 
                  src={logoUrl} 
                  alt={barberiaNombre || "Barbería"} 
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
            <span className="font-bold text-[var(--page-bg-foreground)] tracking-wider uppercase text-lg">
              {barberiaNombre}
            </span>
          </div>
          
          <div className="flex flex-col items-center gap-2.5">
            <p className="text-sm text-[var(--page-bg-foreground)]/70 text-center font-light">
              {descripcion} {descripcion && localidad ? "•" : ""} {localidad ? `Barbería en ${localidad}.` : ""}
            </p>
            <a
              href="https://logabyte.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border px-4 py-1.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderColor: "color-mix(in srgb, var(--primary) 35%, transparent)",
                backgroundColor: "color-mix(in srgb, var(--primary) 10%, transparent)",
                outlineColor: "var(--primary)",
              }}
            >
              <Code2
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110"
                style={{ color: "var(--primary)" }}
              />
              <span className="text-xs font-light tracking-wide text-[var(--page-bg-foreground)]/60">
                Creado por
              </span>
              <span
                className="text-xs font-bold tracking-wider uppercase"
                style={{ color: "var(--primary)" }}
              >
                Logabyte
              </span>
            </a>
          </div>

          <div className="flex gap-8">
            <button 
              className="text-sm text-[var(--page-bg-foreground)]/70 hover:text-[var(--page-bg-foreground)] transition-colors font-medium cursor-pointer bg-transparent border-none" 
              onClick={(e) => {
                e.preventDefault();
                openTerms();
              }}
            >
              Términos
            </button>
            <button 
              className="text-sm text-[var(--page-bg-foreground)]/70 hover:text-[var(--page-bg-foreground)] transition-colors font-medium cursor-pointer bg-transparent border-none" 
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