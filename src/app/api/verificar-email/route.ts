import { NextRequest, NextResponse } from "next/server";
import { validarTokenVerificacion } from "@/lib/validar-token-verificacion";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const baseUrl = request.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(
      new URL("/verificar-email?error=token-invalido", baseUrl),
    );
  }

  const verificado = await validarTokenVerificacion(token);

  if (!verificado) {
    return NextResponse.redirect(
      new URL("/verificar-email?error=token-invalido", baseUrl),
    );
  }

  return NextResponse.redirect(
    new URL("/login?verificado=true", baseUrl),
  );
}
