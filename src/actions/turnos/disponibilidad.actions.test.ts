import { beforeEach, describe, expect, it, vi } from "vitest";
import { obtenerCapacidadMensual } from "./disponibilidad.actions";

const mocks = vi.hoisted(() => ({ capacidad: vi.fn(), admin: vi.fn() }));

vi.mock("@/lib/disponibilidad-mensual-cacheada", () => ({
  obtenerCapacidadMensualCacheada: mocks.capacidad,
}));
vi.mock("@/lib/seguridad/requerir-admin", () => ({ requerirAdmin: mocks.admin }));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.capacidad.mockResolvedValue({});
});

describe("consulta mensual de horarios", () => {
  it("consulta una agenda sin pedir el servicio", async () => {
    await expect(obtenerCapacidadMensual("2026-11", "barbero")).resolves.toEqual({ success: true, data: {} });
    expect(mocks.capacidad).toHaveBeenCalledWith("2026-11", "barbero", undefined);
    expect(mocks.admin).not.toHaveBeenCalled();
  });

  it("valida el mes y restringe la exclusión de una reserva a administradores", async () => {
    await expect(obtenerCapacidadMensual("2026-13", "barbero")).resolves.toMatchObject({ success: false });
    await expect(obtenerCapacidadMensual("2026-11", "barbero", "turno")).resolves.toEqual({
      success: false, error: "No autorizado",
    });
    expect(mocks.capacidad).not.toHaveBeenCalled();

    mocks.admin.mockResolvedValue({ user: { id: "administrador" } });
    await expect(obtenerCapacidadMensual("2026-11", "barbero", "turno")).resolves.toMatchObject({ success: true });
    expect(mocks.capacidad).toHaveBeenCalledWith("2026-11", "barbero", "turno");
  });

  it("devuelve un error recuperable si falla la consulta", async () => {
    mocks.capacidad.mockRejectedValueOnce(new Error("sin conexión"));
    await expect(obtenerCapacidadMensual("2026-11", "barbero")).resolves.toEqual({
      success: false, error: "Error al calcular disponibilidad",
    });
    await expect(obtenerCapacidadMensual("2026-11", "barbero")).resolves.toMatchObject({ success: true });
  });
});
