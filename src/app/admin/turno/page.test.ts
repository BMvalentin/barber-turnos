import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminTurnoPage from "./page";

const mocks = vi.hoisted(() => ({
  requerirPanel: vi.fn(),
  obtenerDatosReserva: vi.fn(),
  obtenerBarberosFiltroTurnos: vi.fn(),
}));

vi.mock("@/components/turno/gestion/TurnoManager", () => ({ default: vi.fn() }));
vi.mock("@/lib/seguridad/requerir-admin", () => ({ requerirPanel: mocks.requerirPanel }));
vi.mock("@/lib/consultas/obtener-datos-reserva", () => ({ obtenerDatosReserva: mocks.obtenerDatosReserva }));
vi.mock("@/lib/consultas/obtener-barberos-filtro-turnos", () => ({ obtenerBarberosFiltroTurnos: mocks.obtenerBarberosFiltroTurnos }));
vi.mock("@/lib/obtener-config-cacheada", () => ({ obtenerConfigCacheada: vi.fn().mockResolvedValue(null) }));

const empleado = { id: "empleado", nombre: "Profesional del equipo", estado: true };
const administrador = { id: "perfil-admin", nombre: "Profesional administrador", estado: true };

describe("agenda administrativa", () => {
  beforeEach(() => {
    vi.stubGlobal("React", React);
    mocks.requerirPanel.mockResolvedValue({
      rol: "ADMIN",
      barberoId: administrador.id,
      session: { user: { id: "cuenta-admin" } },
    });
    mocks.obtenerDatosReserva.mockResolvedValue({ barberos: [empleado, administrador], relaciones: [], servicios: [] });
    mocks.obtenerBarberosFiltroTurnos.mockResolvedValue([empleado]);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("usa el filtro del equipo para la agenda general y el catálogo de reservas para el modal", async () => {
    const pagina = await AdminTurnoPage({ searchParams: Promise.resolve({}) });

    expect(pagina.props).toMatchObject({
      barberosFiltro: [empleado],
      barberoIdInicial: "",
      initialBarberos: [empleado, administrador],
    });
  });

  it("selecciona el propio perfil de barbero cuando el administrador abre su agenda personal", async () => {
    const pagina = await AdminTurnoPage({ searchParams: Promise.resolve({ agenda: "personal" }) });

    expect(pagina.props).toMatchObject({
      barberosFiltro: [administrador, empleado],
      barberoIdInicial: administrador.id,
    });
  });
});
