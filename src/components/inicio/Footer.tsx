"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Code2,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Scissors,
} from "lucide-react";

type FooterProps = {
  openPrivacy: () => void;
  openTerms: () => void;
  barberiaNombre?: string | null;
  logoUrl?: string | null;
  descripcion?: string | null;
  localidad?: string | null;
  instagram?: string | null;
  whatsapp?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
};

const ESTILO_TITULO_SECCION = {
  color: "var(--page-primary-tinta)",
} as const;

const ESTILO_CAJA_ICONO = {
  backgroundColor: "var(--page-primary-15)",
} as const;

const ESTILO_BOTON_SOCIAL = {
  backgroundColor: "var(--page-primary-15)",
  borderColor: "var(--page-primary-30)",
} as const;

export function Footer({
  openPrivacy,
  openTerms,
  barberiaNombre,
  logoUrl,
  descripcion,
  localidad,
  instagram,
  whatsapp,
  telefono,
  email,
  direccion,
  ciudad,
}: FooterProps) {
  const anioActual = new Date().getFullYear();

  return (
    <footer
      className="relative z-10 w-full border-t bg-[var(--page-bg)] pt-14 pb-6"
      style={
        {
          "--primary": "var(--page-primary)",
          "--secondary": "var(--page-secondary)",
          borderColor: "color-mix(in srgb, var(--secondary) 40%, transparent)",
        } as React.CSSProperties
      }
    >
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--page-primary)]/60 to-transparent" />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid gap-10 md:gap-8 lg:grid-cols-[1.4fr_0.8fr_1.1fr_1fr]"
        >
          {/* COLUMNA 1 — MARCA */}
          <div>
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <div
                  className="relative w-10 h-10 rounded-xl overflow-hidden border"
                  style={{ borderColor: "var(--page-primary-30)" }}
                >
                  <Image
                    src={logoUrl}
                    alt={barberiaNombre || "Barbería"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="p-2.5 rounded-xl border flex items-center justify-center shadow-md"
                  style={{
                    backgroundColor: "var(--page-primary-15)",
                    borderColor: "var(--page-primary-30)",
                  }}
                >
                  <Scissors className="w-5 h-5" style={{ color: "var(--page-primary)" }} />
                </div>
              )}
              <span className="font-bold text-[var(--page-bg-foreground)] tracking-wider uppercase text-lg">
                {barberiaNombre}
              </span>
            </div>

            {descripcion && (
              <p className="mt-4 text-sm text-[var(--page-bg-foreground)]/60 leading-relaxed">
                {descripcion}
              </p>
            )}

            {(instagram || whatsapp) && (
              <div className="flex items-center gap-3 mt-5">
                {instagram && (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="group flex w-9 h-9 items-center justify-center rounded-full border transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--page-primary)]"
                    style={ESTILO_BOTON_SOCIAL}
                  >
                    <Instagram className="w-4 h-4 text-[var(--page-primary)] transition-colors group-hover:text-[var(--page-primary-foreground)]" />
                  </a>
                )}
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="group flex items-center gap-2 text-sm text-[var(--page-bg-foreground)]/70 hover:text-[var(--page-bg-foreground)] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" style={{ color: "var(--page-primary)" }} />
                    <span>{whatsapp}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* COLUMNA 2 — NAVEGACIÓN */}
          <div>
            <h3
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={ESTILO_TITULO_SECCION}
            >
              Navegación
            </h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="/"
                className="group flex items-center gap-2 text-sm text-[var(--page-bg-foreground)]/70 hover:text-[var(--page-bg-foreground)] hover:translate-x-1 transition-all"
              >
                <ChevronRight className="w-4 h-4" style={{ color: "var(--page-primary)" }} />
                Inicio
              </Link>
              <Link
                href="/#servicios"
                className="group flex items-center gap-2 text-sm text-[var(--page-bg-foreground)]/70 hover:text-[var(--page-bg-foreground)] hover:translate-x-1 transition-all"
              >
                <ChevronRight className="w-4 h-4" style={{ color: "var(--page-primary)" }} />
                Servicios
              </Link>
              <Link
                href="/#ubicacion"
                className="group flex items-center gap-2 text-sm text-[var(--page-bg-foreground)]/70 hover:text-[var(--page-bg-foreground)] hover:translate-x-1 transition-all"
              >
                <ChevronRight className="w-4 h-4" style={{ color: "var(--page-primary)" }} />
                Ubicación
              </Link>
              <Link
                href="/turno"
                className="group flex items-center gap-2 text-sm text-[var(--page-bg-foreground)]/70 hover:text-[var(--page-bg-foreground)] hover:translate-x-1 transition-all"
              >
                <ChevronRight className="w-4 h-4" style={{ color: "var(--page-primary)" }} />
                Turnos
              </Link>
            </nav>
          </div>

          {/* COLUMNA 3 — CONTACTO */}
          <div>
            <h3
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={ESTILO_TITULO_SECCION}
            >
              Contacto
            </h3>
            <div className="flex flex-col gap-4">
              {direccion && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={ESTILO_CAJA_ICONO}
                  >
                    <MapPin className="w-4 h-4" style={{ color: "var(--page-primary)" }} />
                  </div>
                  <span className="text-sm text-[var(--page-bg-foreground)]/70">
                    {direccion}
                    {ciudad ? `, ${ciudad}` : ""}
                  </span>
                </div>
              )}
              {telefono && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={ESTILO_CAJA_ICONO}
                  >
                    <Phone className="w-4 h-4" style={{ color: "var(--page-primary)" }} />
                  </div>
                  <a
                    href={`tel:${telefono}`}
                    className="text-sm text-[var(--page-bg-foreground)]/70 hover:text-[var(--page-bg-foreground)] transition-colors"
                  >
                    {telefono}
                  </a>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={ESTILO_CAJA_ICONO}
                  >
                    <Mail className="w-4 h-4" style={{ color: "var(--page-primary)" }} />
                  </div>
                  <a
                    href={`mailto:${email}`}
                    className="text-sm text-[var(--page-bg-foreground)]/70 hover:text-[var(--page-bg-foreground)] transition-colors"
                  >
                    {email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA 4 — LEGAL Y CRÉDITO */}
          <div>
            <h3
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={ESTILO_TITULO_SECCION}
            >
              Legal
            </h3>
            <div className="flex flex-col items-start gap-3">
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
        </motion.div>

        {/* BARRA INFERIOR */}
        <div
          className="mt-12 pt-6 border-t grid gap-4 sm:grid-cols-[1fr_auto_1fr] items-center justify-items-center"
          style={{
            borderColor: "color-mix(in srgb, var(--page-bg-foreground) 8%, transparent)",
          }}
        >
          <p className="text-xs text-[var(--page-bg-foreground)]/50 sm:justify-self-start sm:text-left text-center">
            {barberiaNombre
              ? `© ${anioActual} ${barberiaNombre}. Todos los derechos reservados.`
              : `© ${anioActual}. Todos los derechos reservados.`}
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
            <Code2 className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" style={{ color: "var(--primary)" }} />
            <span className="text-xs font-light tracking-wide text-[var(--page-bg-foreground)]/60">Creado por</span>
            <span className="text-xs font-bold tracking-wider uppercase" style={{ color: "var(--primary)" }}>Logabyte</span>
          </a>
          {localidad && (
            <p className="text-xs text-[var(--page-bg-foreground)]/50 sm:justify-self-end sm:text-right text-center">
              Barbería en {ciudad ?? localidad}.
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
