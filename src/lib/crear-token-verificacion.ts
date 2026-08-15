import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

/** Fecha lejana: el link de verificación no vence. */
const EXPIRACION_LEJANA = new Date("9999-12-31T23:59:59Z");

/**
 * Genera y guarda un token de verificación de email para el usuario.
 * Devuelve el token o `null` si el email no corresponde a ningún usuario.
 */
export async function crearTokenVerificacion(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const token = randomBytes(32).toString("hex");

  await prisma.verificacion_usuario.create({
    data: {
      identifier: email,
      token,
      expires: EXPIRACION_LEJANA,
      userId: user.id,
    },
  });

  return token;
}
