import { headers } from "next/headers";

export async function obtenerIp(): Promise<string> {
  const encabezados = await headers();
  const reenviada = encabezados.get("x-forwarded-for");
  if (reenviada) return reenviada.split(",")[0].trim();
  return encabezados.get("x-real-ip") ?? "desconocida";
}
