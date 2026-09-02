"use client";

import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import { ContactoFooter } from "@/components/inicio/ContactoFooter";
import type { FooterProps } from "@/components/inicio/footer-tipos";
import { LegalFooter } from "@/components/inicio/LegalFooter";
import { MarcaFooter } from "@/components/inicio/MarcaFooter";
import { NavegacionFooter } from "@/components/inicio/NavegacionFooter";

export function Footer({ openPrivacy, openTerms, barberiaNombre, logoUrl, descripcion, localidad, instagram, whatsapp, telefono, email, direccion, ciudad }: FooterProps) {
  const anioActual = new Date().getFullYear();
  return (
    <footer className="relative z-10 w-full border-t border-[var(--admin-border)] bg-[var(--page-bg)] pb-6 pt-14">
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--page-primary)]/60 to-transparent" />
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="grid gap-10 md:gap-8 lg:grid-cols-[1.4fr_0.8fr_1.1fr_1fr]">
          <MarcaFooter barberiaNombre={barberiaNombre} logoUrl={logoUrl} descripcion={descripcion} instagram={instagram} whatsapp={whatsapp} />
          <NavegacionFooter />
          <ContactoFooter direccion={direccion} ciudad={ciudad} telefono={telefono} email={email} />
          <LegalFooter openTerms={openTerms} openPrivacy={openPrivacy} />
        </motion.div>
        <div className="mt-12 grid items-center justify-items-center gap-4 border-t border-[var(--admin-border)] pt-6 sm:grid-cols-[1fr_auto_1fr]">
          <p className="text-center text-xs text-[var(--admin-texto-muted)] sm:justify-self-start sm:text-left">
            {barberiaNombre ? `© ${anioActual} ${barberiaNombre}. Todos los derechos reservados.` : `© ${anioActual}. Todos los derechos reservados.`}
          </p>
          <a href="https://logabyte.com.ar" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 rounded-full border border-[var(--admin-border-fuerte)] bg-[var(--page-primary-15)] px-4 py-1.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--page-primary)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--page-focus-ring)]">
            <Code2 className="h-3.5 w-3.5 text-[var(--admin-texto-primario)] transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:text-[var(--page-primary-foreground)]" />
            <span className="text-xs font-light tracking-wide text-[var(--admin-texto-secundario)] group-hover:text-[var(--page-primary-foreground)]">Creado por</span>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--admin-texto-primario)] group-hover:text-[var(--page-primary-foreground)]">Logabyte</span>
          </a>
          {localidad && <p className="text-center text-xs text-[var(--admin-texto-muted)] sm:justify-self-end sm:text-right">Barbería en {ciudad ?? localidad}.</p>}
        </div>
      </div>
    </footer>
  );
}
