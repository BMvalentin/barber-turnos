import { Scissors } from "lucide-react";
import Image from "next/image";
import type { MarcaFooterProps } from "@/components/inicio/footer-tipos";

export function MarcaFooter({ barberiaNombre, logoUrl, descripcion }: MarcaFooterProps) {
  return <div className="min-w-0 [overflow-wrap:anywhere]">
    <div className="flex items-center gap-3">
      {logoUrl ? <div className="relative size-10 shrink-0 overflow-hidden rounded-lg"><Image src={logoUrl} alt="" fill sizes="40px" className="object-cover" /></div> :
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--page-primary-soft)] text-[var(--tema-primario-suave-texto)]"><Scissors className="size-5" aria-hidden="true" /></div>}
      <span className="text-lg font-bold uppercase tracking-wider text-[var(--admin-texto-primario)]">{barberiaNombre}</span>
    </div>
    {descripcion && <p className="mt-4 text-sm leading-relaxed text-[var(--admin-texto-secundario)]">{descripcion}</p>}
  </div>;
}
