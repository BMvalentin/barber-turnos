import { beforeEach, describe, expect, it, vi } from "vitest";
import { obtenerDatosModalTurno } from "./obtener-datos-modal-turno.actions";

const mocks = vi.hoisted(() => ({
  sesion: vi.fn(),
  panel: vi.fn(),
  catalogo: vi.fn(),
  clientes: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { user: { findMany: mocks.clientes } } }));
vi.mock("@/lib/seguridad/requerir-sesion", () => ({ requerirSesion: mocks.sesion }));
vi.mock("@/lib/seguridad/requerir-admin", () => ({ requerirPanel: mocks.panel }));
vi.mock("@/lib/consultas/obtener-datos-reserva", () => ({ obtenerDatosReserva: mocks.catalogo }));

const catalogo = {
  barberos: [{ id: "uno" }, { id: "dos" }],
  servicios: [{ id: "corte" }, { id: "barba" }],
  relaciones: [
    { barberoId: "uno", servicioId: "corte" },
    { barberoId: "dos", servicioId: "barba" },
  ],
};
const invitado = { id: "cliente", esInvitado: true, email: "interno@test.invalid", emailContacto: "contacto@test.invalid" };

beforeEach(() => {
  vi.resetAllMocks();
  mocks.catalogo.mockResolvedValue(catalogo);
  mocks.clientes.mockResolvedValue([invitado]);
});

describe("datos del modal de turnos", () => {
  it("rechaza la carga antes de consultar datos si falta autorización", async () => {
    await expect(obtenerDatosModalTurno(false)).resolves.toMatchObject({ success: false });
    await expect(obtenerDatosModalTurno(true)).resolves.toMatchObject({ success: false });
    expect(mocks.catalogo).not.toHaveBeenCalled();
    expect(mocks.clientes).not.toHaveBeenCalled();
  });

  it("carga solo el catálogo público para una reserva personal", async () => {
    mocks.sesion.mockResolvedValue({ user: { id: "cuenta" } });
    await expect(obtenerDatosModalTurno(false)).resolves.toEqual({
      success: true,
      data: { ...catalogo, usuarios: [] },
    });
    expect(mocks.catalogo).toHaveBeenCalledWith({ soloPerfilesCompletos: true });
    expect(mocks.clientes).not.toHaveBeenCalled();
  });

  it("permite que un administrador elija a cualquier barbero y conserva el contacto del invitado", async () => {
    mocks.panel.mockResolvedValue({ rol: "ADMIN" });
    await expect(obtenerDatosModalTurno(true)).resolves.toEqual({
      success: true,
      data: { ...catalogo, usuarios: [{ ...invitado, email: null }] },
    });
  });

  it("limita el catálogo del empleado a su propia agenda", async () => {
    mocks.panel.mockResolvedValue({ rol: "EMPLEADO", barberoId: "dos" });
    await expect(obtenerDatosModalTurno(true)).resolves.toMatchObject({
      success: true,
      data: {
        barberos: [{ id: "dos" }],
        servicios: [{ id: "barba" }],
        relaciones: [{ barberoId: "dos", servicioId: "barba" }],
      },
    });
  });
});
