import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutComponent from "@/components/LayoutComponent";
import { auth } from "@/auth";
import AppGate from "@/components/AppGate";
import { Toaster } from "@/components/ui/toaster";

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

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Pasa sesión al componente de cliente */}
        <LayoutComponent session={session}>
          <AppGate>
            {children}
            <Toaster />
          </AppGate>
        </LayoutComponent>
      </body>
    </html>
  );
}
