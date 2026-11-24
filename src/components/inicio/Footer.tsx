import { Code2 } from "lucide-react";
import { ContactoFooter } from "@/components/inicio/ContactoFooter";
import type { FooterProps } from "@/components/inicio/footer-tipos";
import { LegalFooter } from "@/components/inicio/LegalFooter";
import { MarcaFooter } from "@/components/inicio/MarcaFooter";
import { NavegacionFooter } from "@/components/inicio/NavegacionFooter";

export function Footer({ barberiaNombre, logoUrl, descripcion, localidad, instagram, whatsapp, telefono, email, direccion, ciudad }: FooterProps) {
  const anioActual = new Date().getFullYear();
  return (
    <footer className="relative w-full border-t border-[var(--page-separador)] bg-[var(--page-bg)] pt-10 pb-6 sm:pt-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1.1fr_1fr]">
          <MarcaFooter barberiaNombre={barberiaNombre} logoUrl={logoUrl} descripcion={descripcion} />
          <NavegacionFooter />
          <ContactoFooter direccion={direccion} ciudad={ciudad} telefono={telefono} email={email} whatsapp={whatsapp} instagram={instagram} />
          <LegalFooter />
        </div>
        <div className="mt-12 grid items-center justify-items-center gap-4 border-t border-[var(--page-separador)] pt-6 sm:grid-cols-[1fr_auto_1fr]">
          <p className="text-center text-xs text-[var(--admin-texto-muted)] sm:justify-self-start sm:text-left">
            {barberiaNombre ? `© ${anioActual} ${barberiaNombre}. Todos los derechos reservados.` : `© ${anioActual}. Todos los derechos reservados.`}
          </p>
          <a href="https://logabyte.com.ar" target="_blank" rel="noopener noreferrer" className="control-publico inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--admin-surface)] px-3 text-xs text-[var(--admin-texto-primario)] transition-colors hover:bg-[var(--admin-item)]">
            <Code2 className="size-4" aria-hidden="true" />
            <span>Creado por <strong className="font-semibold">Logabyte</strong></span>
          </a>
          {localidad && <p className="text-center text-xs text-[var(--admin-texto-muted)] sm:justify-self-end sm:text-right">Barbería en {ciudad ?? localidad}.</p>}
        </div>
      </div>
    </footer>
  );
}
