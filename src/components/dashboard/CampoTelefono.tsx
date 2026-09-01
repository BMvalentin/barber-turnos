import { Phone } from "lucide-react";

const PREFIJOS = [
  ["🇦🇷", "+54 9"], ["🇺🇾", "+598"], ["🇨🇱", "+56"], ["🇧🇷", "+55"],
  ["🇵🇾", "+595"], ["🇧🇴", "+591"], ["🇺🇸", "+1"], ["🇪🇸", "+34"],
] as const;

type Propiedades = { prefijoInicial: string; telefonoInicial: string };

export default function CampoTelefono({ prefijoInicial, telefonoInicial }: Propiedades) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--page-primary-tinta)]">
        <Phone className="h-3.5 w-3.5" /> WhatsApp / Teléfono
      </label>
      <div className="flex overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] transition-colors focus-within:border-[var(--page-primary)] focus-within:ring-2 focus-within:ring-[var(--page-focus-ring)]">
        <div className="flex items-center border-r border-[var(--admin-border)] bg-[var(--page-primary-15)] px-2">
          <select name="prefix" defaultValue={prefijoInicial} className="cursor-pointer bg-transparent pr-2 text-sm font-bold text-[var(--admin-texto-primario)] outline-none">
            {PREFIJOS.map(([bandera, prefijo]) => (
              <option key={prefijo} value={prefijo} className="bg-[var(--admin-surface-elevated)] text-[var(--admin-texto-primario)]">{bandera} {prefijo}</option>
            ))}
          </select>
        </div>
        <input name="telefono" defaultValue={telefonoInicial} type="tel" required placeholder="11 1234-5678" className="w-full bg-transparent p-4 text-[var(--admin-texto-primario)] outline-none placeholder:text-[var(--admin-texto-muted)]" />
      </div>
    </div>
  );
}
