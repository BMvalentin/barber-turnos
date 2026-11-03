import { describe, expect, it } from "vitest";
import { listarDocumentosLegales, obtenerDocumentoLegalPorSlug } from "@/lib/legal/documentos";

describe("documentos legales", () => {
  it("cada documento tiene versión semántica, fecha ISO válida y secciones", () => {
    for (const documento of listarDocumentosLegales()) {
      expect(documento.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(Number.isNaN(new Date(`${documento.vigenteDesde}T00:00:00`).getTime())).toBe(false);
      expect(documento.secciones.length).toBeGreaterThan(0);
      expect(documento.slug.length).toBeGreaterThan(0);
    }
  });

  it("resuelve documentos por slug y no confunde slugs inexistentes", () => {
    expect(obtenerDocumentoLegalPorSlug("terminos")?.clave).toBe("terminos");
    expect(obtenerDocumentoLegalPorSlug("privacidad")?.clave).toBe("privacidad");
    expect(obtenerDocumentoLegalPorSlug("inexistente")).toBeUndefined();
  });
});
