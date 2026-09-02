import { prisma } from "@/lib/prisma";
import { ID_CONFIGURACION_MP } from "./constantes";

/**
 * Borra la conexión guardada para que un administrador pueda vincular otra cuenta.
 */
export async function eliminarConfiguracionMP() {
  await prisma.configuracion_mercadopago.deleteMany({
    where: { id: ID_CONFIGURACION_MP },
  });
}
