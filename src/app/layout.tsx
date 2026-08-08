import type { Metadata } from "next";
import { cache } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutComponent from "@/components/LayoutComponent";
import { auth } from "@/auth";
import AppGate from "@/components/AppGate";
import { Toaster } from "@/components/ui/toaster";
import { getPageConfig } from "@/actions/configPage";
import { elegirColorTexto, obtenerTintaLejible } from "@/lib/contraste";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DEFAULT_TITLE = "Mayoraz - Turnos Barberia";
const DEFAULT_DESCRIPTION =
  "Mayoraz - Reserva tu turno en línea de manera fácil y rápida. Santa clara, Buenos Aires.";
const DEFAULT_ICON = "/images/logopng.png";

// cache() evita repetir la query: generateMetadata y RootLayout la comparten
const getCachedPageConfig = cache(async () => await getPageConfig());

export async function generateMetadata(): Promise<Metadata> {
  const config = await getCachedPageConfig();

  const title = config?.metaTitle || config?.name || DEFAULT_TITLE;
  const description =
    config?.metaDescription || config?.description || DEFAULT_DESCRIPTION;
  const icon = config?.favicon || DEFAULT_ICON;

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const config = await getCachedPageConfig();

  // Defaults de color: la fuente única es :root en globals.css
  const PRIMARIO_POR_DEFECTO = "#d97706";
  const SECUNDARIO_POR_DEFECTO = "#78350f";
  const colorPrimario = config?.primaryColor ?? PRIMARIO_POR_DEFECTO;
  const colorSecundario = config?.secondaryColor ?? SECUNDARIO_POR_DEFECTO;
  const colorTextoPrimario = elegirColorTexto(colorPrimario);
  const colorTextoSecundario = elegirColorTexto(colorSecundario);
  const tintaPrimaria = obtenerTintaLejible(colorPrimario);
  const tintaSecundaria = obtenerTintaLejible(colorSecundario);

  return (
    <html
      lang="es"
      style={
        {
          "--page-primary": config?.primaryColor,
          "--page-secondary": config?.secondaryColor,
          "--page-primary-foreground": colorTextoPrimario,
          "--page-secondary-foreground": colorTextoSecundario,
          "--page-primary-tinta": tintaPrimaria,
          "--page-secondary-tinta": tintaSecundaria,
        } as React.CSSProperties
      }
    >
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LayoutComponent session={session} config={config}>
          <AppGate
            barberiaNombre={config?.name}
            logoUrl={config?.logo}
            isAdmin={session?.user?.role === "ADMIN"}
          >
            {children}
            <Toaster />
          </AppGate>
        </LayoutComponent>
      </body>
    </html>
  );
}