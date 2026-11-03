import { describe, expect, it } from "vitest";
import {
  construirAceptacionesVigentes,
  esVersionVigente,
  validarVersionesObligatorias,
} from "@/lib/legal/consentimiento";
import { DOCUMENTOS_CON_ACEPTACION, DOCUMENTOS_LEGALES } from "@/lib/legal/documentos";

describe("consentimiento", () => {
  it("construye las aceptaciones obligatorias con la versión vigente de cada documento", () => {
    const aceptadas = construirAceptacionesVigentes();
    expect(aceptadas).toHaveLength(DOCUMENTOS_CON_ACEPTACION.length);
    for (const aceptada of aceptadas) {
      expect(aceptada.version).toBe(DOCUMENTOS_LEGALES[aceptada.documento].version);
    }
    expect(validarVersionesObligatorias(aceptadas)).toEqual({ valido: true });
  });

  it("detecta documentos obligatorios faltantes", () => {
    const aceptadas = construirAceptacionesVigentes().slice(1);
    const resultado = validarVersionesObligatorias(aceptadas);
    expect(resultado.valido).toBe(false);
    if (!resultado.valido) {
      expect(resultado.faltantes).toContain(DOCUMENTOS_CON_ACEPTACION[0]);
      expect(resultado.faltantes.length).toBeGreaterThan(0);
    }
  });

  it("detecta versiones desactualizadas", () => {
    const aceptadas = construirAceptacionesVigentes().map((aceptada, indice) =>
      indice === 0 ? { ...aceptada, version: "0.0.0" } : aceptada,
    );
    const resultado = validarVersionesObligatorias(aceptadas);
    expect(resultado.valido).toBe(false);
    if (!resultado.valido) {
      expect(resultado.desactualizados).toContain(DOCUMENTOS_CON_ACEPTACION[0]);
    }
  });

  it("esVersionVigente compara contra la versión vigente del documento", () => {
    const documento = DOCUMENTOS_CON_ACEPTACION[0];
    expect(esVersionVigente(documento, DOCUMENTOS_LEGALES[documento].version)).toBe(true);
    expect(esVersionVigente(documento, "0.0.0")).toBe(false);
  });
});
