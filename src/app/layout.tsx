import type { Metadata } from "next";
import { cache } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutComponent from "@/components/LayoutComponent";
import { auth } from "@/auth";
import AppGate from "@/components/AppGate";
import { Toaster } from "@/components/ui/toaster";
import { getPageConfig } from "@/actions/configPage";

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

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LayoutComponent session={session} config={config}>
          <AppGate
            barberiaNombre={config?.name}
            logoUrl={config?.logo}
            primaryColor={config?.primaryColor}
            secondaryColor={config?.secondaryColor}
          >
            {children}
            <Toaster />
          </AppGate>
        </LayoutComponent>
      </body>
    </html>
  );
}