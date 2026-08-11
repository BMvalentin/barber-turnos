import { prisma } from "@/lib/prisma";
import { ID_CONFIGURACION_MP } from "./constantes";

/** Lee la configuración guardada, o null si nunca se conectó nada */
export async function obtenerConfiguracionMP() {
  try {
    return await prisma.configuracion_mercadopago.findUnique({
      where: { id: ID_CONFIGURACION_MP },
    });
  } catch (error) {
    console.error("Error al leer configuración de MP desde la DB:", error);
    return null;
  }
}
