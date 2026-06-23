import "dotenv/config";
import MercadoPagoConfig from "mercadopago";
import { prisma } from "@/lib/prisma";

// ID fijo: solo necesitamos una fila de configuración
const ID_CONFIGURACION_MP = "mercadopago-principal";

// URL base de autenticación para Argentina
const URL_BASE_AUTORIZACION =
  process.env.MP_AUTH_BASE_URL || "https://auth.mercadopago.com.ar";

// Endpoint de intercambio de tokens
const URL_TOKEN_MP = "https://api.mercadopago.com/oauth/token";

/**
 * Construye la URI de redirección exacta que debe estar registrada
 * en el panel de Mercado Pago → Tu aplicación → Redirect URI
 */
function obtenerUriRedireccion(): string {
  // Preferimos NEXT_PUBLIC_APP_URL si está definida (producción)
  let urlBase = process.env.NEXT_PUBLIC_APP_URL;

  if (!urlBase) {
    // En Vercel, VERCEL_URL está disponible en runtime (ej: "proyecto-git-rama.vercel.app")
    const vercelUrl = process.env.VERCEL_URL;
    if (!vercelUrl) {
      throw new Error(
        "Falta configurar NEXT_PUBLIC_APP_URL o VERCEL_URL. " +
        "Ejemplo: NEXT_PUBLIC_APP_URL=http://localhost:3000"
      );
    }
    // VERCEL_URL no incluye protocolo, lo agregamos
    urlBase = `https://${vercelUrl}`;
  }

  return `${urlBase}/api/mercadopago/oauth/callback`;
}

/**
 * Valida que las variables de entorno necesarias para OAuth estén presentes.
 * Lanza un error descriptivo si falta alguna.
 */
export function validarConfiguracionOAuthMP(): void {
  const errores: string[] = [];

  if (!process.env.MP_CLIENT_ID) {
    errores.push("MP_CLIENT_ID no está definido en el .env");
  }
  if (!process.env.MP_CLIENT_SECRET) {
    errores.push("MP_CLIENT_SECRET no está definido en el .env");
  }
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    errores.push("NEXT_PUBLIC_APP_URL no está definido en el .env");
  }

  if (errores.length > 0) {
    throw new Error(
      `Configuración incompleta para Mercado Pago OAuth:\n${errores.join("\n")}`,
    );
  }
}

/**
 * Construye la URL a la que se redirige al admin para autorizar la app
 * en su cuenta de Mercado Pago.
 */
export function construirUrlAutorizacionMP(estado: string): string {
  validarConfiguracionOAuthMP();

  const parametros = new URLSearchParams({
    client_id: process.env.MP_CLIENT_ID!,
    response_type: "code",
    redirect_uri: obtenerUriRedireccion(),
    state: estado,
    scope: "read write offline_access",
  });

  return `${URL_BASE_AUTORIZACION}/authorization?${parametros.toString()}`;
}

type RespuestaTokenMP = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  user_id?: number;
  refresh_token?: string;
  public_key?: string;
  live_mode?: boolean;
};

/**
 * Intercambia el código de autorización que devuelve Mercado Pago
 * por los tokens reales de la cuenta que se está conectando.
 */
export async function intercambiarCodigoPorToken(codigo: string): Promise<RespuestaTokenMP> {
  validarConfiguracionOAuthMP();

  const cuerpo = {
    client_id: process.env.MP_CLIENT_ID!,
    client_secret: process.env.MP_CLIENT_SECRET!,
    grant_type: "authorization_code",
    code: codigo,
    redirect_uri: obtenerUriRedireccion(),
  };

  console.log("🔄 Intercambiando código MP por token...");
  console.log("🔍 Redirect URI enviada:", cuerpo.redirect_uri);
  console.log("🔍 Cuerpo de la solicitud (menos secret):", {
    ...cuerpo,
    client_secret: "***",
  });

  const respuesta = await fetch(URL_TOKEN_MP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });

  const datos = await respuesta.json();

  console.log("🔁 Respuesta de MP:");
  console.log("   Status:", respuesta.status);
  console.log("   Body:", JSON.stringify(datos, null, 2));

  if (!respuesta.ok) {
    console.error("❌ Error intercambiando código MP");
    console.error("   Status:", respuesta.status);
    console.error("   Body:", JSON.stringify(datos, null, 2));
    throw new Error(
      datos?.message ||
      datos?.error_description ||
      `Error ${respuesta.status} al conectar con Mercado Pago`
    );
  }
  return datos as RespuestaTokenMP;
}
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

/**
 * Indica si la configuración actual está bloqueada.
 * Si hay error de DB (ej: migración no ejecutada), devuelve false
 * para no bloquear el flujo de conexión inicial.
 */
export async function estaBloqueadaMP(): Promise<boolean> {
  try {
    const configuracion = await obtenerConfiguracionMP();
    return configuracion?.bloqueado ?? false;
  } catch (error) {
    console.error("Error al verificar bloqueo de MP:", error);
    // Si falla la consulta (tabla/columna no existe), no bloqueamos
    return false;
  }
}

type OpcionesGuardarMP = {
  /** Si true (por defecto), bloquea la configuración después de guardar */
  bloquearDespuesDeGuardar?: boolean;
};

/**
 * Guarda o actualiza en la base de datos la configuración de la cuenta conectada.
 * Función de bajo nivel: no valida el bloqueo, eso lo decide quien la llama.
 */
export async function guardarConfiguracionMP(
  datos: RespuestaTokenMP,
  opciones: OpcionesGuardarMP = {},
) {
  const { bloquearDespuesDeGuardar = true } = opciones;

  const fechaExpiracion = datos.expires_in
    ? new Date(Date.now() + datos.expires_in * 1000)
    : null;
  console.log("💾 Guardando configuración en DB...");
  console.log("   Datos a guardar:", {
    accessToken: datos.access_token?.substring(0, 10) + "...",
    refreshToken: datos.refresh_token ? "present" : "null",
    publicKey: datos.public_key,
    mpUserId: datos.user_id ? String(datos.user_id) : null,
    liveMode: datos.live_mode,
    expiraEn: fechaExpiracion,
    bloqueado: bloquearDespuesDeGuardar,
  });

  await prisma.configuracion_mercadopago.upsert({
    where: { id: ID_CONFIGURACION_MP },
    create: {
      id: ID_CONFIGURACION_MP,
      accessToken: datos.access_token,
      refreshToken: datos.refresh_token ?? null,
      publicKey: datos.public_key ?? null,
      mpUserId: datos.user_id ? String(datos.user_id) : null,
      scope: datos.scope ?? null,
      liveMode: datos.live_mode ?? true,
      expiraEn: fechaExpiracion,
      conectado: true,
      bloqueado: bloquearDespuesDeGuardar,
    },
    update: {
      accessToken: datos.access_token,
      refreshToken: datos.refresh_token ?? null,
      publicKey: datos.public_key ?? null,
      mpUserId: datos.user_id ? String(datos.user_id) : null,
      scope: datos.scope ?? null,
      liveMode: datos.live_mode ?? true,
      expiraEn: fechaExpiracion,
      conectado: true,
      bloqueado: bloquearDespuesDeGuardar,
    },
  });
}

/**
 * Flujo de alto nivel para conectar/reconectar una cuenta.
 * Valida el bloqueo antes de guardar nada.
 */
export async function conectarCuentaMP(codigo: string) {
  const bloqueada = await estaBloqueadaMP();

  if (bloqueada) {
    throw new Error(
      "La configuración de Mercado Pago está bloqueada. " +
      "Pedile al equipo de desarrollo que cambie 'bloqueado' a false en la base de datos.",
    );
  }

  const tokens = await intercambiarCodigoPorToken(codigo);
  console.log("   Tokens obtenidos:", !!tokens.access_token);
  await guardarConfiguracionMP(tokens, { bloquearDespuesDeGuardar: true });
  console.log("✅ Configuración guardada correctamente.");
  return tokens;
}

/**
 * Renueva el access_token usando el refresh_token guardado.
 * El bloqueo NO se modifica: es la misma cuenta, no un cambio de credenciales.
 */
export async function refrescarTokenMP(): Promise<RespuestaTokenMP> {
  const configuracion = await obtenerConfiguracionMP();

  if (!configuracion?.refreshToken) {
    throw new Error("No hay refresh_token guardado para renovar la conexión");
  }

  validarConfiguracionOAuthMP();

  const respuesta = await fetch(URL_TOKEN_MP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.MP_CLIENT_ID!,
      client_secret: process.env.MP_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: configuracion.refreshToken,
    }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    console.error("❌ Error al refrescar token de MP:", datos);
    throw new Error("No se pudo renovar la conexión con Mercado Pago");
  }

  // Preserva el estado de bloqueo actual al refrescar
  await guardarConfiguracionMP(datos, {
    bloquearDespuesDeGuardar: configuracion.bloqueado,
  });

  return datos as RespuestaTokenMP;
}

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

/**
 * Devuelve un cliente de Mercado Pago listo para usar.
 * Prioriza el token guardado en DB; si no hay, usa el del .env como respaldo.
 */
export async function obtenerClienteMP(): Promise<MercadoPagoConfig> {
  const configuracion = await obtenerConfiguracionMP();
  const tokenAcceso =
    configuracion?.accessToken || process.env.MP_ACCESS_TOKEN;

  if (!tokenAcceso) {
    throw new Error(
      "No hay ninguna cuenta de Mercado Pago conectada ni token configurado en el .env",
    );
  }

  return new MercadoPagoConfig({
    accessToken: tokenAcceso,
    options: { timeout: 5000 },
  });
}