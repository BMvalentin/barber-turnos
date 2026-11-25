import { unstable_cache } from "next/cache";
import { obtenerAmbitoBaseDatos } from "@/lib/conexion-base-datos";

export function cachearConsulta<Argumentos extends unknown[], Resultado>(
  consultar: (...argumentos: Argumentos) => Promise<Resultado>,
  claves: string[],
  opciones: { tags: string[]; revalidate: number },
) {
  return async (...argumentos: Argumentos): Promise<Resultado> => {
    const ambito = await obtenerAmbitoBaseDatos();
    if (!ambito) return consultar(...argumentos);

    return unstable_cache(consultar, [ambito, ...claves], opciones)(...argumentos);
  };
}

export async function getCachedData<T>(
  keyParts: string[],
  tags: string[],
  fetcher: () => Promise<T>,
  revalidate: number = 300
): Promise<T> {
  return cachearConsulta(fetcher, keyParts, { tags, revalidate })();
}
