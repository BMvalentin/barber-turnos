import { NextRequest, NextResponse } from "next/server";
import { randomUUID, randomBytes } from "crypto";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { construirUrlAutorizacionMP } from "@/lib/mercadopago/url-autorizacion";
import { firmarEstadoOAuth } from "@/lib/mercadopago/estado-oauth";

type CodigoErrorInicio =
  | "no_autorizado"
  | "sin_client_id"
  | "sin_app_url"
  | "configuracion_incompleta"
  | "inicio_fallido";

function redirigirConError(urlBase: URL, codigo: CodigoErrorInicio): NextResponse {
  urlBase.searchParams.set("mp_error", codigo);
  return NextResponse.redirect(urlBase);
}

function generarCodeVerifier(): string {
  // 64 bytes -> 86 caracteres en base64url, cumple con el rango 43-128
  return randomBytes(64)
    .toString("base64url")
    .replace(/=+$/, ""); // eliminar padding
}

async function generarCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hash)
    .toString("base64url")
    .replace(/=+$/, "");
}

export async function GET(req: NextRequest) {
  const urlAdmin = new URL("/admin/config/medios-pago", req.url);
  urlAdmin.searchParams.set("tab", "mercado-pago");

  // Solo un admin autenticado puede iniciar la conexión OAuth con Mercado Pago
  const sesion = await requerirAdmin();
  if (!sesion?.user?.id) {
    return redirigirConError(urlAdmin, "no_autorizado");
  }

  // Validar variables de entorno
  if (!process.env.MP_CLIENT_ID) {
    console.error("❌ MP_CLIENT_ID no configurado en el .env");
    return redirigirConError(urlAdmin, "sin_client_id");
  }

  if (!process.env.NEXT_PUBLIC_APP_URL && !process.env.VERCEL_URL) {
    console.error("❌ NEXT_PUBLIC_APP_URL / VERCEL_URL no configurado en el .env");
    return redirigirConError(urlAdmin, "sin_app_url");
  }

  if (!process.env.MP_CLIENT_SECRET) {
    console.error("❌ MP_CLIENT_SECRET no configurado en el .env");
    return redirigirConError(urlAdmin, "configuracion_incompleta");
  }

  try {
    const uuidEstado = randomUUID();
    const estado = `${uuidEstado}.${firmarEstadoOAuth(uuidEstado, sesion.user.id)}`;
    const codeVerifier = generarCodeVerifier();
    const codeChallenge = await generarCodeChallenge(codeVerifier);

    const urlAutorizacion = construirUrlAutorizacionMP(estado, codeChallenge);

    const respuesta = NextResponse.redirect(urlAutorizacion);

    // Guardar state y code_verifier en cookies seguras
    respuesta.cookies.set("mp_oauth_state", estado, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });

    respuesta.cookies.set("mp_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });

    return respuesta;
  } catch (error) {
    console.error("❌ Error al iniciar conexión con Mercado Pago:", error);
    return redirigirConError(urlAdmin, "inicio_fallido");
  }
}
