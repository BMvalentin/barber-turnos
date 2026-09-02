import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { conectarCuentaMP } from "@/lib/mercadopago/conectar-cuenta";

/**
 * Secreto para verificar la firma del state del OAuth. Debe ser idéntico al
 * usado en start/route.ts: prioriza las variables de Auth.js; si ninguna
 * existe, deriva la clave del userId del admin con el mismo salt fijo.
 */
function obtenerSecretoFirma(userId: string): string {
  const secreto = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  return secreto || `barber-turnos-oauth-v1:${userId}:sal-fija`;
}

/**
 * Separa `<uuid>.<firma>`, recalcula el HMAC-SHA256 sobre el uuid con el
 * secreto del admin y compara en tiempo constante para evitar forjar states.
 */
function verificarFirma(estadoFirmado: string, userId: string): boolean {
  try {
    const ultimoPunto = estadoFirmado.lastIndexOf(".");
    if (ultimoPunto <= 0 || ultimoPunto === estadoFirmado.length - 1) return false;

    const uuid = estadoFirmado.slice(0, ultimoPunto);
    const firmaRecibida = Buffer.from(estadoFirmado.slice(ultimoPunto + 1), "base64url");
    const firmaEsperada = createHmac("sha256", obtenerSecretoFirma(userId))
      .update(uuid)
      .digest();

    if (firmaRecibida.length !== firmaEsperada.length) return false;
    return timingSafeEqual(firmaEsperada, firmaRecibida);
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const url = new URL("/admin/mercadopago", req.url);

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

    if (!verificarFirma(estadoRecibido, sesion.user.id)) {
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
