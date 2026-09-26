import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client"; // Verifica que esta ruta exista físicamente

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const sslStatus =
  process.env.DATABASE_HOST === "localhost" ||
  process.env.DATABASE_HOST === "127.0.0.1"
    ? false
    : true;

const puertoBaseDatos = process.env.DATABASE_PORT === undefined
  ? 3306
  : Number(process.env.DATABASE_PORT);
if (!Number.isInteger(puertoBaseDatos) || puertoBaseDatos < 1 || puertoBaseDatos > 65535) {
  throw new Error("DATABASE_PORT debe ser un puerto válido");
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaMariaDb({
      host: process.env.DATABASE_HOST,
      port: puertoBaseDatos,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      ssl: sslStatus
        ? { rejectUnauthorized: true }
        : false,
      connectionLimit: 5,
      connectTimeout: 10000,
    }),
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
