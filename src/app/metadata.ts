import type { Metadata } from "next";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";

const TITULO_POR_DEFECTO = "Mayoraz - Turnos Barberia";
const DESCRIPCION_POR_DEFECTO =
  "Mayoraz - Reserva tu turno en línea de manera fácil y rápida. Santa clara, Buenos Aires.";
const ICONO_POR_DEFECTO = "/images/logopng.png";

export async function generateMetadata(): Promise<Metadata> {
  const config = await obtenerConfigCacheada();

  const title = config?.metaTitle || config?.name || TITULO_POR_DEFECTO;
  const description =
    config?.metaDescription || config?.description || DESCRIPCION_POR_DEFECTO;
  const icon = config?.favicon || ICONO_POR_DEFECTO;

  return {
    title,
    description,
    icons: {
      icon,
      shortcut: icon,
      apple: icon,
    },
    openGraph: {
      title,
      description,
      images: config?.logo ? [{ url: config.logo }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: config?.logo ? [config.logo] : [],
    },
  };
}
