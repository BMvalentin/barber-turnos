import { NextRequest, NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { conectarCuentaMP } from "@/lib/mercadopago/conectar-cuenta";
import { verificarEstadoOAuth } from "@/lib/mercadopago/estado-oauth";

export async function GET(req: NextRequest) {
  const url = new URL("/admin/config/medios-pago", req.url);
  url.searchParams.set("tab", "mercado-pago");

  // Solo un admin autenticado puede completar la conexión OAuth con Mercado Pago
  const sesion = await requerirAdmin();
  if (!sesion?.user?.id) {
    url.searchParams.set("mp_error", "no_autorizado");
    return NextResponse.redirect(url);
  }

  try {
    const codigo = req.nextUrl.searchParams.get("code");
    const estadoRecibido = req.nextUrl.searchParams.get("state");
    const estadoGuardado = req.cookies.get("mp_oauth_state")?.value;
    const codeVerifier = req.cookies.get("mp_code_verifier")?.value;

    if (!codigo) {
      url.searchParams.set("mp_error", "sin_codigo");
      return NextResponse.redirect(url);
    }

    if (!estadoRecibido || !estadoGuardado || estadoGuardado !== estadoRecibido) {
      url.searchParams.set("mp_error", "estado_invalido");
      return NextResponse.redirect(url);
    }

    if (!verificarEstadoOAuth(estadoRecibido, sesion.user.id)) {
      url.searchParams.set("mp_error", "estado_invalido");
      return NextResponse.redirect(url);
    }

    if (!codeVerifier) {
      url.searchParams.set("mp_error", "configuracion_incompleta");
      return NextResponse.redirect(url);
    }

    await conectarCuentaMP(codigo, codeVerifier);

    url.searchParams.set("mp_success", "1");
    const respuesta = NextResponse.redirect(url);
    respuesta.cookies.delete("mp_oauth_state");
    respuesta.cookies.delete("mp_code_verifier");
    return respuesta;
  } catch (error) {
    console.error("Error en callback de Mercado Pago:", error instanceof Error ? error.message : String(error));
    url.searchParams.set("mp_error", "conexion_fallida");
    return NextResponse.redirect(url);
  }
}
