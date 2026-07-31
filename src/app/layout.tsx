import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutComponent from "@/components/LayoutComponent";
import { auth } from "@/auth";
import AppGate from "@/components/AppGate";
import { Toaster } from "@/components/ui/toaster";
import { prisma } from "@/lib/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mayoraz - Turnos Barberia",
  description: "Mayoraz - Reserva tu turno en línea de manera fácil y rápida. Santa clara, Buenos Aires.",
  icons: {
    icon: "/images/logopng.png",
    shortcut: "/images/logopng.png",
    apple: "/images/logopng.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const config = await prisma.pageConfig.findUnique({
    where: { id: 1 },
  });

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