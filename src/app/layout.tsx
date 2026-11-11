import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import LayoutComponent from "@/components/comunes/LayoutComponent";
import AppGate from "@/components/comunes/AppGate";
import { Toaster } from "sonner";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";
import { crearVariablesTema } from "@/lib/contraste/crear-variables-tema";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";

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
  const [config, session] = await Promise.all([
    obtenerConfigCacheada(),
    requerirSesion(),
  ]);

  const variablesTema = crearVariablesTema({
    primario: config?.primaryColor,
    secundario: config?.secondaryColor,
    fondo: config?.bgColor,
  });

  return (
    <html
      lang="es"
      suppressHydrationWarning
      style={
        {
          ...variablesTema,
        } as React.CSSProperties
      }
    >
      <body className={`${outfit.variable} antialiased`}>
        <Script id="preferencia-sidebar-admin" strategy="beforeInteractive">
          {`try {
            const clave = "mayoraz-sidebar-collapsed";
            const cookie = document.cookie.split("; ").find((entrada) => entrada.startsWith(clave + "="))?.split("=")[1];
            const guardado = localStorage.getItem(clave) ?? localStorage.getItem("admin-sidebar-collapsed");
            if (cookie === "1" || cookie === "0") {
              if (guardado !== cookie) localStorage.setItem(clave, cookie);
            } else if (guardado === "1" || guardado === "0") {
              if (guardado === "1") document.documentElement.dataset.adminSidebarColapsadoInicial = "true";
              document.cookie = clave + "=" + guardado + "; Path=/; Max-Age=31536000; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : "");
            }
          } catch {}`}
        </Script>
        <LayoutComponent
          session={session}
          config={{ name: config?.name, logo: config?.logo }}
        >
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
