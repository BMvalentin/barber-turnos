import Link from "next/link";
import { AlertTriangle, ArrowLeft, CalendarDays, FileText, Tag } from "lucide-react";
import type { DocumentoLegal, ResponsableLegal } from "@/lib/legal/tipos";
import { listarDocumentosLegales } from "@/lib/legal/documentos";

const VALOR_PENDIENTE = "PENDIENTE DE DEFINICIÓN";

function formatearUbicacion(datos: ResponsableLegal): string | null {
  const partes = [datos.direccion, datos.ciudad, datos.provincia, datos.pais]
    .map((parte) => parte?.trim())
    .filter((parte): parte is string => Boolean(parte));
  return partes.length > 0 ? partes.join(", ") : null;
}

function formatearFechaIso(fechaIso: string): string {
  const fecha = new Date(`${fechaIso}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return fechaIso;
  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function DatoResponsable({ etiqueta, valor }: { etiqueta: string; valor: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--page-primary-tinta)]">
        {etiqueta}
      </dt>
      <dd
        className={
          valor
            ? "text-sm text-[var(--admin-texto-secundario)]"
            : "text-sm font-semibold text-[var(--admin-texto-muted)]"
        }
      >
        {valor ?? VALOR_PENDIENTE}
      </dd>
    </div>
  );
}

export default function ContenidoDocumentoLegal({
  documento,
  responsable,
}: {
  documento: DocumentoLegal;
  responsable: ResponsableLegal;
}) {
  const otrosDocumentos = listarDocumentosLegales().filter(
    (otro) => otro.clave !== documento.clave,
  );

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <Link
        href="/legal"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--admin-texto-muted)] transition-colors hover:text-[var(--admin-texto-primario)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-background)] rounded"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a información legal
      </Link>

      <header className="mt-6 border-b border-[var(--admin-border)] pb-6">
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "var(--page-primary-15)" }}
          >
            <FileText className="h-5 w-5 text-[var(--admin-texto-primario)]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--admin-texto-primario)] sm:text-3xl">
              {documento.titulo}
            </h1>
            <p className="mt-1 text-sm text-[var(--admin-texto-secundario)]">
              {documento.descripcion}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border-fuerte)] bg-[var(--page-primary-15)] px-3 py-1 text-xs font-semibold text-[var(--admin-texto-primario)]">
            <Tag className="h-3.5 w-3.5" aria-hidden="true" />
            Versión {documento.version}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border-fuerte)] bg-[var(--page-primary-15)] px-3 py-1 text-xs font-semibold text-[var(--admin-texto-primario)]">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Vigente desde {formatearFechaIso(documento.vigenteDesde)}
          </span>
        </div>
      </header>

      <div
        role="note"
        className="mt-6 flex items-start gap-3 rounded-xl border border-[var(--admin-border-fuerte)] bg-[var(--page-primary-15)] p-4"
      >
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--page-primary-tinta)]"
          aria-hidden="true"
        />
        <p className="text-xs leading-relaxed text-[var(--admin-texto-secundario)]">
          Este documento es un borrador adaptado al funcionamiento real de la aplicación y{" "}
          <strong className="font-semibold text-[var(--admin-texto-primario)]">
            se encuentra pendiente de revisión jurídica
          </strong>
          . Los aspectos que no puedan determinarse figuran expresamente como «PENDIENTE DE
          DEFINICIÓN» y no constituyen condiciones confirmadas.
        </p>
      </div>

      <section className="mt-8 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--admin-texto-primario)]">
          Responsable del sitio
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <DatoResponsable etiqueta="Nombre / razón social" valor={responsable.nombre ?? null} />
          <DatoResponsable etiqueta="Correo de contacto" valor={responsable.email ?? null} />
          <DatoResponsable etiqueta="Teléfono" valor={responsable.telefono ?? null} />
          <DatoResponsable etiqueta="Domicilio" valor={formatearUbicacion(responsable)} />
        </dl>
      </section>

      <div className="mt-8 space-y-8">
        {documento.secciones.map((seccion) => (
          <section key={seccion.titulo}>
            <h2 className="text-base font-bold text-[var(--admin-texto-primario)]">
              {seccion.titulo}
            </h2>
            <div className="mt-2 space-y-3">
              {seccion.parrafos.map((parrafo, indice) => (
                <p
                  key={`${seccion.titulo}-${indice}`}
                  className="text-sm leading-relaxed text-[var(--admin-texto-secundario)]"
                >
                  {parrafo}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {documento.pendientes.length > 0 && (
        <section className="mt-10 rounded-2xl border border-[var(--admin-border-fuerte)] bg-[var(--admin-surface)] p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--page-primary-tinta)]">
            Puntos pendientes de definición
          </h2>
          <ul className="mt-3 space-y-2">
            {documento.pendientes.map((pendiente) => (
              <li
                key={pendiente}
                className="flex items-start gap-2 text-sm leading-relaxed text-[var(--admin-texto-secundario)]"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--page-primary)]"
                  aria-hidden="true"
                />
                {pendiente}
              </li>
            ))}
          </ul>
        </section>
      )}

      {otrosDocumentos.length > 0 && (
        <nav
          aria-label="Otros documentos legales"
          className="mt-10 border-t border-[var(--admin-border)] pt-6"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--admin-texto-muted)]">
            Otros documentos
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {otrosDocumentos.map((otro) => (
              <li key={otro.clave}>
                <Link
                  href={`/legal/${otro.slug}`}
                  className="text-sm font-medium text-[var(--page-primary-tinta)] underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-background)] rounded"
                >
                  {otro.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </article>
  );
}
