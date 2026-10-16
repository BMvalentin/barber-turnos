import type { Prisma } from "../../../generated/prisma/client";
import { construirAceptacionesVigentes, type VersionAceptada } from "@/lib/legal/consentimiento";

type ParametrosRegistroConsentimiento = {
  userId: string;
  /* Contexto verificable de la aceptación: "credentials" o "google". */
  metodo: string;
  /* Versiones a registrar. Por defecto, las obligatorias vigentes: el cliente
     nunca define la versión. */
  aceptadas?: readonly VersionAceptada[];
};

/* Inserta las aceptaciones dentro de la transacción que crea o vincula al
   usuario, para no dejar consentimientos asociados a cuentas inexistentes. */
export async function registrarConsentimientosEnTransaccion(
  tx: Prisma.TransactionClient,
  { userId, metodo, aceptadas = construirAceptacionesVigentes() }: ParametrosRegistroConsentimiento,
): Promise<void> {
  if (aceptadas.length === 0) return;
  await tx.consentimiento_legal.createMany({
    data: aceptadas.map((aceptada) => ({
      userId,
      documento: aceptada.documento,
      version: aceptada.version,
      metodo,
    })),
  });
}
