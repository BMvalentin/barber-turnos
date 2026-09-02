import { Prisma } from "../../../generated/prisma/client";

type OperacionProtegida<T> = () => Promise<T>;

/**
 * Serializa las mutaciones de agenda de un barbero dentro de la transacción.
 * MariaDB conserva este bloqueo de fila hasta el commit o rollback.
 */
export async function ejecutarConBloqueReserva<T>(
  tx: Prisma.TransactionClient,
  barberoId: string,
  operacion: OperacionProtegida<T>,
): Promise<T> {
  const resultado = await tx.$queryRaw<{ id: string }[]>(
    Prisma.sql`SELECT id FROM barbero WHERE id = ${barberoId} FOR UPDATE`,
  );

  if (!resultado[0]) {
    throw new Error("BARBERO_NO_DISPONIBLE");
  }

  return operacion();
}
