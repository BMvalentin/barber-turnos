import { prisma } from "@/lib/prisma";
import { hashearTokenVerificacion } from "@/lib/seguridad/hashear-token-verificacion";

/**
 * Consume un token de verificación vigente y devuelve el usuario asociado.
 */
export async function validarTokenVerificacion(
  token: string,
): Promise<boolean> {
  const tokenHasheado = hashearTokenVerificacion(token);
  const ahora = new Date();
  const registro = await prisma.$transaction(async (transaccion) => {
    const encontrado = await transaccion.verificacion_usuario.findUnique({
      where: { token: tokenHasheado },
    });

    if (!encontrado) return null;
    if (encontrado.expires <= ahora) {
      await transaccion.verificacion_usuario.deleteMany({
        where: { id: encontrado.id, token: tokenHasheado },
      });
      return null;
    }

    const eliminado = await transaccion.verificacion_usuario.deleteMany({
      where: { id: encontrado.id, token: tokenHasheado, expires: { gt: ahora } },
    });
    if (eliminado.count !== 1) return null;

    await transaccion.user.update({
      where: { id: encontrado.userId },
      data: { emailVerified: ahora },
    });

    return true;
  });

  return registro === true;
}
