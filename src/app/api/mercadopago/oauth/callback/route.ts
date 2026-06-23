import { NextRequest, NextResponse } from "next/server";
import { conectarCuentaMP } from "@/lib/mercadopago";

export async function GET(req: NextRequest) {
  const url = new URL("/admin/mercadopago", req.url);

  try {
    const codigo = req.nextUrl.searchParams.get("code");
    const estadoRecibido = req.nextUrl.searchParams.get("state");
    const estadoGuardado = req.cookies.get("mp_oauth_state")?.value;
    const codeVerifier = req.cookies.get("mp_code_verifier")?.value;

    if (!codigo) {
      url.searchParams.set("mp_error", "sin_codigo");
      return NextResponse.redirect(url);
    }

    if (!estadoGuardado || estadoGuardado !== estadoRecibido) {
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
  } catch (error: any) {
    console.error("Error en callback de Mercado Pago:", error);
    const codigoError = error?.message?.includes("bloqueada")
      ? "bloqueado"
      : "conexion_fallida";
    url.searchParams.set("mp_error", codigoError);
    return NextResponse.redirect(url);
  }
}