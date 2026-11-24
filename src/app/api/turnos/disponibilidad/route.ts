import { z } from "zod";
import { calcularCapacidadMensual, obtenerCapacidadMensualCacheada } from "@/lib/disponibilidad-mensual-cacheada";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { MAX_BARBEROS_POR_CONSULTA } from "@/lib/turnos/capacidad-horaria";

const esquemaId = z.string().min(1).max(191);
const esquemaConsulta = z.object({
  mes: z.string().regex(/^[1-9]\d{3}-(0[1-9]|1[0-2])$/),
  barberos: z.array(esquemaId).min(1).max(MAX_BARBEROS_POR_CONSULTA),
  turnoIdAExcluir: esquemaId.optional(),
  actualizar: z.literal("1").optional(),
}).refine(({ barberos, turnoIdAExcluir, actualizar }) =>
  (!turnoIdAExcluir && !actualizar) || barberos.length === 1,
);

export async function GET(request: Request) {
  const parametros = new URL(request.url).searchParams;
  const consulta = esquemaConsulta.safeParse({
    mes: parametros.get("mes"),
    barberos: parametros.getAll("barberoId"),
    turnoIdAExcluir: parametros.get("turnoIdAExcluir") ?? undefined,
    actualizar: parametros.get("actualizar") ?? undefined,
  });
  const headers = { "Cache-Control": "private, no-store" };
  if (!consulta.success) return Response.json([], { status: 400, headers });

  const { mes, barberos, turnoIdAExcluir, actualizar } = consulta.data;
  const sesion = turnoIdAExcluir ? await requerirAdmin() : await requerirSesion();
  if (!sesion) return Response.json([], { status: 403, headers });

  const calcular = actualizar ? calcularCapacidadMensual : obtenerCapacidadMensualCacheada;
  const resultados = await Promise.allSettled([...new Set(barberos)].map(async (barberoId) => ({
    barberoId,
    capacidad: await calcular(mes, barberoId, turnoIdAExcluir),
  })));
  const agendas = resultados.flatMap((resultado) => resultado.status === "fulfilled" ? [resultado.value] : []);
  return Response.json(agendas, { status: agendas.length ? 200 : 503, headers });
}
