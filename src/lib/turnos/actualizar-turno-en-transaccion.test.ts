import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUniqueInicial: vi.fn(),
  findUniqueTx: vi.fn(),
  updateMany: vi.fn(),
  update: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    turno: { findUnique: mocks.findUniqueInicial },
    $transaction: mocks.transaction,
  },
}));
vi.mock("@/lib/turnos/ejecutar-con-bloque-reserva", () => ({
  ejecutarConBloqueReserva: async (_tx: unknown, _barberoId: string, callback: () => Promise<unknown>) => callback(),
}));

import { actualizarTurnoEnTransaccion } from "./actualizar-turno-en-transaccion";

const turnoAnterior = {
  id: "turno-1",
  userId: "cliente-1",
  servicioId: "servicio-1",
  barberoId: "barbero-1",
  horarioReservado: new Date("2026-12-10T15:00:00.000Z"),
  estado: "PENDIENTE",
  estadoPago: "PENDIENTE",
  precioCongelado: 1000,
  seniaCongelada: 200,
  user: {},
  barbero: {},
  servicio: {},
};

describe("actualizarTurnoEnTransaccion al cancelar", () => {
  afterEach(() => vi.clearAllMocks());

  it("usa una actualización condicional para que una carrera solo gane una vez", async () => {
    const turnoCancelado = { ...turnoAnterior, estado: "CANCELADO", estadoPago: "RECHAZADO" };
    mocks.findUniqueInicial.mockResolvedValue({ barberoId: "barbero-1" });
    mocks.findUniqueTx
      .mockResolvedValueOnce(turnoAnterior)
      .mockResolvedValueOnce(turnoCancelado);
    mocks.updateMany.mockResolvedValue({ count: 1 });
    mocks.transaction.mockImplementation((callback) => callback({
      turno: {
        findUnique: mocks.findUniqueTx,
        updateMany: mocks.updateMany,
        update: mocks.update,
      },
    }));

    const resultado = await actualizarTurnoEnTransaccion({
      id: "turno-1",
      servicioId: "servicio-1",
      barberoId: "barbero-1",
      horario: turnoAnterior.horarioReservado,
      estado: "CANCELADO",
      estadoPago: "RECHAZADO",
      idUsuarioActual: "admin-1",
    });

    expect(resultado.ok).toBe(true);
    expect(mocks.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "turno-1", estado: "PENDIENTE" },
    }));
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("rechaza la segunda transición concurrente sin volver a escribir el estado", async () => {
    mocks.findUniqueInicial.mockResolvedValue({ barberoId: "barbero-1" });
    mocks.findUniqueTx.mockResolvedValueOnce(turnoAnterior);
    mocks.updateMany.mockResolvedValue({ count: 0 });
    mocks.transaction.mockImplementation((callback) => callback({
      turno: {
        findUnique: mocks.findUniqueTx,
        updateMany: mocks.updateMany,
        update: mocks.update,
      },
    }));

    const resultado = await actualizarTurnoEnTransaccion({
      id: "turno-1",
      servicioId: "servicio-1",
      barberoId: "barbero-1",
      horario: turnoAnterior.horarioReservado,
      estado: "CANCELADO",
      estadoPago: "RECHAZADO",
      idUsuarioActual: "admin-1",
    });

    expect(resultado).toEqual({
      ok: false,
      error: "El turno ya fue cancelado o dejó de estar disponible",
    });
    expect(mocks.updateMany).toHaveBeenCalledTimes(1);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
