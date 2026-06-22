import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { construirUrlAutorizacionMP, estaBloqueadaMP } from "@/lib/mercadopago";

type CodigoErrorInicio =
  | "bloqueado"
  | "sin_client_id"
  | "sin_app_url"
  | "configuracion_incompleta"
  | "inicio_fallido";

function redirigirConError(
  urlBase: URL,
  codigo: CodigoErrorInicio,
): NextResponse {
  urlBase.searchParams.set("mp_error", codigo);
  return NextResponse.redirect(urlBase);
}

/**
 * Inicia el flujo OAuth con Mercado Pago.
 * Valida el bloqueo y la configuración antes de redirigir al admin.
 */
export async function GET(req: NextRequest) {
  const urlAdmin = new URL("/admin/mercadopago", req.url);

  // Validar variables de entorno antes de cualquier cosa
  if (!process.env.MP_CLIENT_ID) {
    console.error("❌ MP_CLIENT_ID no configurado en el .env");
    return redirigirConError(urlAdmin, "sin_client_id");
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    console.error("❌ NEXT_PUBLIC_APP_URL no configurado en el .env");
    return redirigirConError(urlAdmin, "sin_app_url");
  }

  if (!process.env.MP_CLIENT_SECRET) {
    console.error("❌ MP_CLIENT_SECRET no configurado en el .env");
    return redirigirConError(urlAdmin, "configuracion_incompleta");
  }

  try {
    // Verificar bloqueo antes de iniciar el flujo
    const bloqueada = await estaBloqueadaMP();
    if (bloqueada) {
      console.warn("⚠️ Intento de conexión MP bloqueado por seguridad");
      return redirigirConError(urlAdmin, "bloqueado");
    }

    const estado = randomUUID();
    const urlAutorizacion = construirUrlAutorizacionMP(estado);

    console.log("🔗 Redirigiendo a autorización de MP:", urlAutorizacion);

    const respuesta = NextResponse.redirect(urlAutorizacion);

    // Guardamos el state en cookie para validarlo en el callback (anti-CSRF)
    respuesta.cookies.set("mp_oauth_state", estado, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutos
      path: "/",
    });

    return respuesta;
  } catch (error) {
    console.error("❌ Error al iniciar conexión con Mercado Pago:", error);
    return redirigirConError(urlAdmin, "inicio_fallido");
  }
}