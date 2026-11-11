import { unstable_cache } from "next/cache";
import { obtenerConfiguracionMP } from "@/lib/mercadopago/obtener-config";

type ConfiguracionMercadoPago = NonNullable<Awaited<ReturnType<typeof obtenerConfiguracionMP>>>;

function obtenerTexto(datos: Record<string, unknown>, clave: string): string | null {
  const valor = datos[clave];
  return typeof valor === "string" && valor.trim() ? valor.trim() : null;
}

function construirNombreCuenta(datos: Record<string, unknown>): string | null {
  const nombreNegocio = obtenerTexto(datos, "business_name");
  if (nombreNegocio) return nombreNegocio;

  const nombre = obtenerTexto(datos, "first_name");
  const apellido = obtenerTexto(datos, "last_name");
  const nombreCompleto = [nombre, apellido].filter(Boolean).join(" ");
  if (nombreCompleto) return nombreCompleto;

  return obtenerTexto(datos, "nickname");
}

/** Obtiene un nombre legible de la cuenta conectada sin exponer sus credenciales. */
export async function obtenerNombreCuentaMP(
  configuracionInicial?: ConfiguracionMercadoPago | null,
): Promise<string | null> {
  const configuracion = configuracionInicial === undefined
    ? await obtenerConfiguracionMP()
    : configuracionInicial;
  if (!configuracion?.conectado || !configuracion.mpUserId) return null;

  const obtenerNombreCacheado = unstable_cache(
    async (): Promise<string | null> => {
      try {
        const respuesta = await fetch("https://api.mercadopago.com/users/me", {
          headers: {
            Authorization: `Bearer ${configuracion.accessToken}`,
          },
          cache: "no-store",
        });

        if (!respuesta.ok) return null;

        const datos: unknown = await respuesta.json();
        if (!datos || typeof datos !== "object" || Array.isArray(datos)) return null;

        const datosObjeto = Object.fromEntries(Object.entries(datos));
        return construirNombreCuenta(datosObjeto);
      } catch {
        return null;
      }
    },
    ["mercadopago-nombre-cuenta-v1", configuracion.mpUserId],
    { tags: ["mercadopago-config"], revalidate: 60 },
  );
  return obtenerNombreCacheado();
}
