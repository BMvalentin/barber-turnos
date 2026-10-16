import { describe, expect, it } from "vitest";
import { construirAceptacionesVigentes } from "@/lib/legal/consentimiento";
import { DOCUMENTOS_CON_ACEPTACION } from "@/lib/legal/documentos";
import {
  REACEPTACION_ACTIVA,
  documentosConVersionVencida,
  requiereReaceptacion,
} from "@/lib/legal/reaceptacion";

describe("re-aceptación (estrategia inerte)", () => {
  it("no marca pendientes cuando las versiones coinciden con las vigentes", () => {
    expect(documentosConVersionVencida(construirAceptacionesVigentes())).toEqual([]);
  });

  it("marca todos los obligatorios cuando no hay aceptaciones registradas", () => {
    expect(documentosConVersionVencida([])).toEqual([...DOCUMENTOS_CON_ACEPTACION]);
  });

  it("permanece desactivada por defecto y no fuerza re-aceptación", () => {
    expect(REACEPTACION_ACTIVA).toBe(false);
    expect(requiereReaceptacion([])).toBe(false);
  });
});
