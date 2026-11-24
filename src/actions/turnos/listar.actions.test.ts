import { beforeEach, describe, expect, it, vi } from "vitest";
import { obtenerTurnosDelMes } from "@/actions/turnos/listar.actions";

const { findMany, requerirPanel } = vi.hoisted(() => ({
  findMany: vi.fn(),
  requerirPanel: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { turno: { findMany } } }));
vi.mock("@/lib/seguridad/requerir-admin", () => ({ requerirPanel }));
vi.mock("@/lib/seguridad/requerir-sesion", () => ({ requerirSesion: vi.fn() }));

describe("obtenerTurnosDelMes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    findMany.mockResolvedValue([]);
  });

  it("limita el listado del administrador al mes civil de la barbería, sin truncarlo", async () => {
    requerirPanel.mockResolvedValue({ rol: "ADMIN", barberoId: "administrador" });

    await expect(obtenerTurnosDelMes("2028-02")).resolves.toEqual({ success: true, data: [] });
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        horarioReservado: {
          gte: new Date("2028-02-01T03:00:00Z"),
          lt: new Date("2028-03-01T03:00:00Z"),
        },
      },
      select: expect.any(Object),
      orderBy: [{ horarioReservado: "desc" }, { id: "desc" }],
    });
  });

  it("restringe al empleado a su propia agenda y admite el cambio de año", async () => {
    requerirPanel.mockResolvedValue({ rol: "EMPLEADO", barberoId: "empleado" });

    await obtenerTurnosDelMes("2026-12");
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        barberoId: "empleado",
        horarioReservado: {
          gte: new Date("2026-12-01T03:00:00Z"),
          lt: new Date("2027-01-01T03:00:00Z"),
        },
      },
    }));
  });

  it.each([null, { rol: "EMPLEADO", barberoId: null }])("rechaza el acceso sin un alcance autorizado", async (contexto) => {
    requerirPanel.mockResolvedValue(contexto);

    await expect(obtenerTurnosDelMes("2026-12")).resolves.toEqual({ success: false, error: "No autorizado" });
    expect(findMany).not.toHaveBeenCalled();
  });

  it.each(["2026-13", "2026-2", "2026-02\n"])("rechaza el mes inválido %j antes de consultar la base", async (mes) => {
    await expect(obtenerTurnosDelMes(mes)).resolves.toEqual({ success: false, error: "Mes inválido" });
    expect(requerirPanel).not.toHaveBeenCalled();
    expect(findMany).not.toHaveBeenCalled();
  });

  it("informa un error de lectura que permite reintentar", async () => {
    requerirPanel.mockResolvedValue({ rol: "ADMIN", barberoId: "administrador" });
    findMany.mockRejectedValueOnce(new Error("Falla simulada"));

    await expect(obtenerTurnosDelMes("2026-12")).resolves.toEqual({ success: false, error: "Error al obtener los turnos" });
    await expect(obtenerTurnosDelMes("2026-12")).resolves.toEqual({ success: true, data: [] });
  });
});
