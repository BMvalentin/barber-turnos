import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  pageConfigFindUnique: vi.fn(),
  userFindMany: vi.fn(),
  sendTurnoEmail: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pageConfig: { findUnique: mocks.pageConfigFindUnique },
    user: { findMany: mocks.userFindMany },
  },
}));

vi.mock("./send-turno-email", () => ({
  sendTurnoEmail: mocks.sendTurnoEmail,
}));

import { enviarEmailNuevaReservaSeguro } from "./enviar-email-nueva-reserva-seguro";

const turno = {
  clienteNombre: "Valentín",
  clienteApellido: "Méndez",
  clienteTelefono: "2231234567",
  clienteEmail: "cliente@example.com",
  estado: "PENDIENTE" as const,
  estadoPago: "PENDIENTE" as const,
  metodoPago: "TRANSFERENCIA",
  tipoPago: "SEÑA",
  horarioReservado: new Date("2026-12-10T15:00:00.000Z"),
  precioCongelado: 1000,
  seniaCongelada: 200,
  user: {
    email: "cliente@example.com",
    name: "Valentín Méndez",
    telefono: "2231234567",
    esInvitado: false,
  },
  servicio: { nombre: "Corte" },
  barbero: { nombre: "Julian", email: "barbero@example.com" },
};

describe("enviarEmailNuevaReservaSeguro", () => {
  beforeEach(() => {
    mocks.pageConfigFindUnique.mockResolvedValue({ email: "admin@example.com" });
    mocks.userFindMany.mockResolvedValue([{ email: "admin@example.com" }, { email: "otro-admin@example.com" }]);
    mocks.sendTurnoEmail.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("envía una sola vez a cada dirección única, incluso si el barbero también es administrador", async () => {
    const turnoCompartido = {
      ...turno,
      barbero: { ...turno.barbero, email: "admin@example.com" },
    };

    await enviarEmailNuevaReservaSeguro(turnoCompartido);

    expect(mocks.sendTurnoEmail).toHaveBeenCalledTimes(2);
    expect(mocks.sendTurnoEmail.mock.calls.map(([email]) => email).sort()).toEqual([
      "admin@example.com",
      "otro-admin@example.com",
    ]);
  });

  it("envía al barbero aunque falten direcciones administrativas y registra el problema", async () => {
    mocks.pageConfigFindUnique.mockResolvedValue(null);
    mocks.userFindMany.mockResolvedValue([]);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await enviarEmailNuevaReservaSeguro(turno);

    expect(mocks.sendTurnoEmail).toHaveBeenCalledTimes(1);
    expect(mocks.sendTurnoEmail).toHaveBeenCalledWith(
      "barbero@example.com",
      expect.objectContaining({ estado: "NUEVA_RESERVA" }),
      "barbero",
    );
    expect(error).toHaveBeenCalledWith(
      "No se enviará el aviso de nueva reserva: falta un correo administrativo válido.",
    );
  });

  it("envía al administrador si el barbero no tiene un correo válido", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const turnoSinEmailBarbero = {
      ...turno,
      barbero: { ...turno.barbero, email: null },
    };

    await enviarEmailNuevaReservaSeguro(turnoSinEmailBarbero);

    expect(mocks.sendTurnoEmail).toHaveBeenCalledTimes(2);
    expect(error).toHaveBeenCalledWith(
      "No se enviará el aviso al barbero: falta un correo válido en el perfil asignado.",
    );
  });

  it("no propaga fallos de Resend ni cancela el flujo de reserva", async () => {
    mocks.sendTurnoEmail.mockResolvedValue({ success: false, error: "Fallo simulado" });
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(enviarEmailNuevaReservaSeguro(turno)).resolves.toBeUndefined();
    expect(mocks.sendTurnoEmail).toHaveBeenCalledTimes(3);
  });
});
