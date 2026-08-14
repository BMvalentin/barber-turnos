"use server";

import { obtenerConfiguracionMP } from "@/lib/mercadopago/obtener-config";

export type EstadoConexionMP = {
  conectada: boolean;
  bloqueada: boolean;
  clavePublica: string | null;
  idUsuarioMP: string | null;
  modoProduccion: boolean | null;
  actualizadaEn: string | null;
};

/** Devuelve el estado de conexión sin exponer tokens sensibles */
export async function obtenerEstadoConexionMP(): Promise<EstadoConexionMP> {
  const configuracion = await obtenerConfiguracionMP();

  if (!configuracion) {
    return {
      conectada: false,
      bloqueada: false,
      clavePublica: null,
      idUsuarioMP: null,
      modoProduccion: null,
      actualizadaEn: null,
    };
  }

  return {
    conectada: configuracion.conectado,
    bloqueada: configuracion.bloqueado,
    clavePublica: configuracion.publicKey,
    idUsuarioMP: configuracion.mpUserId,
    modoProduccion: configuracion.liveMode,
    actualizadaEn: configuracion.updatedAt.toISOString(),
  };
}
