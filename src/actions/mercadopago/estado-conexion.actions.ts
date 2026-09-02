"use server";

import { obtenerConfiguracionMP } from "@/lib/mercadopago/obtener-config";
import { obtenerNombreCuentaMP } from "@/lib/mercadopago/obtener-nombre-cuenta";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";

export type EstadoConexionMP = {
  conectada: boolean;
  nombreCuenta: string | null;
  actualizadaEn: string | null;
};

/** Devuelve el estado de conexión sin exponer tokens sensibles */
export async function obtenerEstadoConexionMP(): Promise<EstadoConexionMP> {
  const sesion = await requerirAdmin();
  if (!sesion) {
    return {
      conectada: false,
      nombreCuenta: null,
      actualizadaEn: null,
    };
  }

  const configuracion = await obtenerConfiguracionMP();

  if (!configuracion) {
    return {
      conectada: false,
      nombreCuenta: null,
      actualizadaEn: null,
    };
  }

  const nombreCuenta = await obtenerNombreCuentaMP();

  return {
    conectada: configuracion.conectado,
    nombreCuenta,
    actualizadaEn: configuracion.updatedAt.toISOString(),
  };
}
