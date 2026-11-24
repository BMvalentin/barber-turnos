import type { Prisma } from "../../../generated/prisma/client";
import { NOMBRE_PROVISIONAL_BARBERO } from "./nombre-profesional";

type CuentaBarbero = {
  id: string;
  email: string;
};

export async function asegurarPerfilBarbero(
  tx: Prisma.TransactionClient,
  cuenta: CuentaBarbero,
): Promise<{ id: string }> {
  const vinculado = await tx.barbero.findUnique({
    where: { usuarioId: cuenta.id },
    select: { id: true, email: true },
  });
  if (vinculado?.email === cuenta.email) return { id: vinculado.id };

  const existente = vinculado ?? await tx.barbero.findFirst({
    where: { usuarioId: null, email: cuenta.email },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  if (existente) {
    return tx.barbero.update({
      where: { id: existente.id, OR: [{ usuarioId: null }, { usuarioId: cuenta.id }] },
      data: { usuarioId: cuenta.id, email: cuenta.email },
      select: { id: true },
    });
  }

  return tx.barbero.upsert({
    where: { usuarioId: cuenta.id },
    update: {},
    create: {
      nombre: NOMBRE_PROVISIONAL_BARBERO,
      email: cuenta.email,
      usuarioId: cuenta.id,
    },
    select: { id: true },
  });
}
