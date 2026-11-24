import { beforeEach, describe, expect, it, vi } from "vitest";
import { actualizarRolUsuario } from "./rol.actions";

const mocks = vi.hoisted(() => ({
  requerirAdmin: vi.fn(),
  invalidarCacheRol: vi.fn(),
  revalidarBarberos: vi.fn(),
  transaccion: vi.fn(),
  usuario: { findUnique: vi.fn(), update: vi.fn() },
  barbero: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), upsert: vi.fn() },
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: mocks.usuario, $transaction: mocks.transaccion } }));
vi.mock("@/lib/seguridad/requerir-admin", () => ({
  requerirAdmin: mocks.requerirAdmin,
  invalidarCacheRol: mocks.invalidarCacheRol,
}));
vi.mock("@/lib/revalidar/revalidar-barberos", () => ({ revalidarBarberos: mocks.revalidarBarberos }));

const cuenta = { id: "empleado", email: "empleado@example.com", name: "  Juan Pérez  " };

describe("actualizarRolUsuario", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requerirAdmin.mockResolvedValue({ user: { id: "admin" } });
    mocks.usuario.findUnique.mockResolvedValue({ id: cuenta.id, role: "USER" });
    mocks.usuario.update.mockResolvedValue(cuenta);
    mocks.barbero.findUnique.mockResolvedValue(null);
    mocks.barbero.findFirst.mockResolvedValue(null);
    mocks.transaccion.mockImplementation((operacion) => operacion({ user: mocks.usuario, barbero: mocks.barbero }));
  });

  it("mantiene el perfil profesional vinculado aunque el nombre de la cuenta haya cambiado", async () => {
    mocks.barbero.findUnique.mockResolvedValue({ id: "perfil-profesional", email: cuenta.email });

    expect(await actualizarRolUsuario(cuenta.id, "EMPLEADO")).toEqual({ success: true });
    expect(mocks.barbero.findUnique).toHaveBeenCalledWith({ where: { usuarioId: cuenta.id }, select: { id: true, email: true } });
    expect(mocks.barbero.findFirst).not.toHaveBeenCalled();
    expect(mocks.barbero.update).not.toHaveBeenCalled();
    expect(mocks.barbero.upsert).not.toHaveBeenCalled();
  });

  it("actualiza el correo desfasado sin reemplazar el perfil profesional", async () => {
    mocks.barbero.findUnique.mockResolvedValue({ id: "perfil-vinculado", email: null });

    expect(await actualizarRolUsuario(cuenta.id, "EMPLEADO")).toEqual({ success: true });
    expect(mocks.barbero.update).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: "perfil-vinculado" }),
      data: { usuarioId: cuenta.id, email: cuenta.email },
    }));
    expect(mocks.barbero.upsert).not.toHaveBeenCalled();
  });

  it("recupera el perfil anterior por correo antes de crear otro", async () => {
    mocks.barbero.findFirst.mockResolvedValue({ id: "perfil-anterior" });

    expect(await actualizarRolUsuario(cuenta.id, "EMPLEADO")).toEqual({ success: true });
    expect(mocks.barbero.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { usuarioId: null, email: cuenta.email },
    }));
    expect(mocks.barbero.update).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: "perfil-anterior" }),
      data: { usuarioId: cuenta.id, email: cuenta.email },
    }));
    expect(mocks.barbero.upsert).not.toHaveBeenCalled();
  });

  it("crea un único perfil provisional sin copiar el nombre de acceso", async () => {
    mocks.barbero.upsert.mockResolvedValue({ id: "perfil-nuevo" });

    expect(await actualizarRolUsuario(cuenta.id, "EMPLEADO")).toEqual({ success: true });
    expect(mocks.barbero.upsert).toHaveBeenCalledWith({
      where: { usuarioId: cuenta.id },
      update: {},
      create: { nombre: "Sin nombre", email: cuenta.email, usuarioId: cuenta.id },
      select: { id: true },
    });

    mocks.usuario.update.mockResolvedValue({ ...cuenta, name: null });
    mocks.barbero.findUnique.mockResolvedValue({ id: "perfil-nuevo", email: cuenta.email });
    expect(await actualizarRolUsuario(cuenta.id, "EMPLEADO")).toEqual({ success: true });
    expect(mocks.barbero.upsert).toHaveBeenCalledTimes(1);
  });

  it("rechaza el cambio sin autorización o con un identificador vacío", async () => {
    mocks.requerirAdmin.mockResolvedValueOnce(null);

    expect(await actualizarRolUsuario(cuenta.id, "EMPLEADO")).toMatchObject({ error: "No autorizado" });
    expect(await actualizarRolUsuario("", "EMPLEADO")).toMatchObject({ error: "Datos de rol inválidos" });
    expect(mocks.transaccion).not.toHaveBeenCalled();
  });
});
