import type { LegalFooterProps } from "@/components/inicio/footer-tipos";

export function LegalFooter({ openTerms, openPrivacy }: LegalFooterProps) {
  const claseBoton = "cursor-pointer border-none bg-transparent text-sm font-medium text-[var(--admin-texto-secundario)] transition-colors hover:text-[var(--admin-texto-primario)]";
  return <div><h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--page-primary-tinta)]">Legal</h3><div className="flex flex-col items-start gap-3">
    <button className={claseBoton} onClick={(evento) => { evento.preventDefault(); openTerms(); }}>Términos</button>
    <button className={claseBoton} onClick={(evento) => { evento.preventDefault(); openPrivacy(); }}>Privacidad</button>
  </div></div>;
}
