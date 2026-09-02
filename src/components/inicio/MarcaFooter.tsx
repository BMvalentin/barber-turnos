import { Instagram, MessageCircle, Scissors } from "lucide-react";
import Image from "next/image";
import type { MarcaFooterProps } from "@/components/inicio/footer-tipos";

export function MarcaFooter({ barberiaNombre, logoUrl, descripcion, instagram, whatsapp }: MarcaFooterProps) {
  return <div>
    <div className="flex items-center gap-3">
      {logoUrl ? <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-[var(--admin-border-fuerte)]"><Image src={logoUrl} alt={barberiaNombre || "Barbería"} fill className="object-cover" /></div> :
        <div className="flex items-center justify-center rounded-xl border border-[var(--admin-border-fuerte)] bg-[var(--page-primary-15)] p-2.5 shadow-md"><Scissors className="h-5 w-5 text-[var(--admin-texto-primario)]" /></div>}
      <span className="text-lg font-bold uppercase tracking-wider text-[var(--admin-texto-primario)]">{barberiaNombre}</span>
    </div>
    {descripcion && <p className="mt-4 text-sm leading-relaxed text-[var(--admin-texto-secundario)]">{descripcion}</p>}
    {(instagram || whatsapp) && <div className="mt-5 flex items-center gap-3">
      {instagram && <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="group flex h-9 w-9 items-center justify-center rounded-full border border-[var(--admin-border-fuerte)] bg-[var(--page-primary-15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--page-primary)]"><Instagram className="h-4 w-4 text-[var(--admin-texto-primario)] transition-colors group-hover:text-[var(--page-primary-foreground)]" /></a>}
      {whatsapp && <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex items-center gap-2 text-sm text-[var(--admin-texto-secundario)] transition-colors hover:text-[var(--admin-texto-primario)]"><MessageCircle className="h-4 w-4 shrink-0 text-[var(--page-primary-tinta)]" /><span>{whatsapp}</span></a>}
    </div>}
  </div>;
}
