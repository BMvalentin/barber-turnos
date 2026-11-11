import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  updateMany: vi.fn(),
  findUniqueTx: vi.fn(),
  transaction: vi.fn(),
  requerirSesion: vi.fn(),
  requerirAdmin: vi.fn(),
  enviarCancelacion: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    turno: { findUnique: mocks.findUnique },
    $transaction: mocks.transaction,
  },
}));
vi.mock("@/lib/seguridad/requerir-sesion", () => ({ requerirSesion: mocks.requerirSesion }));
vi.mock("@/lib/seguridad/requerir-admin", () => ({ requerirAdmin: mocks.requerirAdmin }));
vi.mock("@/lib/email/enviar-email-cancelacion-turno-seguro", () => ({
  enviarEmailCancelacionTurnoSeguro: mocks.enviarCancelacion,
}));
vi.mock("@/lib/revalidar/revalidar-cache-turno", () => ({ revalidarCacheTurno: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { cancelTurno } from "./cancelar-turno.actions";

const fechaFutura = new Date(Date.now() + 60 * 60 * 1000);
let estadoPersistido: "PENDIENTE" | "CONFIRMADO" | "CANCELADO" = "PENDIENTE";
const turnoCancelado = {
  id: "turno-1",
  userId: "cliente-1",
  barberoId: "barbero-1",
  horarioReservado: fechaFutura,
  estado: "CANCELADO",
  estadoPago: "RECHAZADO",
  metodoPago: "TRANSFERENCIA",
  tipoPago: "SEÑA",
  precioCongelado: 1000,
  seniaCongelada: 200,
  clienteEmail: "cliente@example.com",
  user: { id: "cliente-1", email: "cliente@example.com", name: "Cliente", esInvitado: false },
  barbero: { id: "barbero-1", nombre: "Julian", email: "barbero@example.com" },
  servicio: { nombre: "Corte" },
};

describe("cancelTurno", () => {
  beforeEach(() => {
    estadoPersistido = "PENDIENTE";
    mocks.findUnique.mockResolvedValue({ userId: "cliente-1", horarioReservado: fechaFutura });
    mocks.updateMany.mockImplementation(async () => {
      if (estadoPersistido === "CANCELADO") return { count: 0 };
      estadoPersistido = "CANCELADO";
      return { count: 1 };
    });
    mocks.findUniqueTx.mockResolvedValue(turnoCancelado);
    mocks.transaction.mockImplementation((callback) => callback({
      turno: { updateMany: mocks.updateMany, findUnique: mocks.findUniqueTx },
    }));
    mocks.requerirSesion.mockResolvedValue({ user: { id: "cliente-1" } });
    mocks.requerirAdmin.mockResolvedValue(null);
    mocks.enviarCancelacion.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it.each(["PENDIENTE", "CONFIRMADO"] as const)(
    "envía avisos después de persistir la cancelación de un turno %s",
    async (estado) => {
      estadoPersistido = estado;
      mocks.findUniqueTx.mockResolvedValue({ ...turnoCancelado, estadoPago: "RECHAZADO" });

      const resultado = await cancelTurno("turno-1");

      expect(resultado.success).toBe(true);
      expect(estadoPersistido).toBe("CANCELADO");
      expect(mocks.transaction).toHaveBeenCalledTimes(1);
      expect(mocks.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          estado: { not: "CANCELADO" },
        }),
      }));
      expect(mocks.enviarCancelacion).toHaveBeenCalledWith(
        expect.objectContaining({ estado: "CANCELADO" }),
        "CLIENTE",
      );
    },
  );

  it("marca el actor como administrador cuando cancela desde una sesión admin", async () => {
    mocks.requerirSesion.mockResolvedValue({ user: { id: "admin-1" } });
    mocks.requerirAdmin.mockResolvedValue({ user: { id: "admin-1" } });

    await cancelTurno("turno-1");

    expect(mocks.enviarCancelacion).toHaveBeenCalledWith(
      expect.objectContaining({ estado: "CANCELADO" }),
      "ADMINISTRADOR",
    );
  });

  it("no vuelve a avisar si una petición repetida ya no encuentra un estado activo", async () => {
    mocks.updateMany.mockResolvedValue({ count: 0 });

    const resultado = await cancelTurno("turno-1");

    expect(resultado.success).toBe(false);
    expect(mocks.findUniqueTx).not.toHaveBeenCalled();
    expect(mocks.enviarCancelacion).not.toHaveBeenCalled();
  });

  it("rechaza una cancelación fuera de la ventana y no toca el correo", async () => {
    mocks.findUnique.mockResolvedValue({
      userId: "cliente-1",
      horarioReservado: new Date(Date.now() - 60 * 1000),
    });

    const resultado = await cancelTurno("turno-1");

    expect(resultado.success).toBe(false);
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.enviarCancelacion).not.toHaveBeenCalled();
  });

  it("no permite que otro cliente cancele el turno", async () => {
    mocks.requerirSesion.mockResolvedValue({ user: { id: "otro-cliente" } });

    const resultado = await cancelTurno("turno-1");

    expect(resultado.success).toBe(false);
    expect(resultado.error).toBe("No autorizado");
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.enviarCancelacion).not.toHaveBeenCalled();
  });
});
