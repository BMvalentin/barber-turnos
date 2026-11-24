import { beforeEach, describe, expect, it, vi } from "vitest";
import { listarUsuarios } from "./listar.actions";

const mocks = vi.hoisted(() => ({
  autorizar: vi.fn(),
  groupBy: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
}));

vi.mock("@/lib/seguridad/requerir-admin", () => ({ requerirAdmin: mocks.autorizar }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { groupBy: mocks.groupBy, findMany: mocks.findMany, count: mocks.count } },
}));

describe("listarUsuarios", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.autorizar.mockResolvedValue({ user: { id: "admin" } });
    mocks.groupBy.mockResolvedValue([
      { role: "USER", _count: { _all: 21 } },
      { role: "ADMIN", _count: { _all: 2 } },
      { role: "EMPLEADO", _count: { _all: 5 } },
    ]);
    mocks.findMany.mockResolvedValue([]);
    mocks.count.mockResolvedValue(3);
  });

  it("reutiliza los contadores del rol para calcular el total cuando no hay búsqueda", async () => {
    const resultado = await listarUsuarios({ lista: "empleados" });

    expect(resultado.data).toMatchObject({
      totalResultados: 5,
      contadores: { todos: 28, usuarios: 21, empleados: 5, administradores: 2 },
    });
    expect(mocks.count).not.toHaveBeenCalled();
    expect(mocks.findMany).toHaveBeenCalledTimes(1);
    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { esInvitado: false, role: "EMPLEADO" },
      skip: 0,
      take: 20,
    }));
  });

  it("mantiene el conteo filtrado cuando hay una búsqueda", async () => {
    const resultado = await listarUsuarios({ busqueda: "ana" });

    expect(resultado.data).toMatchObject({ totalResultados: 3, contadores: { todos: 28 } });
    expect(mocks.count).toHaveBeenCalledTimes(1);
    expect(mocks.count).toHaveBeenCalledWith({
      where: { esInvitado: false, OR: [
        { email: { contains: "ana" } },
        { name: { contains: "ana" } },
        { telefono: { contains: "ana" } },
      ] },
    });
  });

  it("ajusta una página fuera de rango sin consultar una página vacía", async () => {
    mocks.count.mockResolvedValue(21);

    const resultado = await listarUsuarios({ pagina: 10 }, false);

    expect(resultado.data).toMatchObject({ pagina: 2, totalPaginas: 2, contadores: null });
    expect(mocks.groupBy).not.toHaveBeenCalled();
    expect(mocks.findMany).toHaveBeenCalledTimes(1);
    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 20, take: 20 }));
  });
});
