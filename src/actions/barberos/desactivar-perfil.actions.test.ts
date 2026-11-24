import { beforeEach, describe, expect, it, vi } from "vitest";
import { desactivarPerfilProfesional } from "./desactivar-perfil.actions";

const mocks = vi.hoisted(() => ({
  requerirPanel: vi.fn(),
  updateMany: vi.fn(),
  revalidarBarberos: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { barbero: { updateMany: mocks.updateMany } } }));
vi.mock("@/lib/revalidar/revalidar-barberos", () => ({ revalidarBarberos: mocks.revalidarBarberos }));
vi.mock("@/lib/seguridad/requerir-admin", () => ({ requerirPanel: mocks.requerirPanel }));

describe("desactivar el perfil profesional propio", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requerirPanel.mockResolvedValue({ barberoId: "perfil", session: { user: { id: "cuenta" } } });
    mocks.updateMany.mockResolvedValue({ count: 1 });
  });

  it("rechaza una sesión sin acceso al panel", async () => {
    mocks.requerirPanel.mockResolvedValue(null);

    expect(await desactivarPerfilProfesional()).toMatchObject({ success: false });
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it("cambia solo el estado del perfil vinculado y puede reintentarse", async () => {
    expect(await desactivarPerfilProfesional()).toEqual({ success: true });
    expect(await desactivarPerfilProfesional()).toEqual({ success: true });
    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: { id: "perfil", usuarioId: "cuenta" },
      data: { estado: false },
    });
    expect(mocks.revalidarBarberos).toHaveBeenCalledTimes(2);
  });

  it("informa si el perfil ya no está vinculado a la cuenta", async () => {
    mocks.updateMany.mockResolvedValue({ count: 0 });

    expect(await desactivarPerfilProfesional()).toEqual({ success: false, error: "No encontramos tu perfil profesional." });
    expect(mocks.revalidarBarberos).not.toHaveBeenCalled();
  });

  it("informa un fallo de persistencia sin exponer el error interno", async () => {
    mocks.updateMany.mockRejectedValue(new Error("Error interno"));

    expect(await desactivarPerfilProfesional()).toEqual({
      success: false,
      error: "No pudimos desactivar tu perfil. Volvé a intentarlo.",
    });
    expect(mocks.revalidarBarberos).not.toHaveBeenCalled();
  });
});
