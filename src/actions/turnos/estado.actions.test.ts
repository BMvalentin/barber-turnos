import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  requerirAdmin: vi.fn(),
  actualizarEnTransaccion: vi.fn(),
  enviarCancelacion: vi.fn(),
  enviarTurno: vi.fn(),
  enviarBarbero: vi.fn(),
  serializar: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { turno: { findUnique: mocks.findUnique } } }));
vi.mock("@/lib/seguridad/requerir-admin", () => ({ requerirAdmin: mocks.requerirAdmin }));
vi.mock("@/lib/turnos/actualizar-turno-en-transaccion", () => ({
  actualizarTurnoEnTransaccion: mocks.actualizarEnTransaccion,
}));
vi.mock("@/lib/email/enviar-email-cancelacion-turno-seguro", () => ({
  enviarEmailCancelacionTurnoSeguro: mocks.enviarCancelacion,
}));
vi.mock("@/lib/email/enviar-email-turno-seguro", () => ({ enviarEmailTurnoSeguro: mocks.enviarTurno }));
vi.mock("@/lib/email/enviar-email-turno-barbero-seguro", () => ({ enviarEmailTurnoBarberoSeguro: mocks.enviarBarbero }));
vi.mock("@/lib/revalidar/revalidar-cache-turno", () => ({ revalidarCacheTurno: vi.fn() }));
vi.mock("@/lib/serializar-turno-con-detalle", () => ({ serializarTurnoConDetalle: mocks.serializar }));

import { actualizarTurno } from "./estado.actions";

const fecha = new Date("2026-12-10T15:00:00.000Z");
const turno = {
  servicioId: "servicio-1",
  barberoId: "barbero-1",
  horarioReservado: fecha,
  estado: "PENDIENTE",
  estadoPago: "PENDIENTE",
};
const turnoCancelado = {
  id: "turno-1",
  userId: "cliente-1",
  servicioId: "servicio-1",
  barberoId: "barbero-1",
  horarioReservado: fecha,
  estado: "CANCELADO",
  estadoPago: "RECHAZADO",
  user: { email: "cliente@example.com", esInvitado: false },
  barbero: { email: "barbero@example.com" },
  servicio: { nombre: "Corte" },
};

function formularioCancelacion(): FormData {
  const formData = new FormData();
  formData.set("id", "turno-1");
  formData.set("estado", "CANCELADO");
  return formData;
}

describe("actualizarTurno: cancelación administrativa", () => {
  beforeEach(() => {
    mocks.findUnique.mockResolvedValue(turno);
    mocks.requerirAdmin.mockResolvedValue({ user: { id: "admin-1" } });
    mocks.actualizarEnTransaccion.mockResolvedValue({
      ok: true,
      turno: turnoCancelado,
      turnoAnterior: turno,
    });
    mocks.enviarCancelacion.mockResolvedValue(undefined);
  });

  afterEach(() => vi.clearAllMocks());

  it("envía la notificación administrativa tras la transición", async () => {
    const resultado = await actualizarTurno({}, formularioCancelacion());

    expect(resultado.success).toBe(true);
    expect(mocks.enviarCancelacion).toHaveBeenCalledWith(turnoCancelado, "ADMINISTRADOR");
    expect(mocks.enviarTurno).not.toHaveBeenCalled();
  });

  it("no reenvía el evento si el turno ya estaba cancelado", async () => {
    mocks.actualizarEnTransaccion.mockResolvedValue({
      ok: true,
      turno: turnoCancelado,
      turnoAnterior: turnoCancelado,
    });

    await actualizarTurno({}, formularioCancelacion());

    expect(mocks.enviarCancelacion).not.toHaveBeenCalled();
  });

  it("no envía avisos cuando la transición es rechazada", async () => {
    mocks.actualizarEnTransaccion.mockResolvedValue({ ok: false, error: "Horario ocupado" });

    const resultado = await actualizarTurno({}, formularioCancelacion());

    expect(resultado.success).toBe(false);
    expect(mocks.enviarCancelacion).not.toHaveBeenCalled();
  });

  it("identifica la agenda que debe refrescarse si al reprogramar se ocupó el horario", async () => {
    const horario = "2099-12-15T15:30:00.000Z";
    const formulario = new FormData();
    formulario.set("id", "turno-1");
    formulario.set("barberoId", "barbero-2");
    formulario.set("horarioReservado", horario);
    mocks.actualizarEnTransaccion.mockResolvedValue({ ok: false, error: "Horario ocupado" });

    expect(await actualizarTurno({}, formulario)).toEqual({
      success: false,
      error: "Horario ocupado",
      horarioNoDisponible: { barberoId: "barbero-2", horario },
    });
  });
});

describe("actualizarTurno: turnos completados", () => {
  afterEach(() => vi.clearAllMocks());

  it.each(["CONFIRMADO"])("guarda desde %s sin enviar correos", async (estadoAnterior) => {
    const turnoAnterior = { ...turno, estado: estadoAnterior };
    const turnoCompletado = { ...turnoCancelado, estado: "COMPLETADO", estadoPago: turnoAnterior.estadoPago };
    mocks.findUnique.mockResolvedValue(turnoAnterior);
    mocks.requerirAdmin.mockResolvedValue({ user: { id: "admin-1" } });
    mocks.actualizarEnTransaccion.mockResolvedValue({ ok: true, turno: turnoCompletado, turnoAnterior });
    mocks.serializar.mockReturnValue(turnoCompletado);

    const formulario = new FormData();
    formulario.set("id", turnoCompletado.id);
    formulario.set("estado", turnoCompletado.estado);

    expect(await actualizarTurno({}, formulario)).toEqual({ success: true, data: turnoCompletado });
    expect(mocks.enviarTurno).not.toHaveBeenCalled();
    expect(mocks.enviarBarbero).not.toHaveBeenCalled();
    expect(mocks.enviarCancelacion).not.toHaveBeenCalled();
  });
});
