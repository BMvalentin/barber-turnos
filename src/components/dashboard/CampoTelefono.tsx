import { ChevronDown, Phone } from "lucide-react";
import { useId, type ChangeEvent } from "react";

const PREFIJOS = [
  ["🇦🇷", "+54 9"], ["🇺🇾", "+598"], ["🇨🇱", "+56"], ["🇧🇷", "+55"],
  ["🇵🇾", "+595"], ["🇧🇴", "+591"], ["🇺🇸", "+1"], ["🇪🇸", "+34"],
] as const;
const MAX_DIGITOS_TELEFONO = 21;

type Propiedades = { prefijoInicial: string; telefonoInicial: string };

function conservarSoloDigitos(evento: ChangeEvent<HTMLInputElement>) {
  const entrada = evento.currentTarget;
  const valor = entrada.value;
  const digitos = valor.replace(/\D/g, "").slice(0, MAX_DIGITOS_TELEFONO);
  if (valor === digitos) return;

  const posicion = entrada.selectionStart;
  const posicionNormalizada = posicion === null
    ? digitos.length
    : Math.min(
      valor.slice(0, posicion).replace(/\D/g, "").length,
      digitos.length,
    );

  entrada.value = digitos;
  entrada.setSelectionRange(posicionNormalizada, posicionNormalizada);
}

export default function CampoTelefono({ prefijoInicial, telefonoInicial }: Propiedades) {
  const idTelefono = useId();
  const telefonoNormalizado = telefonoInicial
    .replace(/\D/g, "")
    .slice(0, MAX_DIGITOS_TELEFONO);
  const prefijoGuardado = PREFIJOS.some(([, prefijo]) => prefijo === prefijoInicial);

  return (
    <div className="min-w-0 space-y-2">
      <label htmlFor={idTelefono} className="flex items-center gap-2 text-sm font-semibold text-[var(--admin-texto-primario)]">
        <Phone className="size-4 text-[var(--page-primary-tinta)]" aria-hidden="true" /> WhatsApp / Teléfono
      </label>
      <div className="flex rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)]">
        <div className="relative flex shrink-0 items-center border-r border-[var(--admin-border)]">
          <select
            name="prefix"
            defaultValue={prefijoInicial}
            aria-label="Prefijo telefónico"
            autoComplete="tel-country-code"
            className="min-h-12 appearance-none rounded-l-md bg-[var(--admin-surface-elevated)] py-2 pl-2.5 pr-8 text-sm font-semibold text-[var(--admin-texto-primario)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--page-focus-ring)]"
          >
            {!prefijoGuardado && <option value={prefijoInicial}>{prefijoInicial}</option>}
            {PREFIJOS.map(([bandera, prefijo]) => (
              <option key={prefijo} value={prefijo}>{bandera} {prefijo}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-[var(--admin-texto-secundario)]" aria-hidden="true" />
        </div>
        <input
          id={idTelefono}
          name="telefono"
          defaultValue={telefonoNormalizado}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          pattern="[0-9]*"
          maxLength={MAX_DIGITOS_TELEFONO}
          onChange={conservarSoloDigitos}
          required
          placeholder="1112345678"
          className="min-h-12 min-w-0 flex-1 rounded-r-md bg-transparent px-3 py-2 text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--page-focus-ring)]"
        />
      </div>
    </div>
  );
}
