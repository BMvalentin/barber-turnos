import { prisma } from "@/lib/prisma";
import { hashearTokenVerificacion } from "@/lib/seguridad/hashear-token-verificacion";
import { esIdentificadorDeRestablecimiento } from "@/lib/seguridad/prefijo-token-restablecimiento";

/**
 * Consume un token de restablecimiento vigente y, de forma atómica, reemplaza
 * la contraseña del usuario. Garantiza el uso único incluso ante solicitudes
 * concurrentes: la eliminación condicionada por `expires` solo puede triunfar
 * una vez.
 *
 * `emailVerified` se asigna únicamente si seguía siendo `null`.
 */
export async function restablecerPasswordConToken(
  token: string,
  passwordHash: string,
): Promise<boolean> {
  const tokenHasheado = hashearTokenVerificacion(token);
  const ahora = new Date();

  return prisma.$transaction(
    async (transaccion) => {
      const encontrado = await transaccion.verificacion_usuario.findUnique({
        where: { token: tokenHasheado },
        select: { id: true, userId: true, identifier: true, expires: true },
      });

      if (!encontrado || !esIdentificadorDeRestablecimiento(encontrado.identifier)) {
        return false;
      }

      const eliminado = await transaccion.verificacion_usuario.deleteMany({
        where: { id: encontrado.id, token: tokenHasheado, expires: { gt: ahora } },
      });
      if (eliminado.count !== 1) return false;

      const usuario = await transaccion.user.findUnique({
        where: { id: encontrado.userId },
        select: { emailVerified: true },
      });
      if (!usuario) return false;

      await transaccion.user.update({
        where: { id: encontrado.userId },
        data: {
          password: passwordHash,
          ...(usuario.emailVerified === null ? { emailVerified: ahora } : {}),
        },
      });

      return true;
    },
    { maxWait: 10000, timeout: 15000 },
  );
}
