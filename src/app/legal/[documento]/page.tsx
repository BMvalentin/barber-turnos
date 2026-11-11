import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContenidoDocumentoLegal from "@/components/legal/ContenidoDocumentoLegal";
import { listarDocumentosLegales, obtenerDocumentoLegalPorSlug } from "@/lib/legal/documentos";

type Props = {
  params: Promise<{ documento: string }>;
};

export function generateStaticParams() {
  return listarDocumentosLegales().map((documento) => ({ documento: documento.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { documento: slug } = await params;
  const documento = obtenerDocumentoLegalPorSlug(slug);
  if (!documento) return { title: "Documento no encontrado" };

  return {
    title: documento.titulo,
    description: documento.descripcion,
  };
}

export default async function PaginaDocumentoLegal({ params }: Props) {
  const { documento: slug } = await params;
  const documento = obtenerDocumentoLegalPorSlug(slug);
  if (!documento) notFound();

  return <ContenidoDocumentoLegal documento={documento} />;
}
