import { prisma } from "@/lib/prisma";

/**
 * Busca un token de verificación vigente y devuelve el usuario asociado.
 * El link no vence: solo se descarta si el token no existe.
 */
export async function validarTokenVerificacion(
  token: string,
): Promise<{ userId: string; identifier: string } | null> {
  const registro = await prisma.verificacion_usuario.findUnique({
    where: { token },
  });

  if (!registro) return null;

  return { userId: registro.userId, identifier: registro.identifier };
}
