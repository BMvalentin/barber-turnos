import Link from "next/link";
import { listarDocumentosLegales } from "@/lib/legal/documentos";

export function LegalFooter() {
  const documentos = listarDocumentosLegales();
  const enlaces = documentos.map((documento) => ({
    href: `/legal/${documento.slug}`,
    texto: documento.clave === "pagos" ? "Pagos y cancelaciones" : documento.titulo,
  }));

  return (
    <div>
      <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--page-primary-tinta)]">
        Legal
      </h3>
      <nav className="flex flex-col items-start gap-3">
        {enlaces.map((enlace) => (
          <Link
            key={enlace.href}
            href={enlace.href}
            className="text-sm font-medium text-[var(--admin-texto-secundario)] transition-colors hover:text-[var(--admin-texto-primario)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-background)] rounded"
          >
            {enlace.texto}
          </Link>
        ))}
      </nav>
    </div>
  );
}
