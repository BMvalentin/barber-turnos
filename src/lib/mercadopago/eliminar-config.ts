import { prisma } from "@/lib/prisma";
import { ID_CONFIGURACION_MP } from "./constantes";
import { estaBloqueadaMP } from "./esta-bloqueada";

/**
 * Borra la conexión guardada. Lanza error si la configuración está bloqueada.
 */
export async function eliminarConfiguracionMP() {
  const bloqueada = await estaBloqueadaMP();

  if (bloqueada) {
    throw new Error(
      "La configuración está bloqueada. " +
      "Pedile al equipo de desarrollo que la desbloquee antes de desconectar.",
    );
  }

  await prisma.configuracion_mercadopago.deleteMany({
    where: { id: ID_CONFIGURACION_MP },
  });
}
