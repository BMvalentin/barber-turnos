import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutComponent from "@/components/LayoutComponent";
import { auth} from "@/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🚗 Lavadero Reservas",
  description: "Lavadero de autos - Reserva tu turno en línea de manera fácil y rápida. Santa clara, Buenos Aires.",
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
        <LayoutComponent session={session} children={children}/>
      </body>
    </html>
  );
}
