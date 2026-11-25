import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/cron/recordar-turnos/route";
import { recordarTurnos } from "./recordar-turnos";

const mocks = vi.hoisted(() => ({
  buscar: vi.fn(),
  actualizar: vi.fn(),
  enviar: vi.fn(),
  configuracion: vi.fn(),
  campoHorario: Symbol("horarioReservado"),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    turno: {
      findMany: mocks.buscar,
      updateMany: mocks.actualizar,
      fields: { horarioReservado: mocks.campoHorario },
    },
  },
}));
vi.mock("./enviar-aviso-push-turno", () => ({ enviarAvisoPushTurno: mocks.enviar }));
vi.mock("@/lib/notificaciones/configuracion-push", () => ({ obtenerConfiguracionPush: mocks.configuracion }));

const ahora = new Date("2027-01-01T01:00:00Z");
const claveVapid = "clave-publica-vigente";
const turno = {
  id: "turno",
  userId: "cliente",
  barberoId: "barbero",
  horarioReservado: new Date("2027-01-01T14:30:00Z"),
  recordatorioPushPara: null,
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.buscar.mockResolvedValue([turno]);
  mocks.actualizar.mockResolvedValue({ count: 1 });
  mocks.enviar.mockResolvedValue({ enviados: 1, reintentar: false });
});

afterEach(() => vi.unstubAllEnvs());

describe("recordatorios de turnos", () => {
  it("busca turnos confirmados del día siguiente en Buenos Aires y avisa al cliente", async () => {
    await expect(recordarTurnos(ahora, claveVapid)).resolves.toEqual({ enviados: 1, reintentables: 0, errores: 0 });
    expect(mocks.buscar).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        estado: "CONFIRMADO",
        horarioReservado: {
          gte: new Date("2027-01-01T03:00:00Z"),
          lt: new Date("2027-01-02T03:00:00Z"),
        },
        user: { suscripcionesPush: { some: { claveVapid } } },
        OR: [{ recordatorioPushPara: null }, { NOT: { recordatorioPushPara: { equals: mocks.campoHorario } } }],
      },
    }));
    expect(mocks.actualizar).toHaveBeenCalledWith({
      where: {
        id: turno.id,
        userId: turno.userId,
        estado: "CONFIRMADO",
        horarioReservado: turno.horarioReservado,
        recordatorioPushPara: null,
      },
      data: { recordatorioPushPara: turno.horarioReservado },
    });
    expect(mocks.enviar).toHaveBeenCalledWith(turno, "RECORDATORIO");
  });

  it("envía una sola vez cuando dos ejecuciones seleccionan el mismo turno", async () => {
    mocks.actualizar.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    const resultados = await Promise.all([recordarTurnos(ahora, claveVapid), recordarTurnos(ahora, claveVapid)]);
    expect(resultados.map(({ enviados }) => enviados)).toEqual([1, 0]);
    expect(mocks.enviar).toHaveBeenCalledTimes(1);
  });

  it("restaura la marca anterior si falla el envío al turno reprogramado", async () => {
    const marcaAnterior = new Date("2026-12-31T14:30:00Z");
    mocks.buscar.mockResolvedValue([{ ...turno, recordatorioPushPara: marcaAnterior }]);
    mocks.enviar.mockResolvedValue({ enviados: 0, reintentar: true });

    await expect(recordarTurnos(ahora, claveVapid)).resolves.toEqual({ enviados: 0, reintentables: 1, errores: 0 });
    expect(mocks.actualizar).toHaveBeenNthCalledWith(2, {
      where: { id: turno.id, userId: turno.userId, recordatorioPushPara: turno.horarioReservado },
      data: { recordatorioPushPara: marcaAnterior },
    });
  });
});

describe("cron de recordatorios", () => {
  it("rechaza una autorización incorrecta antes de consultar destinatarios", async () => {
    vi.stubEnv("CRON_SECRET", "secreto-de-prueba");
    const solicitud = new Request("http://localhost/api/cron/recordar-turnos", {
      headers: { authorization: "Bearer secreto-incorrecto" },
    });

    expect((await GET(solicitud)).status).toBe(401);
    expect(mocks.buscar).not.toHaveBeenCalled();
  });

  it("omite el cron si Web Push está deshabilitado", async () => {
    vi.stubEnv("CRON_SECRET", "secreto-de-prueba");
    mocks.configuracion.mockReturnValue(null);
    const solicitud = new Request("http://localhost/api/cron/recordar-turnos", {
      headers: { authorization: "Bearer secreto-de-prueba" },
    });

    const respuesta = await GET(solicitud);
    expect(respuesta.status).toBe(200);
    await expect(respuesta.json()).resolves.toEqual({ ok: true, habilitado: false });
    expect(mocks.buscar).not.toHaveBeenCalled();
  });

  it("informa fallos recuperables sin publicar datos de los turnos", async () => {
    vi.stubEnv("CRON_SECRET", "secreto-de-prueba");
    mocks.configuracion.mockReturnValue({ publicKey: claveVapid });
    mocks.enviar.mockResolvedValue({ enviados: 0, reintentar: true });
    const solicitud = new Request("http://localhost/api/cron/recordar-turnos", {
      headers: { authorization: "Bearer secreto-de-prueba" },
    });

    const respuesta = await GET(solicitud);
    expect(respuesta.status).toBe(503);
    await expect(respuesta.json()).resolves.toEqual({ ok: false, enviados: 0, reintentables: 1, errores: 0 });
  });
});
