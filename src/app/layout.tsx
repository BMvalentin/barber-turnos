import { Outfit } from "next/font/google";
import "./globals.css";
import LayoutComponent from "@/components/comunes/LayoutComponent";
import AppGate from "@/components/comunes/AppGate";
import { Toaster } from "sonner";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";
import { crearVariablesTema } from "@/lib/contraste/crear-variables-tema";
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

  const variablesTema = crearVariablesTema({
    primario: config?.primaryColor,
    secundario: config?.secondaryColor,
    fondo: config?.bgColor,
  });

  return (
    <html
      lang="es"
      style={
        {
          ...variablesTema,
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
