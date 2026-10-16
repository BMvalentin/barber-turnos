import { describe, expect, it } from "vitest";
import {
  REDIRECCION_CONSENTIMIENTO_GOOGLE,
  decidirIngresoGoogle,
} from "@/lib/legal/gate-google";

describe("gate de Google OAuth", () => {
  it("permite el ingreso de una cuenta ya vinculada (usuario existente)", () => {
    expect(
      decidirIngresoGoogle({ cuentaExistente: true, usuarioPorCorreo: false, tieneIntencion: false }),
    ).toEqual({ permitir: true });
  });

  it("permite cuando ya existe un usuario con el mismo correo", () => {
    expect(
      decidirIngresoGoogle({ cuentaExistente: false, usuarioPorCorreo: true, tieneIntencion: false }),
    ).toEqual({ permitir: true });
  });

  it("permite una cuenta nueva solo con intención de consentimiento válida", () => {
    expect(
      decidirIngresoGoogle({ cuentaExistente: false, usuarioPorCorreo: false, tieneIntencion: true }),
    ).toEqual({ permitir: true });
  });

  it("rechaza y redirige a /register cuando falta el consentimiento", () => {
    expect(
      decidirIngresoGoogle({ cuentaExistente: false, usuarioPorCorreo: false, tieneIntencion: false }),
    ).toEqual({ permitir: false, redirigir: REDIRECCION_CONSENTIMIENTO_GOOGLE });
  });
});
