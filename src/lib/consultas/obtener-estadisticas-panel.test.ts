import { beforeEach, describe, expect, it, vi } from "vitest";
import { obtenerEstadisticasPanel } from "@/lib/consultas/obtener-estadisticas-panel";
import { leerPeriodoVentas, obtenerPeriodoVentas } from "@/lib/consultas/periodo-ventas-panel";

const { prisma } = vi.hoisted(() => ({
  prisma: {
    barbero: { findUnique: vi.fn(), findMany: vi.fn() },
    turno: { groupBy: vi.fn(), findMany: vi.fn(), count: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/cache", () => ({
  getCachedData: (_clave: string[], _tags: string[], consultar: () => unknown) => consultar(),
}));
vi.mock("@/lib/consultas/obtener-servicios-populares", () => ({
  obtenerServiciosPopulares: vi.fn().mockResolvedValue([]),
}));

const ahora = new Date("2026-11-02T01:10:00Z");
const perfil = {
  id: "propio", estado: true, servicios: [{ servicioId: "servicio" }], porcentajeGanancia: "50",
};

const grupo = {
  barberoId: "propio", estado: "COMPLETADO", estadoPago: "PAGADO", tipoPago: null,
  precioCongelado: "100.25", seniaCongelada: "20.25", _count: { _all: 2 },
};

beforeEach(() => {
  vi.clearAllMocks();
  prisma.barbero.findUnique.mockResolvedValue(perfil);
  prisma.barbero.findMany.mockResolvedValue([{ id: "equipo", nombre: "Equipo" }]);
  prisma.turno.findMany.mockResolvedValue([]);
  prisma.turno.count.mockResolvedValue(0);
  prisma.turno.groupBy.mockResolvedValue([]);
});

describe("inicio del panel", () => {
  it("acota la agenda y separa las ventas propias de las del equipo para un admin que corta", async () => {
    prisma.turno.groupBy.mockResolvedValue([
      grupo,
      { ...grupo, estadoPago: "APROBADO", tipoPago: "SEÑA", _count: { _all: 1 } },
      { ...grupo, estadoPago: "PENDIENTE", _count: { _all: 1 } },
      { ...grupo, estado: "CONFIRMADO", estadoPago: "SEÑADO", seniaCongelada: "110", _count: { _all: 1 } },
      { ...grupo, barberoId: "equipo", estado: "CONFIRMADO", estadoPago: "APROBADO", tipoPago: "TOTAL", _count: { _all: 1 } },
    ]);

    const stats = await obtenerEstadisticasPanel({ rol: "ADMIN", barberoId: "propio" }, "hoy", ahora);

    expect(stats?.propio).toEqual({
      ventas: { cobrado: 32100, senas: 12050, saldo: 18025, completados: 4, importeCompletado: 40100 },
      ganancia: 20050,
    });
    expect(stats?.equipo?.ventas.cobrado).toBe(10025);
    expect(stats?.equipo?.empleados).toEqual([{ id: "equipo", nombre: "Equipo", cobrado: 10025, completados: 0 }]);
    expect(prisma.turno.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ barberoId: "propio" }), take: 4,
    }));
    expect(prisma.turno.groupBy).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ OR: expect.arrayContaining([
        expect.objectContaining({ estado: { not: "CANCELADO" } }),
      ]) }),
    }));
  });

  it("muestra el total del negocio cuando el administrador no ofrece servicios", async () => {
    prisma.barbero.findUnique.mockResolvedValue({ ...perfil, servicios: [] });
    prisma.turno.groupBy.mockResolvedValue([grupo]);

    const stats = await obtenerEstadisticasPanel({ rol: "ADMIN", barberoId: "propio" }, "hoy", ahora);

    expect(stats?.propio).toBeNull();
    expect(stats?.equipo?.ventas.cobrado).toBe(20050);
  });

  it("limita la consulta del empleado a su perfil incluso si está inactivo", async () => {
    prisma.barbero.findUnique.mockResolvedValue({ ...perfil, estado: false });
    prisma.turno.groupBy.mockResolvedValue([grupo]);

    const stats = await obtenerEstadisticasPanel({ rol: "EMPLEADO", barberoId: "propio" }, "semana", ahora);

    expect(stats?.propio?.ventas.cobrado).toBe(20050);
    expect(stats?.equipo).toBeNull();
    expect(prisma.barbero.findMany).not.toHaveBeenCalled();
    expect(prisma.turno.groupBy).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ barberoId: "propio" }),
    }));
  });

  it("no ejecuta consultas globales si el empleado carece de perfil", async () => {
    prisma.barbero.findUnique.mockResolvedValue(null);
    expect(await obtenerEstadisticasPanel({ rol: "EMPLEADO", barberoId: "propio" }, "hoy", ahora)).toBeNull();
    expect(prisma.turno.groupBy).not.toHaveBeenCalled();
    expect(prisma.turno.findMany).not.toHaveBeenCalled();
  });
});

describe("período de ventas", () => {
  it("usa el calendario de la barbería al cruzar la medianoche UTC y el cambio de mes", () => {
    expect(obtenerPeriodoVentas("mes", ahora)).toEqual({
      hoy: "2026-11-01",
      inicio: new Date("2026-11-01T03:00:00Z"),
      inicioHoy: new Date("2026-11-01T03:00:00Z"),
      finExclusivo: new Date("2026-11-02T03:00:00Z"),
    });
    expect(obtenerPeriodoVentas("semana", ahora).inicio).toEqual(new Date("2026-10-26T03:00:00Z"));
    expect(leerPeriodoVentas(["mes", "semana"])).toBe("hoy");
    expect(leerPeriodoVentas("ayer")).toBe("hoy");
  });
});
