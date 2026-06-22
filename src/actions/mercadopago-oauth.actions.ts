"use server";

import { revalidatePath } from "next/cache";
import { obtenerConfiguracionMP, eliminarConfiguracionMP } from "@/lib/mercadopago";

export type EstadoConexionMP = {
  conectada: boolean;
  bloqueada: boolean;
  clavePublica: string | null;
  idUsuarioMP: string | null;
  modoProduccion: boolean | null;
  actualizadaEn: string | null;
};

export type ConfiguracionOAuthMP = {
  clientIdConfigurado: boolean;
  clientSecretConfigurado: boolean;
  urlAppConfigurada: boolean;
  uriRedireccion: string | null;
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

/**
 * Devuelve el estado de las variables de entorno necesarias para OAuth.
 * No expone los valores reales, solo si están configuradas o no.
 */
export async function obtenerEstadoConfiguracionOAuth(): Promise<ConfiguracionOAuthMP> {
  const urlApp = process.env.NEXT_PUBLIC_APP_URL;

  return {
    clientIdConfigurado: !!process.env.MP_CLIENT_ID,
    clientSecretConfigurado: !!process.env.MP_CLIENT_SECRET,
    urlAppConfigurada: !!urlApp,
    uriRedireccion: urlApp
      ? `${urlApp}/api/mercadopago/oauth/callback`
      : null,
  };
}

/** Desconecta la cuenta de MP. Falla si la configuración está bloqueada. */
export async function desconectarMP() {
  try {
    await eliminarConfiguracionMP();
    revalidatePath("/admin/mercadopago");
    return { success: true };
  } catch (error: any) {
    console.error("Error al desconectar Mercado Pago:", error);
    return {
      success: false,
      error: error?.message || "No se pudo desconectar la cuenta",
    };
  }
}