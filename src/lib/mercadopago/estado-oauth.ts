import { createHmac, timingSafeEqual } from "crypto";

function obtenerSecretoFirma(): string {
  const secreto = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secreto) throw new Error("Falta configurar el secreto de autenticación");
  return secreto;
}

export function firmarEstadoOAuth(estado: string, userId: string): string {
  return createHmac("sha256", obtenerSecretoFirma())
    .update(`${userId}:${estado}`)
    .digest("base64url");
}

export function verificarEstadoOAuth(estadoFirmado: string, userId: string): boolean {
  try {
    const ultimoPunto = estadoFirmado.lastIndexOf(".");
    if (ultimoPunto <= 0 || ultimoPunto === estadoFirmado.length - 1) return false;

    const estado = estadoFirmado.slice(0, ultimoPunto);
    const firmaRecibida = Buffer.from(estadoFirmado.slice(ultimoPunto + 1), "base64url");
    const firmaEsperada = Buffer.from(firmarEstadoOAuth(estado, userId), "base64url");
    return firmaRecibida.length === firmaEsperada.length &&
      timingSafeEqual(firmaEsperada, firmaRecibida);
  } catch {
    return false;
  }
}
