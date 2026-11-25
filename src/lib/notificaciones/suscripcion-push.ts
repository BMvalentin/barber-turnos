import { createHash, ECDH } from "node:crypto";
import { z } from "zod";

export const endpointPush = z.string().max(2048).refine((valor) => {
  if (!URL.canParse(valor)) return false;
  const url = new URL(valor);
  if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash) return false;

  // Solo los servicios de push de Chrome, Firefox, Safari y Edge pueden recibir solicitudes.
  const { hostname, pathname } = url;
  return (
    (hostname === "fcm.googleapis.com" && /^\/fcm\/send\/[^/]+$/.test(pathname)) ||
    (hostname === "updates.push.services.mozilla.com" && /^\/wpush\/v\d+\/[^/]+$/.test(pathname)) ||
    (hostname === "web.push.apple.com" && pathname !== "/") ||
    (/^wns[\w-]*\.notify\.windows\.com$/.test(hostname) && pathname === "/w/" && url.searchParams.has("token"))
  );
}).transform((valor) => new URL(valor).href);

const claveP256 = z.string().regex(/^[\w-]{87}$/).refine((valor) => {
  try {
    const clave = Buffer.from(valor, "base64url");
    return clave[0] === 4 && ECDH.convertKey(clave, "prime256v1").toString("base64url") === valor;
  } catch {
    return false;
  }
});

export const suscripcionPush = z.object({
  endpoint: endpointPush,
  keys: z.object({
    p256dh: claveP256,
    auth: z.string().regex(/^[\w-]{22}$/).refine((valor) => Buffer.from(valor, "base64url").toString("base64url") === valor),
  }),
});

export function obtenerHashEndpoint(endpoint: string): string {
  return createHash("sha256").update(endpoint).digest("hex");
}
