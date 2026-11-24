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
      <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--page-primary-tinta)]">
        Legal
      </h3>
      <nav aria-label="Documentos legales" className="flex flex-col items-start">
        {enlaces.map((enlace) => (
          <Link
            key={enlace.href}
            href={enlace.href}
            className="control-publico flex min-h-11 items-center rounded-md py-1 text-sm font-medium text-[var(--admin-texto-secundario)] underline-offset-4 hover:text-[var(--admin-texto-primario)] hover:underline"
          >
            {enlace.texto}
          </Link>
        ))}
      </nav>
    </div>
  );
}
