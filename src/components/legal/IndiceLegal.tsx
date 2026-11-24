import Link from "next/link";
import { ArrowRight, CalendarDays, FileText } from "lucide-react";
import { listarDocumentosLegales } from "@/lib/legal/documentos";

export default function IndiceLegal() {
  const documentos = listarDocumentosLegales();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-24 pb-12 sm:px-6 sm:pt-28 sm:pb-16">
      <header className="border-b border-[var(--page-separador)] pb-6">
        <div className="flex items-start gap-3">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-surface-elevated)]"
          >
            <FileText className="h-5 w-5 text-[var(--admin-texto-primario)]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--admin-texto-primario)] sm:text-3xl">
              Información legal
            </h1>
            <p className="mt-1 text-base leading-relaxed text-[var(--admin-texto-secundario)]">
              Documentos que regulan el uso del sitio y el tratamiento de tus datos.
            </p>
          </div>
        </div>
      </header>

      <ul className="mt-6 flex flex-col gap-3">
        {documentos.map((documento) => (
          <li key={documento.clave}>
            <Link
              href={`/legal/${documento.slug}`}
              className="control-publico flex items-start justify-between gap-3 rounded-lg bg-[var(--admin-surface)] p-4 transition-colors hover:bg-[var(--admin-item)] sm:gap-4 sm:p-5"
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
                className="mt-1 size-5 shrink-0 text-[var(--admin-texto-secundario)]"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
