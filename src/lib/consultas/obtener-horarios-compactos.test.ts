import { describe, expect, it, vi } from "vitest";
import { obtenerHorariosCompactos } from "./obtener-horarios-compactos";

const consultarDias = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ prisma: { dia_laboral: { findMany: consultarDias } } }));
vi.mock("next/cache", () => ({ unstable_cache: (consulta: unknown) => consulta }));

describe("horarios de portada", () => {
  it("fusiona las franjas y agrupa los días consecutivos con el mismo horario", async () => {
    consultarDias.mockResolvedValue([
      { dia: "Jueves", margenes: [] },
      { dia: "Martes", margenes: [{ desde: "09:00", hasta: "13:00" }] },
      { dia: "Lunes", margenes: [{ desde: "09:00", hasta: "11:00" }, { desde: "10:00", hasta: "13:00" }] },
      { dia: "Miercoles", margenes: [{ desde: "09:00", hasta: "13:00" }, { desde: "16:00", hasta: "20:00" }] },
    ]);

    await expect(obtenerHorariosCompactos()).resolves.toEqual([
      { dias: "Lunes a Martes", rangos: [{ desde: "09:00", hasta: "13:00" }] },
      { dias: "Miércoles", rangos: [{ desde: "09:00", hasta: "13:00" }, { desde: "16:00", hasta: "20:00" }] },
      { dias: "Jueves", rangos: [] },
    ]);
    expect(consultarDias).toHaveBeenLastCalledWith({
      where: { estado: true },
      select: {
        dia: true,
        margenes: {
          where: { estado: true },
          orderBy: { desde: "asc" },
          select: { desde: true, hasta: true },
        },
      },
    });
  });

  it("distingue un local cerrado de un error que debe volver a consultarse", async () => {
    consultarDias.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error("sin conexión"));

    await expect(obtenerHorariosCompactos()).resolves.toEqual([]);
    await expect(obtenerHorariosCompactos()).rejects.toThrow("sin conexión");
  });
});
