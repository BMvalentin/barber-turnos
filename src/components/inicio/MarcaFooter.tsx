import { Scissors } from "lucide-react";
import Image from "next/image";
import type { MarcaFooterProps } from "@/components/inicio/footer-tipos";

export function MarcaFooter({ barberiaNombre, logoUrl, descripcion }: MarcaFooterProps) {
  return <div>
    <div className="flex items-center gap-3">
      {logoUrl ? <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-[var(--admin-border-fuerte)]"><Image src={logoUrl} alt={barberiaNombre || "Barbería"} fill className="object-cover" /></div> :
        <div className="flex items-center justify-center rounded-xl border border-[var(--admin-border-fuerte)] bg-[var(--page-primary-15)] p-2.5 shadow-md"><Scissors className="h-5 w-5 text-[var(--admin-texto-primario)]" /></div>}
      <span className="text-lg font-bold uppercase tracking-wider text-[var(--admin-texto-primario)]">{barberiaNombre}</span>
    </div>
    {descripcion && <p className="mt-4 text-sm leading-relaxed text-[var(--admin-texto-secundario)]">{descripcion}</p>}
  </div>;
}
