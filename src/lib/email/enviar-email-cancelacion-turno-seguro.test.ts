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

import { enviarEmailCancelacionTurnoSeguro } from "./enviar-email-cancelacion-turno-seguro";

const turnoBase = {
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

describe("enviarEmailCancelacionTurnoSeguro", () => {
  beforeEach(() => {
    mocks.pageConfigFindUnique.mockResolvedValue({ email: "admin@example.com" });
    mocks.userFindMany.mockResolvedValue([
      { email: "admin@example.com" },
      { email: "otro-admin@example.com" },
    ]);
    mocks.sendTurnoEmail.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it.each(["PENDIENTE", "CONFIRMADO"] as const)(
    "notifica al cliente, al admin y al barbero correcto al cancelar un turno %s",
    async (estado) => {
      await enviarEmailCancelacionTurnoSeguro(
        { ...turnoBase, estado },
        "CLIENTE",
      );

      expect(mocks.sendTurnoEmail).toHaveBeenCalledTimes(4);
      expect(mocks.sendTurnoEmail).toHaveBeenCalledWith(
        "cliente@example.com",
        expect.objectContaining({ estado: "CANCELADO", estadoTurno: "CANCELADO", canceladoPor: "CLIENTE" }),
        "cliente",
      );
      expect(mocks.sendTurnoEmail).toHaveBeenCalledWith(
        "barbero@example.com",
        expect.objectContaining({ canceladoPor: "CLIENTE", barberoNombre: "Julian" }),
        "barbero",
      );
      expect(mocks.sendTurnoEmail).toHaveBeenCalledWith(
        "admin@example.com",
        expect.objectContaining({ canceladoPor: "CLIENTE", clienteNombre: "Valentín Méndez" }),
        "administrador",
      );
    },
  );

  it("identifica la cancelación realizada por el administrador", async () => {
    await enviarEmailCancelacionTurnoSeguro(turnoBase, "ADMINISTRADOR");

    expect(mocks.sendTurnoEmail).toHaveBeenCalledWith(
      "barbero@example.com",
      expect.objectContaining({ canceladoPor: "ADMINISTRADOR" }),
      "barbero",
    );
  });

  it("no envía al barbero sin correo y conserva los avisos al cliente y admin", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await enviarEmailCancelacionTurnoSeguro(
      { ...turnoBase, barbero: { ...turnoBase.barbero, email: null } },
      "CLIENTE",
    );

    expect(mocks.sendTurnoEmail).toHaveBeenCalledTimes(3);
    expect(mocks.sendTurnoEmail).not.toHaveBeenCalledWith(
      "barbero@example.com",
      expect.anything(),
      "barbero",
    );
    expect(error).toHaveBeenCalledWith(
      "No se enviará el aviso al barbero: el perfil asignado no tiene un correo válido.",
    );
  });

  it("registra el problema cuando la dirección del barbero tiene un formato inválido", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await enviarEmailCancelacionTurnoSeguro(
      { ...turnoBase, barbero: { ...turnoBase.barbero, email: "correo-inválido" } },
      "CLIENTE",
    );

    expect(mocks.sendTurnoEmail).not.toHaveBeenCalledWith(
      "correo-inválido",
      expect.anything(),
      "barbero",
    );
    expect(error).toHaveBeenCalledWith(
      "No se enviará el aviso al barbero: el perfil asignado no tiene un correo válido.",
    );
  });

  it("sin correo administrativo avisa al cliente y al barbero asignado", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.pageConfigFindUnique.mockResolvedValue(null);
    mocks.userFindMany.mockResolvedValue([]);

    await enviarEmailCancelacionTurnoSeguro(turnoBase, "ADMINISTRADOR");

    expect(mocks.sendTurnoEmail).toHaveBeenCalledTimes(2);
    expect(error).toHaveBeenCalledWith(
      "No se enviará el aviso de cancelación: falta un correo administrativo válido.",
    );
  });

  it("no propaga fallos del proveedor y registra solo un error genérico", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.sendTurnoEmail
      .mockRejectedValueOnce(new Error("respuesta sensible del proveedor"))
      .mockResolvedValue({ success: false, error: "detalle interno" });

    await expect(
      enviarEmailCancelacionTurnoSeguro(turnoBase, "CLIENTE"),
    ).resolves.toBeUndefined();

    expect(mocks.sendTurnoEmail).toHaveBeenCalledTimes(4);
    expect(error).toHaveBeenCalledWith("Falló un envío de notificación de cancelación.");
    expect(error).not.toHaveBeenCalledWith(expect.stringContaining("respuesta sensible"));
  });

  it("deduplica el correo del barbero cuando coincide con un administrador", async () => {
    const turnoCompartido = {
      ...turnoBase,
      barbero: { ...turnoBase.barbero, email: "admin@example.com" },
    };

    await enviarEmailCancelacionTurnoSeguro(turnoCompartido, "CLIENTE");

    expect(mocks.sendTurnoEmail).toHaveBeenCalledTimes(3);
    expect(mocks.sendTurnoEmail).toHaveBeenCalledWith(
      "admin@example.com",
      expect.anything(),
      "barbero",
    );
  });
});
