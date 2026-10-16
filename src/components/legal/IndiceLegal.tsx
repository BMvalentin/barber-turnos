import Link from "next/link";
import { ArrowRight, CalendarDays, FileText } from "lucide-react";
import { listarDocumentosLegales } from "@/lib/legal/documentos";

export default function IndiceLegal() {
  const documentos = listarDocumentosLegales();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <header className="border-b border-[var(--admin-border)] pb-6">
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "var(--page-primary-15)" }}
          >
            <FileText className="h-5 w-5 text-[var(--admin-texto-primario)]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--admin-texto-primario)] sm:text-3xl">
              Información legal
            </h1>
            <p className="mt-1 text-sm text-[var(--admin-texto-secundario)]">
              Documentos que regulan el uso del sitio y el tratamiento de tus datos.
            </p>
          </div>
        </div>
      </header>

      <ul className="mt-8 flex flex-col gap-4">
        {documentos.map((documento) => (
          <li key={documento.clave}>
            <Link
              href={`/legal/${documento.slug}`}
              className="group flex items-start justify-between gap-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 transition-colors hover:border-[var(--admin-border-fuerte)] hover:bg-[var(--admin-item)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-background)]"
            >
              <div>
                <h2 className="text-base font-bold text-[var(--admin-texto-primario)]">
                  {documento.titulo}
                </h2>
                <p className="mt-1 text-sm text-[var(--admin-texto-secundario)]">
                  {documento.descripcion}
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--admin-texto-muted)]">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  Versión {documento.version}
                </p>
              </div>
              <ArrowRight
                className="mt-1 h-5 w-5 shrink-0 text-[var(--page-primary-tinta)] transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
