import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import LayoutComponent from "@/components/comunes/LayoutComponent";
import AppGate from "@/components/comunes/AppGate";
import { Toaster } from "@/components/ui/toaster";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";
import { elegirColorTexto } from "@/lib/contraste/elegir-color-texto";
import { obtenerTintaLejible } from "@/lib/contraste/obtener-tinta-lejible";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export { generateMetadata } from "./metadata";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await obtenerConfigCacheada();

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
      <body className={`${outfit.variable} ${playfair.variable} antialiased`}>
        <LayoutComponent session={null} config={config}>
          <AppGate barberiaNombre={config?.name} logoUrl={config?.logo}>
            {children}
            <Toaster />
          </AppGate>
        </LayoutComponent>
      </body>
    </html>
  );
}
