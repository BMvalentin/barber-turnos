import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashearTokenVerificacion } from "@/lib/seguridad/hashear-token-verificacion";

const DURACION_TOKEN_MS = 30 * 60 * 1000;

/**
 * Genera y guarda un token de verificación de email para el usuario.
 * Devuelve el token o `null` si el email no corresponde a ningún usuario.
 */
export async function crearTokenVerificacion(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const tokenPlano = randomBytes(32).toString("hex");
  const token = hashearTokenVerificacion(tokenPlano);

  await prisma.$transaction([
    prisma.verificacion_usuario.deleteMany({ where: { userId: user.id } }),
    prisma.verificacion_usuario.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + DURACION_TOKEN_MS),
        userId: user.id,
      },
    }),
  ]);

  return tokenPlano;
}
