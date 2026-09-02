export interface FooterProps {
  openPrivacy: () => void;
  openTerms: () => void;
  barberiaNombre?: string | null;
  logoUrl?: string | null;
  descripcion?: string | null;
  localidad?: string | null;
  instagram?: string | null;
  whatsapp?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
}

export type MarcaFooterProps = Pick<FooterProps, "barberiaNombre" | "logoUrl" | "descripcion" | "instagram" | "whatsapp">;
export type ContactoFooterProps = Pick<FooterProps, "telefono" | "email" | "direccion" | "ciudad">;
export type LegalFooterProps = Pick<FooterProps, "openPrivacy" | "openTerms">;
