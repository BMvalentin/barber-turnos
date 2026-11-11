import { describe, expect, it } from "vitest";
import { resolverDestinatariosUnicos } from "./resolver-destinatarios-nueva-reserva";

describe("resolverDestinatariosUnicos", () => {
  it("normaliza y deduplica administradores y barbero asignado", () => {
    const destinatarios = resolverDestinatariosUnicos([
      { email: " Admin@ejemplo.com ", tipo: "administrador" },
      { email: "admin@ejemplo.com", tipo: "administrador" },
      { email: "barbero@ejemplo.com", tipo: "administrador" },
      { email: "BARBERO@ejemplo.com", tipo: "barbero" },
    ]);

    expect(destinatarios).toEqual([
      { email: "admin@ejemplo.com", tipo: "administrador" },
      { email: "barbero@ejemplo.com", tipo: "barbero" },
    ]);
  });

  it("omite direcciones vacías o inválidas", () => {
    expect(resolverDestinatariosUnicos([
      { email: null, tipo: "administrador" },
      { email: "no-es-un-correo", tipo: "administrador" },
      { email: "", tipo: "barbero" },
    ])).toEqual([]);
  });
});
