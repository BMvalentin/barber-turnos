import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashearTokenVerificacion } from "@/lib/seguridad/hashear-token-verificacion";
import { identificadorTokenRestablecimiento } from "@/lib/seguridad/prefijo-token-restablecimiento";

const DURACION_TOKEN_MS = 30 * 60 * 1000;

/**
 * Genera y guarda un token de restablecimiento de contraseña para el usuario.
 * Devuelve el token en texto plano (para enviarlo por correo) o `null` si el
 * usuario no existe. En la base solo se almacena su hash SHA-256.
 */
export async function crearTokenRestablecimiento(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  if (!user) return null;

  const identifier = identificadorTokenRestablecimiento(user.email);
  const tokenPlano = randomBytes(32).toString("hex");
  const token = hashearTokenVerificacion(tokenPlano);

  await prisma.$transaction([
    // Solo invalida restablecimientos previos del mismo usuario: no toca los
    // tokens de verificación de email, que usan otro identificador.
    prisma.verificacion_usuario.deleteMany({ where: { identifier } }),
    prisma.verificacion_usuario.create({
      data: {
        identifier,
        token,
        expires: new Date(Date.now() + DURACION_TOKEN_MS),
        userId: user.id,
      },
    }),
  ]);

  return tokenPlano;
}
