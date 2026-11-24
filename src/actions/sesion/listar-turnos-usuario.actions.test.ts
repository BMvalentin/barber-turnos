import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Prisma } from "../../../generated/prisma/client";
import { getResumenTurnosUsuario, getUserTurnos } from "./listar-turnos-usuario.actions";

const mocks = vi.hoisted(() => ({
  autorizar: vi.fn(),
  findMany: vi.fn<(consulta: Prisma.turnoFindManyArgs) => Promise<unknown[]>>(),
  count: vi.fn(),
}));

vi.mock("@/lib/seguridad/requerir-propietario", () => ({
  requerirPropietarioOAdmin: mocks.autorizar,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { turno: { findMany: mocks.findMany, count: mocks.count } },
}));

describe("consultas de turnos del usuario", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.autorizar.mockResolvedValue({ user: { id: "usuario" } });
    mocks.findMany.mockResolvedValue([]);
    mocks.count.mockResolvedValue(12);
  });

  it("usa la misma autorización y el mismo corte para los próximos turnos y el historial", async () => {
    const resultado = await getResumenTurnosUsuario("usuario");

    expect(resultado).toEqual({
      success: true,
      data: { historial: { turnos: [], paginaActual: 1, totalPaginas: 3 }, proximos: [] },
    });
    expect(mocks.autorizar).toHaveBeenCalledTimes(1);
    expect(mocks.autorizar).toHaveBeenCalledWith("usuario");
    expect(mocks.findMany).toHaveBeenCalledTimes(2);
    const filtroHistorial = mocks.findMany.mock.calls[0][0].where;
    const filtroProximos = mocks.findMany.mock.calls[1][0].where;
    expect(filtroProximos).toMatchObject({ userId: "usuario", horarioReservado: { gte: expect.any(Date) } });
    expect(filtroHistorial?.NOT).toEqual(filtroProximos);
  });

  it("mantiene la paginación independiente del historial", async () => {
    const resultado = await getUserTurnos("usuario", 2);

    expect(resultado.data).toEqual({ turnos: [], paginaActual: 2, totalPaginas: 3 });
    expect(mocks.findMany).toHaveBeenCalledTimes(1);
    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 5, take: 5 }));
  });

  it("rechaza consultas inválidas o sin autorización antes de leer turnos", async () => {
    mocks.autorizar.mockResolvedValue(null);

    expect(await getResumenTurnosUsuario("")).toEqual({ success: false, error: "Usuario inválido" });
    expect(await getResumenTurnosUsuario("otra-cuenta")).toEqual({ success: false, error: "No autorizado" });
    expect(mocks.findMany).not.toHaveBeenCalled();
    expect(mocks.count).not.toHaveBeenCalled();
  });

  it("devuelve un error controlado si falla una lectura", async () => {
    mocks.findMany.mockRejectedValueOnce(new Error("falló la lectura"));

    expect(await getResumenTurnosUsuario("usuario")).toEqual({
      success: false,
      error: "No se pudieron cargar los turnos",
    });
  });
});
