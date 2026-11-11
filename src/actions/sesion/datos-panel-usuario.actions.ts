"use server";

import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";
import { obtenerDatosTransferencia } from "@/lib/pagos/obtener-datos-transferencia";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import type { ActionState } from "@/types/action-state";
import type { DatosTransferencia } from "@/types/pago";

type DatosPagoPanel = {
  whatsappPhone: string;
  datosTransferencia: DatosTransferencia;
};

export async function obtenerDatosPagoPanel(): Promise<ActionState<DatosPagoPanel>> {
  if (!(await requerirSesion())) return { success: false, error: "No autorizado" };

  try {
    const config = await obtenerConfigCacheada();
    return {
      success: true,
      data: {
        whatsappPhone: config?.whatsapp ?? "",
        datosTransferencia: obtenerDatosTransferencia(config),
      },
    };
  } catch {
    return { success: false, error: "No se pudieron cargar los medios de pago" };
  }
}
