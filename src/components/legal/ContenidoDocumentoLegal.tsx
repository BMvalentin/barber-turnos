import Link from "next/link";
import { ArrowLeft, CalendarDays, FileText, Tag } from "lucide-react";
import type { DocumentoLegal } from "@/lib/legal/tipos";
import { listarDocumentosLegales } from "@/lib/legal/documentos";

function formatearFechaIso(fechaIso: string): string {
  const fecha = new Date(`${fechaIso}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return fechaIso;
  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function ContenidoDocumentoLegal({
  documento,
}: {
  documento: DocumentoLegal;
}) {
  const otrosDocumentos = listarDocumentosLegales().filter(
    (otro) => otro.clave !== documento.clave,
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-20 pb-12 sm:px-6 sm:pt-24 sm:pb-16">
      <Link
        href="/legal"
        className="control-publico inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium text-[var(--admin-texto-secundario)] underline-offset-4 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a información legal
      </Link>

      <header className="mt-4 border-b border-[var(--page-separador)] pb-6">
        <div className="flex items-start gap-3">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-surface-elevated)]"
          >
            <FileText className="h-5 w-5 text-[var(--admin-texto-primario)]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--admin-texto-primario)] sm:text-3xl">
              {documento.titulo}
            </h1>
            <p className="mt-1 text-base leading-relaxed text-[var(--admin-texto-secundario)]">
              {documento.descripcion}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--admin-surface-elevated)] px-3 py-1 text-xs font-semibold text-[var(--admin-texto-primario)]">
            <Tag className="h-3.5 w-3.5" aria-hidden="true" />
            Versión {documento.version}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--admin-surface-elevated)] px-3 py-1 text-xs font-semibold text-[var(--admin-texto-primario)]">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Vigente desde {formatearFechaIso(documento.vigenteDesde)}
          </span>
        </div>
      </header>

      <article className="mt-8 max-w-[70ch] space-y-8">
        {documento.secciones.map((seccion) => (
          <section key={seccion.titulo}>
            <h2 className="text-lg font-bold text-[var(--admin-texto-primario)]">
              {seccion.titulo}
            </h2>
            <div className="mt-2 space-y-3">
              {seccion.parrafos.map((parrafo, indice) => (
                <p
                  key={`${seccion.titulo}-${indice}`}
                  className="wrap-anywhere text-base leading-relaxed text-[var(--admin-texto-secundario)]"
                >
                  {parrafo}
                </p>
              ))}
            </div>
          </section>
        ))}
      </article>

      {otrosDocumentos.length > 0 && (
        <nav
          aria-label="Otros documentos legales"
          className="mt-10 border-t border-[var(--page-separador)] pt-6"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--admin-texto-muted)]">
            Otros documentos
          </h2>
          <ul className="mt-2 flex flex-col">
            {otrosDocumentos.map((otro) => (
              <li key={otro.clave}>
                <Link
                  href={`/legal/${otro.slug}`}
                  className="control-publico inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-[var(--page-primary-tinta)] underline decoration-current/50 underline-offset-4 hover:decoration-current"
                >
                  {otro.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </main>
  );
}
