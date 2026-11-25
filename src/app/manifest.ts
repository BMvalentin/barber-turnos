import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { normalizarColoresTema } from "@/lib/contraste/normalizar-colores-tema";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  await connection();
  const config = await obtenerConfigCacheada();
  const { fondo } = normalizarColoresTema({ fondo: config?.bgColor });

  return {
    id: "/",
    name: config?.name?.trim() || "Mayoraz Barbería",
    lang: "es",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: fondo,
    theme_color: fondo,
    icons: [
      { src: "/images/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/images/app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
