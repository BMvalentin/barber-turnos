import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";
import { obtenerOpcionesConexion, urlBaseDatos } from "@/lib/conexion-base-datos";

const globalForPrisma = globalThis as typeof globalThis & {
  conexionPrisma?: { url: string | undefined; cliente: PrismaClient };
};

const conexionAnterior = globalForPrisma.conexionPrisma;

export const prisma = conexionAnterior && conexionAnterior.url === urlBaseDatos
  ? conexionAnterior.cliente
  : new PrismaClient({
      adapter: new PrismaMariaDb(obtenerOpcionesConexion()),
      log: ["error", "warn"],
    });

if (process.env.NODE_ENV !== "production" && conexionAnterior?.cliente !== prisma) {
  globalForPrisma.conexionPrisma = { url: urlBaseDatos, cliente: prisma };
  void conexionAnterior?.cliente.$disconnect().catch(() => {
    console.error("No se pudo cerrar la conexión anterior de Prisma.");
  });
}
