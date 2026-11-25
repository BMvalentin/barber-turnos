import { cachearConsulta } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

const obtenerDiasLaboralesActivosCacheados = cachearConsulta(
  async () => prisma.dia_laboral.findMany({
    where: { estado: true },
    include: {
      margenes: { where: { estado: true }, orderBy: { desde: "asc" } },
    },
    orderBy: { dia: "asc" },
  }),
  ["dias-laborales-activos-v1"],
  { tags: ["dias-laborales"], revalidate: 300 },
);

export async function obtenerDiasLaboralesActivos() {
  return obtenerDiasLaboralesActivosCacheados();
}
