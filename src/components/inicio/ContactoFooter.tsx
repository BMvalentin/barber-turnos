import { Mail, MapPin, Phone } from "lucide-react";
import type { ContactoFooterProps } from "@/components/inicio/footer-tipos";

export function ContactoFooter({ direccion, ciudad, telefono, email }: ContactoFooterProps) {
  const claseCajaIcono = "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--page-primary-15)] text-[var(--admin-texto-primario)]";
  return <div><h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--page-primary-tinta)]">Contacto</h3><div className="flex flex-col gap-4">
    {direccion && <div className="flex items-center gap-3"><div className={claseCajaIcono}><MapPin className="h-4 w-4" /></div><span className="text-sm text-[var(--admin-texto-secundario)]">{direccion}{ciudad ? `, ${ciudad}` : ""}</span></div>}
    {telefono && <div className="flex items-center gap-3"><div className={claseCajaIcono}><Phone className="h-4 w-4" /></div><a href={`tel:${telefono}`} className="text-sm text-[var(--admin-texto-secundario)] transition-colors hover:text-[var(--admin-texto-primario)]">{telefono}</a></div>}
    {email && <div className="flex items-center gap-3"><div className={claseCajaIcono}><Mail className="h-4 w-4" /></div><a href={`mailto:${email}`} className="text-sm text-[var(--admin-texto-secundario)] transition-colors hover:text-[var(--admin-texto-primario)]">{email}</a></div>}
  </div></div>;
}
