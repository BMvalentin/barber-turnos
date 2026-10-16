import { beforeEach, describe, expect, it } from "vitest";
import { construirAceptacionesVigentes } from "@/lib/legal/consentimiento";
import {
  TTL_INTENCION_CONSENTIMIENTO_MS,
  firmarIntencion,
  verificarIntencion,
} from "@/lib/legal/intencion-consentimiento";

describe("intención de consentimiento (Google OAuth)", () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = "secreto-de-prueba";
  });

  it("firma y verifica una intención vigente con las versiones actuales", () => {
    const token = firmarIntencion(construirAceptacionesVigentes());
    const verificada = verificarIntencion(token);
    expect(verificada).not.toBeNull();
    expect(verificada?.aceptadas.length).toBe(construirAceptacionesVigentes().length);
  });

  it("rechaza una firma manipulada", () => {
    const token = firmarIntencion(construirAceptacionesVigentes());
    expect(verificarIntencion(`${token}extra`)).toBeNull();
  });

  it("rechaza una intención vencida", () => {
    const ahora = Date.now();
    const token = firmarIntencion(construirAceptacionesVigentes(), ahora);
    expect(verificarIntencion(token, ahora + TTL_INTENCION_CONSENTIMIENTO_MS + 1)).toBeNull();
  });

  it("rechaza una intención con versiones que ya no son las vigentes", () => {
    const token = firmarIntencion([
      { documento: "terminos", version: "0.0.0" },
      { documento: "privacidad", version: "0.0.0" },
    ]);
    expect(verificarIntencion(token)).toBeNull();
  });

  it("rechaza tokens ausentes o mal formados", () => {
    expect(verificarIntencion(undefined)).toBeNull();
    expect(verificarIntencion(null)).toBeNull();
    expect(verificarIntencion("sin-punto")).toBeNull();
  });
});
