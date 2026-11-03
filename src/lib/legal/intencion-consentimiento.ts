import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { validarVersionesObligatorias, type VersionAceptada } from "@/lib/legal/consentimiento";

/* Intención de aceptación previa al flujo de Google OAuth. Viaja en una cookie
   firmada, httpOnly y de vida corta. No contiene datos personales: solo las
   versiones de los documentos aceptados y el momento de emisión. */
export const COOKIE_INTENCION_CONSENTIMIENTO = "consentimiento_legal_intencion";

export const TTL_INTENCION_CONSENTIMIENTO_MS = 10 * 60 * 1000;

export type IntencionConsentimiento = {
  v: 1;
  aceptadas: VersionAceptada[];
  emitidaEn: number;
  expiraEn: number;
  nonce: string;
};

function obtenerSecreto(): string {
  const secreto = process.env.AUTH_SECRET;
  if (!secreto) {
    throw new Error("Falta AUTH_SECRET para firmar la intención de consentimiento");
  }
  return secreto;
}

function firmaDe(cuerpo: string): string {
  return createHmac("sha256", obtenerSecreto()).update(cuerpo).digest("base64url");
}

function esVersionAceptada(valor: unknown): valor is VersionAceptada {
  if (typeof valor !== "object" || valor === null) return false;
  const entrada = valor as Record<string, unknown>;
  return typeof entrada.documento === "string" && typeof entrada.version === "string";
}

function esIntencionValida(valor: unknown): valor is IntencionConsentimiento {
  if (typeof valor !== "object" || valor === null) return false;
  const intencion = valor as Record<string, unknown>;
  return (
    intencion.v === 1 &&
    typeof intencion.emitidaEn === "number" &&
    typeof intencion.expiraEn === "number" &&
    typeof intencion.nonce === "string" &&
    Array.isArray(intencion.aceptadas) &&
    intencion.aceptadas.every(esVersionAceptada)
  );
}

export function firmarIntencion(
  aceptadas: readonly VersionAceptada[],
  ahora: number = Date.now(),
): string {
  const intencion: IntencionConsentimiento = {
    v: 1,
    aceptadas: [...aceptadas],
    emitidaEn: ahora,
    expiraEn: ahora + TTL_INTENCION_CONSENTIMIENTO_MS,
    nonce: randomUUID(),
  };
  const cuerpo = Buffer.from(JSON.stringify(intencion)).toString("base64url");
  return `${cuerpo}.${firmaDe(cuerpo)}`;
}

export function verificarIntencion(
  token: string | null | undefined,
  ahora: number = Date.now(),
): IntencionConsentimiento | null {
  if (!token) return null;
  const partes = token.split(".");
  if (partes.length !== 2) return null;
  const [cuerpo, firma] = partes;
  if (!cuerpo || !firma) return null;

  const firmaEsperada = firmaDe(cuerpo);
  const bufferFirma = Buffer.from(firma);
  const bufferEsperada = Buffer.from(firmaEsperada);
  if (
    bufferFirma.length !== bufferEsperada.length ||
    !timingSafeEqual(bufferFirma, bufferEsperada)
  ) {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(cuerpo, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!esIntencionValida(payload)) return null;
  if (payload.expiraEn <= ahora) return null;
  if (!validarVersionesObligatorias(payload.aceptadas).valido) return null;

  return payload;
}
