"use server";

import { requerirAdmin } from "@/lib/seguridad/requerir-admin";

export type ConfiguracionOAuthMP = {
  clientIdConfigurado: boolean;
  clientSecretConfigurado: boolean;
  urlAppConfigurada: boolean;
  uriRedireccion: string | null;
};

/**
 * Devuelve el estado de las variables de entorno necesarias para OAuth.
 * No expone los valores reales, solo si están configuradas o no.
 */
export async function obtenerEstadoConfiguracionOAuth(): Promise<ConfiguracionOAuthMP> {
  const sesion = await requerirAdmin();
  if (!sesion) {
    return {
      clientIdConfigurado: false,
      clientSecretConfigurado: false,
      urlAppConfigurada: false,
      uriRedireccion: null,
    };
  }

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
