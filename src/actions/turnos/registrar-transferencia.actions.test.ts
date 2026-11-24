import { beforeEach, describe, expect, it, vi } from "vitest";
import { registrarTransferencia } from "./registrar-transferencia.actions";

const mocks = vi.hoisted(() => ({
  leerTurno: vi.fn(),
  leerConfiguracion: vi.fn(),
  registrar: vi.fn(),
  autorizar: vi.fn(),
  revalidar: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    turno: { findUnique: mocks.leerTurno, updateMany: mocks.registrar },
    pageConfig: { findUnique: mocks.leerConfiguracion },
  },
}));
vi.mock("@/lib/seguridad/requerir-propietario", () => ({ requerirPropietarioOAdmin: mocks.autorizar }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidar }));

const turno = {
  userId: "cliente",
  estado: "PENDIENTE",
  estadoPago: "PENDIENTE",
  metodoPago: null,
  precioCongelado: 1000,
  seniaCongelada: 500,
};
const configuracionActiva = {
  transferenciaTitular: "Titular de prueba",
  transferenciaCuit: "cuit",
  transferenciaAlias: "alias",
  transferenciaCbu: "cbu",
  transferenciaBanco: "banco",
  transferenciaActiva: true,
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.leerTurno.mockResolvedValue(turno);
  mocks.autorizar.mockResolvedValue({ user: { id: "cliente" } });
  mocks.leerConfiguracion.mockResolvedValue(configuracionActiva);
  mocks.registrar.mockResolvedValue({ count: 1 });
});

describe("registrar transferencia", () => {
  it("lee la configuración vigente y registra el pago en revisión al reintentar", async () => {
    expect(await registrarTransferencia("turno", "SEÑA")).toEqual({ success: true });
    mocks.leerTurno.mockResolvedValue({ ...turno, estadoPago: "EN_ACREDITACION", metodoPago: "TRANSFERENCIA" });
    expect(await registrarTransferencia("turno", "SEÑA")).toEqual({ success: true });

    expect(mocks.leerConfiguracion).toHaveBeenCalledTimes(2);
    expect(mocks.registrar).toHaveBeenLastCalledWith(expect.objectContaining({
      data: { tipoPago: "SEÑA", metodoPago: "TRANSFERENCIA", estadoPago: "EN_ACREDITACION" },
    }));
  });

  it("rechaza el intento cuando se desactiva la transferencia", async () => {
    mocks.leerConfiguracion.mockResolvedValue({ ...configuracionActiva, transferenciaActiva: false });
    expect(await registrarTransferencia("turno", "SEÑA")).toMatchObject({ success: false });
    expect(mocks.registrar).not.toHaveBeenCalled();
  });

  it("rechaza una entrada inválida y una sesión no autorizada antes de leer la configuración", async () => {
    expect(await registrarTransferencia("", "SEÑA")).toMatchObject({ success: false });
    expect(mocks.leerTurno).not.toHaveBeenCalled();

    mocks.autorizar.mockResolvedValue(null);
    expect(await registrarTransferencia("turno", "TOTAL")).toEqual({ success: false, error: "No autorizado" });
    expect(mocks.leerConfiguracion).not.toHaveBeenCalled();
    expect(mocks.registrar).not.toHaveBeenCalled();
  });

  it("conserva el estado del turno si cambió durante la operación", async () => {
    mocks.registrar.mockResolvedValue({ count: 0 });
    expect(await registrarTransferencia("turno", "TOTAL")).toMatchObject({ success: false });
    expect(mocks.revalidar).not.toHaveBeenCalled();
  });
});
