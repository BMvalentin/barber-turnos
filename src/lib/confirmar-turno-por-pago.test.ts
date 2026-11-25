import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmarTurnoPorPago } from "./confirmar-turno-por-pago";

const dependencias = vi.hoisted(() => ({
  after: vi.fn<(tarea: () => unknown) => void>(),
  enviarEmails: vi.fn(),
  enviarPush: vi.fn(),
  buscarTurno: vi.fn(),
  confirmarTurno: vi.fn(),
}));

vi.mock("next/server", () => ({ after: dependencias.after }));
vi.mock("@/lib/prisma", () => ({
  prisma: { turno: { findUnique: dependencias.buscarTurno, updateMany: dependencias.confirmarTurno } },
}));
vi.mock("@/lib/email/enviar-emails-turno-confirmado", () => ({ enviarEmailsTurnoConfirmado: dependencias.enviarEmails }));
vi.mock("@/lib/revalidar/revalidar-cache-turno", () => ({ revalidarCacheTurno: vi.fn() }));
vi.mock("@/lib/notificaciones/enviar-aviso-push-turno", () => ({ enviarAvisoPushTurno: dependencias.enviarPush }));

const horarioReservado = new Date("2099-03-20T14:00:00.000Z");
const turno = {
  id: "turno-1",
  userId: "cliente-1",
  barberoId: "barbero-1",
  estado: "PENDIENTE",
  estadoPago: "PENDIENTE",
  metodoPago: "MERCADO_PAGO",
  precioCongelado: 1000,
  seniaCongelada: 200,
  tipoPago: "SEÑA",
  horarioReservado,
  claveSlot: `barbero-1|${horarioReservado.toISOString()}`,
  mpPaymentId: null,
};
const pago = {
  turnoId: turno.id,
  montoPago: 200,
  referencia: turno.id,
  estadoPago: "approved",
  paymentId: "123",
};
const turnoConfirmado = { ...turno, estado: "CONFIRMADO", estadoPago: "SEÑADO", mpPaymentId: pago.paymentId };

describe("avisos al confirmar un pago", () => {
  beforeEach(() => vi.resetAllMocks());

  it("programa un único aviso después de que el pago confirma el turno", async () => {
    dependencias.buscarTurno.mockResolvedValueOnce(turno).mockResolvedValue(turnoConfirmado);
    dependencias.confirmarTurno.mockResolvedValue({ count: 1 });

    await expect(confirmarTurnoPorPago(pago)).resolves.toEqual({ ok: true, turnoId: turno.id });
    await expect(confirmarTurnoPorPago(pago)).resolves.toEqual({ ok: true, yaConfirmado: true, turnoId: turno.id });
    expect(dependencias.confirmarTurno).toHaveBeenCalledTimes(1);
    expect(dependencias.after).toHaveBeenCalledTimes(1);
    expect(dependencias.enviarEmails).not.toHaveBeenCalled();
    expect(dependencias.enviarPush).not.toHaveBeenCalled();

    await dependencias.after.mock.lastCall?.[0]();

    expect(dependencias.enviarPush.mock.calls).toEqual([[turnoConfirmado, "CONFIRMADO"]]);
    expect(dependencias.enviarEmails.mock.calls).toEqual([[turnoConfirmado]]);
  });

  it("omite el aviso si otro procesamiento ganó la confirmación", async () => {
    dependencias.buscarTurno.mockResolvedValueOnce(turno).mockResolvedValueOnce(turnoConfirmado);
    dependencias.confirmarTurno.mockResolvedValue({ count: 0 });

    await expect(confirmarTurnoPorPago(pago)).resolves.toEqual({ ok: true, yaConfirmado: true, turnoId: turno.id });
    expect(dependencias.after).not.toHaveBeenCalled();
  });

  it("omite el aviso y la confirmación ante un pago rechazado", async () => {
    dependencias.buscarTurno.mockResolvedValue(turno);

    await expect(confirmarTurnoPorPago({ ...pago, estadoPago: "rejected" })).resolves.toMatchObject({ ok: false });
    expect(dependencias.confirmarTurno).not.toHaveBeenCalled();
    expect(dependencias.after).not.toHaveBeenCalled();
  });
});
