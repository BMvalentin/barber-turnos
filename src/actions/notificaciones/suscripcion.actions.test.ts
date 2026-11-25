import { createECDH, randomBytes } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requerirSesion: vi.fn(),
  findUnique: vi.fn(),
  upsert: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock("@/lib/seguridad/requerir-sesion", () => ({ requerirSesion: mocks.requerirSesion }));
vi.mock("@/lib/notificaciones/configuracion-push", () => ({
  obtenerConfiguracionPush: () => ({ publicKey: "clave-publica-de-prueba" }),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { suscripcion_push: { findUnique: mocks.findUnique, upsert: mocks.upsert, deleteMany: mocks.deleteMany } },
}));

import { consultarSuscripcionPush, eliminarSuscripcionPush, guardarSuscripcionPush } from "./suscripcion.actions";

const suscripcion = {
  endpoint: "https://fcm.googleapis.com/fcm/send/dispositivo",
  keys: {
    p256dh: createECDH("prime256v1").generateKeys().toString("base64url"),
    auth: randomBytes(16).toString("base64url"),
  },
};

describe("suscripciones push por cuenta", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requerirSesion.mockResolvedValue({ user: { id: "cuenta" } });
  });

  it("requiere sesión para consultar, activar o desactivar", async () => {
    mocks.requerirSesion.mockResolvedValue(null);
    await expect(consultarSuscripcionPush(suscripcion.endpoint)).resolves.toMatchObject({ success: false });
    await expect(guardarSuscripcionPush(suscripcion)).resolves.toMatchObject({ success: false });
    await expect(eliminarSuscripcionPush(suscripcion.endpoint)).resolves.toMatchObject({ success: false });
    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.upsert).not.toHaveBeenCalled();
    expect(mocks.deleteMany).not.toHaveBeenCalled();
  });

  it.each([
    { ...suscripcion, endpoint: "http://fcm.googleapis.com/fcm/send/dispositivo" },
    { ...suscripcion, endpoint: "https://example.com/fcm/send/dispositivo" },
    { ...suscripcion, endpoint: "https://fcm.googleapis.com:8443/fcm/send/dispositivo" },
    { ...suscripcion, keys: { ...suscripcion.keys, auth: "invalida" } },
  ])("rechaza altas con un destino o claves inválidas", async (entrada) => {
    await expect(guardarSuscripcionPush(entrada)).resolves.toMatchObject({ success: false });
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it("usa el mismo índice en un reintento y obtiene la cuenta de la sesión", async () => {
    await expect(guardarSuscripcionPush({ ...suscripcion, userId: "otra" })).resolves.toEqual({ success: true, activa: true });
    await expect(guardarSuscripcionPush(suscripcion)).resolves.toEqual({ success: true, activa: true });
    expect(mocks.upsert).toHaveBeenCalledTimes(2);
    expect(mocks.upsert.mock.calls[0]).toEqual(mocks.upsert.mock.calls[1]);
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({
      update: expect.objectContaining({ user: { connect: { id: "cuenta" } } }),
    }));
  });

  it("consulta y elimina solo las suscripciones de la cuenta actual", async () => {
    await expect(consultarSuscripcionPush(suscripcion.endpoint)).resolves.toEqual({ success: true, activa: false });
    await expect(eliminarSuscripcionPush(suscripcion.endpoint)).resolves.toEqual({ success: true, activa: false });
    expect(mocks.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { endpointHash: expect.any(String), userId: "cuenta", claveVapid: "clave-publica-de-prueba" },
    }));
    expect(mocks.deleteMany).toHaveBeenCalledWith({ where: { endpointHash: expect.any(String), userId: "cuenta" } });
  });
});
