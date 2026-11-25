import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateVAPIDKeys, WebPushError } from "web-push";

const mocks = vi.hoisted(() => ({ findMany: vi.fn(), deleteMany: vi.fn(), enviar: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: { suscripcion_push: { findMany: mocks.findMany, deleteMany: mocks.deleteMany } },
}));
vi.mock("web-push", async (importar) => ({
  ...await importar<typeof import("web-push")>(),
  sendNotification: mocks.enviar,
}));

import { enviarAvisoPushTurno } from "./enviar-aviso-push-turno";

const turno = { id: "turno", userId: "cliente", barberoId: "barbero", horarioReservado: new Date("2026-11-25T16:00:00Z") };
const suscripcion = {
  id: "dispositivo",
  userId: "destinatario",
  actualizadoEn: new Date(0),
  endpoint: "https://fcm.googleapis.com/fcm/send/dispositivo",
  clavePublica: "clave",
  auth: "auth",
};
const claves = generateVAPIDKeys();

describe("enviarAvisoPushTurno", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-25T15:45:00Z"));
    vi.stubEnv("VAPID_PUBLIC_KEY", claves.publicKey);
    vi.stubEnv("VAPID_PRIVATE_KEY", claves.privateKey);
    vi.stubEnv("VAPID_SUBJECT", "mailto:push@example.com");
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.findMany.mockResolvedValue([suscripcion]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("busca exclusivamente la cuenta del barbero asignado y abre su agenda", async () => {
    await expect(enviarAvisoPushTurno(turno, "NUEVO_BARBERO")).resolves.toEqual({ enviados: 1, reintentar: false });
    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        claveVapid: claves.publicKey,
        user: {
          esInvitado: false,
          role: { in: ["ADMIN", "EMPLEADO"] },
          barbero: { id: "barbero", estado: true, turnos: { some: { id: "turno", estado: { in: ["PENDIENTE", "CONFIRMADO"] } } } },
        },
      },
    }));
    const [, mensaje] = mocks.enviar.mock.calls[0];
    expect(JSON.parse(mensaje)).toEqual({
      titulo: "Nuevo turno en tu agenda",
      cuerpo: "Abrí tu agenda para ver la reserva.",
      destino: "/admin/turno?agenda=personal",
      tag: expect.stringMatching(/^[a-f0-9]{32}$/),
    });
  });

  it("restringe recordatorios a la cuenta y horario vigentes y fija su vencimiento", async () => {
    await enviarAvisoPushTurno(turno, "RECORDATORIO");
    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        claveVapid: claves.publicKey,
        user: {
          esInvitado: false,
          id: "cliente",
          turno: { some: { id: "turno", horarioReservado: turno.horarioReservado, estado: "CONFIRMADO" } },
        },
      },
    }));
    expect(mocks.enviar).toHaveBeenCalledWith(expect.anything(), expect.any(String), expect.objectContaining({ TTL: 900 }));
  });

  it("borra las suscripciones vencidas sin borrar una activación posterior", async () => {
    mocks.enviar.mockRejectedValue(new WebPushError("Vencida", 410, {}, "", suscripcion.endpoint));
    await expect(enviarAvisoPushTurno(turno, "CONFIRMADO")).resolves.toEqual({ enviados: 0, reintentar: false });
    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: { id: suscripcion.id, userId: suscripcion.userId, actualizadoEn: suscripcion.actualizadoEn },
    });
  });

  it("distingue un fallo recuperable de un resultado parcialmente entregado", async () => {
    const error = new WebPushError("No disponible", 503, {}, "", suscripcion.endpoint);
    mocks.enviar.mockRejectedValue(error);
    await expect(enviarAvisoPushTurno(turno, "RECORDATORIO")).resolves.toEqual({ enviados: 0, reintentar: true });
    mocks.findMany.mockResolvedValue([suscripcion, { ...suscripcion, id: "otro" }]);
    mocks.enviar.mockResolvedValueOnce({ statusCode: 201 });
    await expect(enviarAvisoPushTurno(turno, "RECORDATORIO")).resolves.toEqual({ enviados: 1, reintentar: false });
    expect(mocks.deleteMany).not.toHaveBeenCalled();
  });

  it("omite el envío sin configuración o si el recordatorio venció", async () => {
    vi.stubEnv("VAPID_PRIVATE_KEY", undefined);
    await expect(enviarAvisoPushTurno(turno, "CONFIRMADO")).resolves.toEqual({ enviados: 0, reintentar: false });
    vi.stubEnv("VAPID_PRIVATE_KEY", claves.privateKey);
    vi.setSystemTime(turno.horarioReservado);
    await expect(enviarAvisoPushTurno(turno, "RECORDATORIO")).resolves.toEqual({ enviados: 0, reintentar: false });
    expect(mocks.findMany).not.toHaveBeenCalled();
  });
});
