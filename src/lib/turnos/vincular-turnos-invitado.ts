import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";

function normalizarCorreo(correo: string): string {
  return correo.trim().toLowerCase();
}

/** Vincula los turnos de un invitado solo con una cuenta cuyo correo ya se acreditó. */
export async function vincularTurnosInvitadoEnTransaccion(
  tx: Prisma.TransactionClient,
  usuarioId: string,
  correoAcreditado: string,
): Promise<number> {
  const correo = normalizarCorreo(correoAcreditado);
  if (!correo) return 0;

  const usuario = await tx.user.findUnique({
    where: { id: usuarioId },
    select: { email: true, emailVerified: true, esInvitado: true, role: true },
  });
  if (
    !usuario ||
    usuario.esInvitado ||
    usuario.role !== "USER" ||
    !usuario.emailVerified ||
    normalizarCorreo(usuario.email) !== correo
  ) {
    return 0;
  }

  const invitados = await tx.user.findMany({
    where: { esInvitado: true, emailContacto: correo },
    select: { id: true },
  });
  if (invitados.length === 0) return 0;

  const resultado = await tx.turno.updateMany({
    where: { userId: { in: invitados.map((invitado) => invitado.id) } },
    data: { userId: usuarioId },
  });
  return resultado.count;
}

export function revalidarTurnosUsuarioVinculado(usuarioId: string, cantidad: number): void {
  if (cantidad > 0) revalidateTag(`turnos-user-${usuarioId}`);
}

/** El evento de ingreso solo llama a esta función con un correo verificado por Google. */
export async function vincularTurnosInvitadoDesdeGoogle(
  usuarioId: string,
  correoGoogleVerificado: string,
): Promise<number> {
  const correo = normalizarCorreo(correoGoogleVerificado);
  if (!correo) return 0;

  const cantidad = await prisma.$transaction(async (tx) => {
    const usuario = await tx.user.findUnique({
      where: { id: usuarioId },
      select: { email: true, esInvitado: true, role: true },
    });
    if (
      !usuario ||
      usuario.esInvitado ||
      usuario.role !== "USER" ||
      normalizarCorreo(usuario.email) !== correo
    ) {
      return 0;
    }

    await tx.user.updateMany({
      where: { id: usuarioId, emailVerified: null },
      data: { emailVerified: new Date() },
    });
    return vincularTurnosInvitadoEnTransaccion(tx, usuarioId, correo);
  }, { maxWait: 10000, timeout: 15000 });

  revalidarTurnosUsuarioVinculado(usuarioId, cantidad);
  return cantidad;
}
