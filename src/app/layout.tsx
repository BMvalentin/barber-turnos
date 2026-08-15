import { Outfit } from "next/font/google";
import "./globals.css";
import LayoutComponent from "@/components/comunes/LayoutComponent";
import AppGate from "@/components/comunes/AppGate";
import { Toaster } from "sonner";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";
import { elegirColorTexto } from "@/lib/contraste/elegir-color-texto";
import { obtenerTintaLejible } from "@/lib/contraste/obtener-tinta-lejible";
import { auth } from "@/auth";

const outfit = Outfit({
  variable: "--font-outfit",
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
  const session = await auth();

  // Defaults de color: la fuente única es :root en globals.css
  const PRIMARIO_POR_DEFECTO = "#d97706";
  const SECUNDARIO_POR_DEFECTO = "#78350f";
  const FONDO_POR_DEFECTO = "#09090b";
  const colorPrimario = config?.primaryColor ?? PRIMARIO_POR_DEFECTO;
  const colorSecundario = config?.secondaryColor ?? SECUNDARIO_POR_DEFECTO;
  const colorFondo = config?.bgColor ?? FONDO_POR_DEFECTO;
  const colorTextoPrimario = elegirColorTexto(colorPrimario);
  const colorTextoSecundario = elegirColorTexto(colorSecundario);
  const colorTextoFondo = elegirColorTexto(colorFondo);
  const tintaPrimaria = obtenerTintaLejible(colorPrimario);
  const tintaSecundaria = obtenerTintaLejible(colorSecundario);
  const tintaFondo = obtenerTintaLejible(colorFondo);

  return (
    <html
      lang="es"
      style={
        {
          "--page-primary": config?.primaryColor,
          "--page-secondary": config?.secondaryColor,
          "--page-bg": config?.bgColor,
          "--page-primary-foreground": colorTextoPrimario,
          "--page-secondary-foreground": colorTextoSecundario,
          "--page-bg-foreground": colorTextoFondo,
          "--page-primary-tinta": tintaPrimaria,
          "--page-secondary-tinta": tintaSecundaria,
          "--page-bg-tinta": tintaFondo,
        } as React.CSSProperties
      }
    >
      <body className={`${outfit.variable} antialiased`}>
        <LayoutComponent session={session} config={config}>
          <AppGate
            barberiaNombre={config?.name}
            logoUrl={config?.logo}
            descripcion={config?.description}
            localidad={config?.city}
            instagram={config?.instagram}
            whatsapp={config?.whatsapp}
            telefono={config?.phone}
            email={config?.email}
            direccion={config?.address}
            ciudad={config?.city}
          >
            {children}
            <Toaster
              position="bottom-right"
              richColors
              closeButton
              theme="dark"
              toastOptions={{ duration: 4000 }}
              style={
                {
                  "--normal-bg": "var(--page-bg)",
                  "--normal-border":
                    "color-mix(in srgb, var(--page-bg-foreground) 15%, transparent)",
                  "--normal-text": "var(--page-bg-foreground)",
                  "--width": "22rem",
                } as React.CSSProperties
              }
            />
          </AppGate>
        </LayoutComponent>
      </body>
    </html>
  );
}
