import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  claveDisponibilidad,
  consultarDisponibilidadMensual,
  invalidarDisponibilidadLocal,
  precargarDisponibilidadMensual,
} from "./disponibilidad-cliente";

const almacen = new Map<string, string>();
const pedir = vi.fn<(ruta: string) => Promise<Response>>();
const mes = "2026-11";
const fecha = "2026-11-30";
const capacidad = { [fecha]: [[Date.parse("2026-11-30T18:00:00Z"), 30]] };

beforeEach(() => {
  vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-11-23T18:00:00Z"));
  pedir.mockReset();
  almacen.clear();
  vi.stubGlobal("fetch", pedir);
  vi.stubGlobal("window", {
    localStorage: {
      get length() { return almacen.size; },
      key: (indice: number) => [...almacen.keys()][indice] ?? null,
      getItem: (clave: string) => almacen.get(clave) ?? null,
      setItem: (clave: string, valor: string) => almacen.set(clave, valor),
      removeItem: (clave: string) => almacen.delete(clave),
    },
  });
  invalidarDisponibilidadLocal("uno", fecha);
  invalidarDisponibilidadLocal("dos", fecha);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("precarga y caché de disponibilidad", () => {
  it("precarga ambos barberos juntos y reutiliza la consulta al seleccionar uno", async () => {
    pedir.mockResolvedValue(Response.json([
      { barberoId: "uno", capacidad },
      { barberoId: "dos", capacidad: {} },
    ]));

    precargarDisponibilidadMensual(mes, ["uno", "dos"]);
    await expect(consultarDisponibilidadMensual(mes, "uno")).resolves.toMatchObject({ capacidad });
    await expect(consultarDisponibilidadMensual(mes, "dos")).resolves.toMatchObject({ capacidad: {} });
    expect(pedir).toHaveBeenCalledTimes(1);
    expect(pedir.mock.calls[0][0]).toContain("barberoId=uno&barberoId=dos");
    expect(almacen.size).toBe(2);
  });

  it("recupera la agenda tras recargar y vuelve a consultar exactamente a los 15 minutos", async () => {
    const inicio = Date.now();
    pedir.mockImplementation(async () => Response.json([{ barberoId: "uno", capacidad }]));
    await consultarDisponibilidadMensual(mes, "uno");

    const clave = claveDisponibilidad(mes, "uno");
    const persistida = almacen.get(clave);
    expect(persistida).toBeDefined();
    invalidarDisponibilidadLocal("uno", fecha);
    if (persistida) almacen.set(clave, persistida);
    vi.mocked(Date.now).mockReturnValue(inicio + 15 * 60_000 - 1);
    await consultarDisponibilidadMensual(mes, "uno");
    expect(pedir).toHaveBeenCalledTimes(1);

    vi.mocked(Date.now).mockReturnValue(inicio + 15 * 60_000);
    await consultarDisponibilidadMensual(mes, "uno");
    expect(pedir).toHaveBeenCalledTimes(2);
  });

  it("descarta una precarga tardía cuando el horario se ocupó y se pide una agenda nueva", async () => {
    let responderPrecarga: (respuesta: Response) => void = () => {};
    pedir.mockImplementationOnce(() => new Promise((resolver) => { responderPrecarga = resolver; }));
    pedir.mockResolvedValueOnce(Response.json([{ barberoId: "uno", capacidad: {} }]));

    const precarga = consultarDisponibilidadMensual(mes, "uno");
    invalidarDisponibilidadLocal("uno", fecha);
    await expect(consultarDisponibilidadMensual(mes, "uno", undefined, true)).resolves.toMatchObject({ capacidad: {} });
    responderPrecarga(Response.json([{ barberoId: "uno", capacidad }]));

    await expect(precarga).resolves.toMatchObject({ capacidad: {} });
    await expect(consultarDisponibilidadMensual(mes, "uno")).resolves.toMatchObject({ capacidad: {} });
    expect(pedir.mock.calls[1][0]).toContain("actualizar=1");
  });

  it("reintenta después de un fallo y mantiene la agenda de edición fuera de localStorage", async () => {
    const exclusion = { turnoId: "turno", usuarioId: "administrador" };
    pedir.mockResolvedValueOnce(new Response(null, { status: 503 }));
    pedir.mockResolvedValueOnce(Response.json([{ barberoId: "uno", capacidad }]));

    await expect(consultarDisponibilidadMensual(mes, "uno", exclusion)).resolves.toBeUndefined();
    await expect(consultarDisponibilidadMensual(mes, "uno", exclusion)).resolves.toMatchObject({ capacidad });
    expect(pedir.mock.calls[1][0]).toContain("turnoIdAExcluir=turno");
    expect(almacen.size).toBe(0);
  });
});
