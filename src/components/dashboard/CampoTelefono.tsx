import { Phone } from "lucide-react";
import SelectorDesplegable from "@/components/ui/SelectorDesplegable";
import type { OpcionDesplegable } from "@/components/ui/SelectorDesplegable";

const PREFIJOS = [
  ["🇦🇷", "+54 9"], ["🇺🇾", "+598"], ["🇨🇱", "+56"], ["🇧🇷", "+55"],
  ["🇵🇾", "+595"], ["🇧🇴", "+591"], ["🇺🇸", "+1"], ["🇪🇸", "+34"],
] as const;

type Propiedades = { prefijoInicial: string; telefonoInicial: string };

export default function CampoTelefono({ prefijoInicial, telefonoInicial }: Propiedades) {
  const opcionesPrefijo: OpcionDesplegable<string>[] = PREFIJOS.map(([bandera, prefijo]) => ({
    valor: prefijo,
    etiqueta: `${bandera} ${prefijo}`,
  }));

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--page-primary-tinta)]">
        <Phone className="h-3.5 w-3.5" /> WhatsApp / Teléfono
      </label>
      <div className="flex rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] transition-colors focus-within:border-[var(--page-primary)] focus-within:ring-2 focus-within:ring-[var(--page-focus-ring)]">
        <div className="flex items-center border-r border-[var(--admin-border)] bg-[var(--page-primary-15)] px-2">
          <SelectorDesplegable
            name="prefix"
            opciones={opcionesPrefijo}
            valorInicial={prefijoInicial}
            etiquetaAria="Prefijo telefónico"
            className="w-auto shrink-0"
            claseBoton="h-auto w-auto min-w-0 rounded-none border-0 bg-transparent px-2 py-0 text-sm font-bold text-[var(--admin-texto-primario)] hover:bg-transparent focus-visible:ring-inset"
          />
        </div>
        <input name="telefono" defaultValue={telefonoInicial} type="tel" required placeholder="11 1234-5678" className="w-full bg-transparent p-4 text-[var(--admin-texto-primario)] outline-none placeholder:text-[var(--admin-texto-muted)]" />
      </div>
    </div>
  );
}
