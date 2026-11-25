export const urlBaseDatos = process.env.DATABASE_URL;

export function obtenerOpcionesConexion() {
  if (!urlBaseDatos?.trim()) {
    throw new Error("Definí DATABASE_URL para conectar con la base de datos");
  }

  try {
    const url = new URL(urlBaseDatos);
    const host = url.hostname.startsWith("[") ? url.hostname.slice(1, -1) : url.hostname;
    const port = Number(url.port || 3306);
    const user = decodeURIComponent(url.username);
    const password = decodeURIComponent(url.password);
    const database = decodeURIComponent(url.pathname.slice(1));

    if (url.protocol !== "mysql:" || !host || !user || !database || database.includes("/") || port === 0 || url.hash) {
      throw new Error();
    }

    const esLocal = ["localhost", "127.0.0.1", "::1"].includes(host.toLowerCase());
    const usarTls = !esLocal || url.searchParams.get("sslaccept") === "strict";

    return {
      host,
      port,
      user,
      password,
      database,
      ssl: usarTls && { rejectUnauthorized: true },
      connectionLimit: 5,
      connectTimeout: 10000,
    };
  } catch {
    throw new Error("DATABASE_URL debe ser una URL mysql:// válida con servidor, usuario y base de datos");
  }
}

let ambito: Promise<string> | undefined;

/** Identifica el destino para la caché y las sesiones. La contraseña queda fuera del cálculo. */
export function obtenerAmbitoBaseDatos() {
  if (!urlBaseDatos) return null;
  if (ambito) return ambito;

  const { host, port, database, user } = obtenerOpcionesConexion();
  // Un servidor compartido puede dirigir cada usuario a un clúster distinto.
  const destino = new TextEncoder().encode(JSON.stringify([host.toLowerCase(), port, database, user]));
  ambito = crypto.subtle.digest("SHA-256", destino).then((hash) =>
    Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join(""),
  );
  return ambito;
}
