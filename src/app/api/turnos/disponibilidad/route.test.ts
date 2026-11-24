import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mocks = vi.hoisted(() => ({ sesion: vi.fn(), admin: vi.fn(), agenda: vi.fn(), agendaActual: vi.fn() }));
vi.mock("@/lib/seguridad/requerir-sesion", () => ({ requerirSesion: mocks.sesion }));
vi.mock("@/lib/seguridad/requerir-admin", () => ({ requerirAdmin: mocks.admin }));
vi.mock("@/lib/disponibilidad-mensual-cacheada", () => ({
  calcularCapacidadMensual: mocks.agendaActual,
  obtenerCapacidadMensualCacheada: mocks.agenda,
}));

function consulta(parametros: string) {
  return GET(new Request(`http://localhost/api/turnos/disponibilidad?${parametros}`));
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.sesion.mockResolvedValue({ user: { id: "cliente" } });
  mocks.agenda.mockResolvedValue({});
  mocks.agendaActual.mockResolvedValue({});
});

describe("API de disponibilidad de turnos", () => {
  it("valida el mes y requiere una sesión", async () => {
    expect((await consulta("mes=2026-13&barberoId=uno")).status).toBe(400);
    mocks.sesion.mockResolvedValueOnce(null);
    expect((await consulta("mes=2026-11&barberoId=uno")).status).toBe(403);
    expect(mocks.agenda).not.toHaveBeenCalled();
  });

  it("devuelve las agendas exitosas si falla uno de los barberos", async () => {
    mocks.agenda.mockRejectedValueOnce(new Error("sin conexión"));
    const respuesta = await consulta("mes=2026-11&barberoId=uno&barberoId=dos");
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers.get("Cache-Control")).toBe("private, no-store");
    await expect(respuesta.json()).resolves.toEqual([{ barberoId: "dos", capacidad: {} }]);
  });

  it("refresca la agenda directamente y solo permite excluir un turno a un administrador", async () => {
    const parametros = "mes=2026-11&barberoId=uno&actualizar=1";
    expect((await consulta(`${parametros}&turnoIdAExcluir=turno`)).status).toBe(403);
    expect(mocks.agendaActual).not.toHaveBeenCalled();

    mocks.admin.mockResolvedValueOnce({ user: { id: "administrador" } });
    expect((await consulta(`${parametros}&turnoIdAExcluir=turno`)).status).toBe(200);
    expect(mocks.agendaActual).toHaveBeenCalledWith("2026-11", "uno", "turno");
    expect(mocks.agenda).not.toHaveBeenCalled();
  });
});
