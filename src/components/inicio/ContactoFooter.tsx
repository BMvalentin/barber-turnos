import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { ContactoFooterProps } from "@/components/inicio/footer-tipos";

export function ContactoFooter({ direccion, ciudad, telefono, email, whatsapp, instagram }: ContactoFooterProps) {
  if (!direccion && !telefono && !email && !whatsapp && !instagram) return null;

  const claseCajaIcono = "grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--page-primary-soft)] text-[var(--tema-primario-suave-texto)]";
  const claseEnlace = "control-publico flex min-h-11 min-w-0 items-center rounded-md py-1 text-sm text-[var(--admin-texto-secundario)] underline-offset-4 [overflow-wrap:anywhere] hover:text-[var(--admin-texto-primario)] hover:underline";
  return <div className="min-w-0"><h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--page-primary-tinta)]">Contacto</h3><div className="flex flex-col">
    {whatsapp && <div className="flex items-center gap-3"><div className={claseCajaIcono}><MessageCircle className="size-4" aria-hidden="true" /></div><a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp: ${whatsapp}`} className={claseEnlace}>{whatsapp}</a></div>}
    {telefono && <div className="flex items-center gap-3"><div className={claseCajaIcono}><Phone className="size-4" aria-hidden="true" /></div><a href={`tel:${telefono}`} className={claseEnlace}>{telefono}</a></div>}
    {direccion && <div className="flex min-h-11 items-center gap-3 py-1"><div className={claseCajaIcono}><MapPin className="size-4" aria-hidden="true" /></div><span className="min-w-0 text-sm text-[var(--admin-texto-secundario)] [overflow-wrap:anywhere]">{direccion}{ciudad ? `, ${ciudad}` : ""}</span></div>}
    {email && <div className="flex items-center gap-3"><div className={claseCajaIcono}><Mail className="size-4" aria-hidden="true" /></div><a href={`mailto:${email}`} className={claseEnlace}>{email}</a></div>}
    {instagram && <div className="flex items-center gap-3"><div className={claseCajaIcono}><Instagram className="size-4" aria-hidden="true" /></div><a href={instagram} target="_blank" rel="noopener noreferrer" className={claseEnlace}>Instagram</a></div>}
  </div></div>;
}
