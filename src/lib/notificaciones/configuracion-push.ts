import { createECDH } from "node:crypto";
import { z } from "zod";

const configuracion = z.object({
  publicKey: z.string().regex(/^[\w-]{87}$/),
  privateKey: z.string().regex(/^[\w-]{43}$/),
  subject: z.string().startsWith("mailto:").refine((valor) => z.email().safeParse(valor.slice(7)).success),
});

export function obtenerConfiguracionPush() {
  const resultado = configuracion.safeParse({
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
    subject: process.env.VAPID_SUBJECT,
  });
  if (!resultado.success) return null;

  const claves = createECDH("prime256v1");
  try {
    claves.setPrivateKey(Buffer.from(resultado.data.privateKey, "base64url"));
    return claves.getPublicKey().toString("base64url") === resultado.data.publicKey ? resultado.data : null;
  } catch {
    return null;
  }
}
