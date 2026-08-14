import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validarTokenVerificacion } from "@/lib/validar-token-verificacion";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const baseUrl = request.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(
      new URL("/verificar-email?error=token-invalido", baseUrl),
    );
  }

  const registro = await validarTokenVerificacion(token);

  if (!registro) {
    return NextResponse.redirect(
      new URL("/verificar-email?error=token-invalido", baseUrl),
    );
  }

  await prisma.user.update({
    where: { id: registro.userId },
    data: { emailVerified: new Date() },
  });

  await prisma.verificacion_usuario.delete({ where: { token } });

  return NextResponse.redirect(
    new URL("/login?verificado=true", baseUrl),
  );
}
