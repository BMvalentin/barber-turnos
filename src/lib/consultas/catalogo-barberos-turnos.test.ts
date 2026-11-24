import { beforeEach, describe, expect, it, vi } from "vitest";
import { nombreVisibleBarbero } from "@/lib/barberos/nombre-profesional";
import { obtenerBarberosFiltroTurnos } from "./obtener-barberos-filtro-turnos";
import { obtenerDatosReserva } from "./obtener-datos-reserva";
import { obtenerBarberosParaHorarios } from "./obtener-barberos-para-horarios";
import { obtenerBarberosParaSelector } from "./obtener-barberos-para-selector";

const mocks = vi.hoisted(() => ({
  barbero: vi.fn(),
  servicio: vi.fn(),
  asignacion: vi.fn(),
}));

vi.mock("next/cache", () => ({ unstable_cache: (consulta: unknown) => consulta }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    barbero: { findMany: mocks.barbero },
    servicio: { findMany: mocks.servicio },
    servicioxbarbero: { findMany: mocks.asignacion },
  },
}));

const rolesEquipo = { usuario: { role: { in: ["ADMIN", "EMPLEADO"] } } };
const actividadVacia = { servicios: 0, horarios: 0 };

describe("catálogos de barberos", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.barbero.mockResolvedValue([]);
    mocks.servicio.mockResolvedValue([]);
    mocks.asignacion.mockResolvedValue([]);
  });

  it("reserva solo con barberos activos, vinculados y con servicios activos asignados", async () => {
    await obtenerDatosReserva();

    expect(mocks.barbero).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        estado: true,
        usuarioId: { not: null },
        servicios: { some: { servicio: { estado: true } } },
      },
    }));
    expect(mocks.asignacion).toHaveBeenCalledWith(expect.objectContaining({
      where: { barbero: { estado: true, usuarioId: { not: null } }, servicio: { estado: true } },
    }));
  });

  it("el desplegable de turnos solo ofrece empleados activos con servicios activos", async () => {
    await obtenerBarberosFiltroTurnos();

    expect(mocks.barbero).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        estado: true,
        usuarioId: { not: null },
        servicios: { some: { servicio: { estado: true } } },
        usuario: { role: "EMPLEADO" },
      },
    }));
  });

  it("usa el mismo equipo para editar y copiar horarios, incluso antes de asignar el primero", async () => {
    const personal = [
      { id: "empleado-1", nombre: "Alex", srcImage: null, horarios: [] },
      { id: "empleado-2", nombre: "Alex", srcImage: null, horarios: [] },
      { id: "empleado-con-servicio", nombre: "Sin nombre", srcImage: null, horarios: [] },
    ];
    mocks.barbero.mockResolvedValueOnce([
      ...personal.slice(0, 2).map((perfil) => ({ ...perfil, _count: actividadVacia })),
      { ...personal[2], _count: { servicios: 1, horarios: 0 } },
      { id: "provisional", nombre: "  SIN NOMBRE  ", srcImage: null, horarios: [], _count: actividadVacia },
    ]);

    expect(await obtenerBarberosParaHorarios()).toEqual(personal);
    expect(mocks.barbero).toHaveBeenCalledWith(expect.objectContaining({ where: rolesEquipo }));
  });

  it("permite a un empleado acceder a sus propios horarios aunque su perfil esté pendiente", async () => {
    const propio = { id: "mi-perfil", nombre: "Sin nombre", srcImage: null, horarios: [] };
    mocks.barbero.mockResolvedValueOnce([{ ...propio, _count: actividadVacia }]);

    expect(await obtenerBarberosParaHorarios(propio.id)).toEqual([propio]);
    expect(mocks.barbero).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "mi-perfil" } }));
  });

  it("ofrece cierres individuales para miembros activos del equipo con perfil profesional", async () => {
    const conNombre = { id: "empleado", nombre: "Alex" };
    const conHorario = { id: "empleado-con-horario", nombre: "Sin nombre" };
    mocks.barbero.mockResolvedValueOnce([
      { ...conNombre, _count: actividadVacia },
      { ...conHorario, _count: { servicios: 0, horarios: 1 } },
      { id: "provisional", nombre: "  ", _count: actividadVacia },
    ]);

    expect(await obtenerBarberosParaSelector()).toEqual([conNombre, conHorario]);
    expect(mocks.barbero).toHaveBeenCalledWith(expect.objectContaining({
      where: { ...rolesEquipo, estado: true },
    }));
  });

  it("formatea el nombre profesional y da una etiqueta a un perfil sin nombre con actividad", () => {
    expect(nombreVisibleBarbero("  Alex  ")).toBe("Alex");
    expect(nombreVisibleBarbero(" SIN NOMBRE ")).toBe("Perfil sin nombre");
  });
});
