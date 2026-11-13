import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PageConfigData } from "@/types/page-config";

const mocks = vi.hoisted(() => ({
  upsert: vi.fn(),
  requerirAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { pageConfig: { upsert: mocks.upsert } } }));
vi.mock("@/lib/seguridad/requerir-admin", () => ({ requerirAdmin: mocks.requerirAdmin }));
vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
  revalidateTag: mocks.revalidateTag,
}));

import { updatePageConfig } from "./config-general.actions";

describe("updatePageConfig: aviso de seña pendiente", () => {
  beforeEach(() => {
    mocks.requerirAdmin.mockResolvedValue({ user: { id: "admin-1" } });
    mocks.upsert.mockResolvedValue({});
  });

  afterEach(() => vi.clearAllMocks());

  it.each([true, false])("guarda el switch en %s", async (activo) => {
    const resultado = await updatePageConfig({ mostrarAvisoSeniaPendiente: activo });

    expect(resultado.success).toBe(true);
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 1 },
      update: { mostrarAvisoSeniaPendiente: activo },
      create: expect.objectContaining({ mostrarAvisoSeniaPendiente: activo }),
    }));
    expect(mocks.revalidateTag).toHaveBeenCalledWith("page-config");
  });

  it("usa true al crear la configuración sin un valor previo", async () => {
    const resultado = await updatePageConfig({ name: "Mi barbería" });

    expect(resultado.success).toBe(true);
    expect(mocks.upsert.mock.calls[0]?.[0].create.mostrarAvisoSeniaPendiente).toBe(true);
  });

  it("rechaza una llamada si quien la realiza no es administrador", async () => {
    mocks.requerirAdmin.mockResolvedValue(null);

    const resultado = await updatePageConfig({ mostrarAvisoSeniaPendiente: false });

    expect(resultado).toEqual({ success: false, error: "No autorizado" });
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it("rechaza un valor que no sea booleano", async () => {
    const datoInvalido: unknown = { mostrarAvisoSeniaPendiente: "false" };

    const resultado = await updatePageConfig(datoInvalido as PageConfigData);

    expect(resultado.success).toBe(false);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
});
