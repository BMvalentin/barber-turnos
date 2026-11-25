import { Auth } from "@auth/core";
import type { NextAuthConfig } from "next-auth";
import { encode, type JWT } from "next-auth/jwt";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { crearAdaptador, guardarEnCache } = vi.hoisted(() => ({
  crearAdaptador: vi.fn<(opciones: { database: string }) => void>(),
  guardarEnCache: vi.fn<(claves: string[], opciones: object) => void>(),
}));

vi.mock("@prisma/adapter-mariadb", () => ({
  PrismaMariaDb: class {
    constructor(opciones: { database: string }) {
      crearAdaptador(opciones);
    }
  },
}));

vi.mock("../../generated/prisma/client", () => ({
  PrismaClient: class {
    $disconnect = vi.fn().mockResolvedValue(undefined);
  },
}));

vi.mock("next/cache", () => ({
  unstable_cache: (consulta: unknown, claves: string[], opciones: object) => {
    guardarEnCache(claves, opciones);
    return consulta;
  },
}));

function recargarConBase(base: string, contrasena = "prueba", usuario = "usuario") {
  vi.stubEnv("DATABASE_URL", `mysql://${usuario}:${contrasena}@localhost:3306/${base}`);
  vi.resetModules();
}

async function leerSesion(configuracion: NextAuthConfig, token: JWT): Promise<unknown> {
  const secret = "secreto-sintetico-para-pruebas";
  const salt = "authjs.session-token";
  const cookie = await encode({ token, secret, salt });
  const request = new Request("http://localhost/api/auth/session", {
    headers: { cookie: `${salt}=${cookie}` },
  });
  const respuesta = await Auth(request, {
    ...configuracion,
    secret,
    basePath: "/api/auth",
    trustHost: true,
  });
  return respuesta.json();
}

beforeEach(() => {
  vi.stubGlobal("conexionPrisma", undefined);
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("cambio de base de datos", () => {
  it("reutiliza Prisma para la misma URL y reemplaza el cliente al cambiarla", async () => {
    recargarConBase("base_a");
    const anterior = (await import("./prisma")).prisma;
    recargarConBase("base_a");
    expect((await import("./prisma")).prisma).toBe(anterior);
    expect(anterior.$disconnect).not.toHaveBeenCalled();

    recargarConBase("base_b");
    const actual = (await import("./prisma")).prisma;
    expect(actual).not.toBe(anterior);
    expect(crearAdaptador.mock.calls.map(([opciones]) => opciones.database)).toEqual(["base_a", "base_b"]);
    expect(anterior.$disconnect).toHaveBeenCalledOnce();
  });

  it("rechaza una URL inválida en lugar de seguir usando la conexión anterior", async () => {
    recargarConBase("base_a");
    await import("./prisma");

    vi.stubEnv("DATABASE_URL", "url-invalida");
    vi.resetModules();
    await expect(import("./prisma")).rejects.toThrow("DATABASE_URL debe ser una URL mysql:// válida");
    expect(crearAdaptador).toHaveBeenCalledOnce();
  });

  it("cambia las claves de Next por destino y conserva las etiquetas de revalidación", async () => {
    const consultar = async (id: number) => id;
    const opciones = { tags: ["servicios"], revalidate: 300 };
    const leer = async () => (await import("./cache")).cachearConsulta(consultar, ["catalogo"], opciones)(1);

    recargarConBase("base_a");
    await expect(leer()).resolves.toBe(1);
    recargarConBase("base_a", "otra-contrasena");
    await leer();
    recargarConBase("base_b");
    await leer();
    recargarConBase("base_a", "prueba", "usuario-otro-cluster");
    await leer();

    const [[clavesAnteriores], [clavesMismoDestino], [clavesNuevas], [clavesOtroCluster]] =
      guardarEnCache.mock.calls;
    expect(clavesMismoDestino).toEqual(clavesAnteriores);
    expect(clavesNuevas).not.toEqual(clavesAnteriores);
    expect(clavesOtroCluster).not.toEqual(clavesAnteriores);
    expect(clavesNuevas[1]).toBe("catalogo");
    expect(guardarEnCache).toHaveBeenLastCalledWith(clavesOtroCluster, opciones);
  });

  it("acepta la sesión en su base y rechaza una sesión de otra base o sin ámbito", async () => {
    const usuario = { id: "mismo-id", role: "ADMIN" as const, telefono: null };
    recargarConBase("base_a");
    const { authConfig } = await import("@/auth.config");
    const token = await authConfig.callbacks.jwt({ token: {}, user: usuario, account: null, trigger: "signIn" });
    expect(token).toMatchObject({ id: usuario.id, role: usuario.role });
    if (!token) throw new Error("No se emitió la sesión de prueba");

    await expect(leerSesion(authConfig, token)).resolves.toMatchObject({ user: { id: usuario.id, role: usuario.role } });
    await expect(leerSesion(authConfig, { id: usuario.id, telefono: null })).resolves.toBeNull();

    recargarConBase("base_b");
    const { authConfig: configNuevaBase } = await import("@/auth.config");
    await expect(leerSesion(configNuevaBase, token)).resolves.toBeNull();
  });

  it("aísla los turnos guardados en el navegador aunque coincida el ID del usuario", async () => {
    const dataset = { ambitoBaseDatos: "base-a" };
    const almacen = new Map<string, string>();
    vi.stubGlobal("document", { documentElement: { dataset } });
    vi.stubGlobal("window", {
      localStorage: {
        get length() { return almacen.size; },
        key: (indice: number) => [...almacen.keys()][indice] ?? null,
        getItem: (clave: string) => almacen.get(clave) ?? null,
        setItem: (clave: string, valor: string) => almacen.set(clave, valor),
      },
    });
    const { guardarTurnosUsuarioCacheLocal, leerTurnosUsuarioCacheLocal } =
      await import("@/components/dashboard/turnos-usuario-cache-local");
    const datos = { historial: { turnos: [], paginaActual: 1, totalPaginas: 1 }, proximos: [] };

    guardarTurnosUsuarioCacheLocal("mismo-id", datos);
    expect(leerTurnosUsuarioCacheLocal("mismo-id")).toEqual(datos);
    dataset.ambitoBaseDatos = "base-b";
    expect(leerTurnosUsuarioCacheLocal("mismo-id")).toBeNull();
  });
});
